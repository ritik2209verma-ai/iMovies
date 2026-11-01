# 🏛️ iMovies System Architecture & MVC Design

The **iMovies** cinema platform is designed using the **Model-View-Controller (MVC)** architectural pattern, decoupled into a **React 18 Single-Page Application (SPA)** client and a **Node.js/Express.js RESTful API** backend with real-time **WebSocket (Socket.io)** synchronization and cloud integrations (**Razorpay**, **Brevo / Sendinblue**, and **TMDB**).

---

## 📐 High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT TIER (React 18 + Vite)                         │
│  ┌───────────────────────┐  ┌─────────────────────────┐  ┌───────────────────┐  │
│  │ User Pages & Modals   │  │ Admin Dashboard Suite   │  │ Public Ticket View│  │
│  │ (Landing, Home, Seat) │  │ (Stats, Users, Shows)   │  │ (/tickets/view/)  │  │
│  └───────────┬───────────┘  └────────────┬────────────┘  └─────────┬─────────┘  │
│              │                           │                         │            │
│              ▼                           ▼                         ▼            │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │         Axios API Client (JWT Interceptor) + Socket.io Real-Time Client    │  │
│  └───────────────────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────────────────┼──────────────────────────────────────┘
                                           │ HTTPS (REST) / WSS (WebSocket)
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SERVER TIER (Node.js + Express)                       │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ HTTP Request Middleware Pipeline (CORS, Express JSON, Auth/RBAC Guards)   │  │
│  └───────────────────────────────────────┬───────────────────────────────────┘  │
│                                          │                                      │
│                                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                               CONTROLLERS                                 │  │
│  │  authController       • showController      • paymentController           │  │
│  │  bookingController    • theatreController   • adminController             │  │
│  │  movieController      • reviewController    • emailController             │  │
│  └───────────────────┬───────────────────┬───────────────────┬───────────────┘  │
│                      │                   │                   │                  │
│       ┌──────────────┘                   │                   └──────────────┐   │
│       ▼                                  ▼                                  ▼   │
│  ┌──────────────┐              ┌──────────────────┐              ┌──────────────┐
│  │    MODELS    │              │  EXTERNAL CLOUD  │              │  SOCKET.IO   │
│  │  (Mongoose)  │              │   INTEGRATIONS   │              │  REAL-TIME   │
│  │ • User       │              │ • Razorpay API   │              │ • Room Join  │
│  │ • Movie      │              │ • Brevo API      │              │ • Seat Lock  │
│  │ • Theatre    │              │ • TMDB Live API  │              │ • Seat Book  │
│  │ • Show       │              └──────────────────┘              │ • Broadcast  │
│  │ • Booking    │                                                └──────────────┘
│  │ • Review     │                                                               │
│  └──────┬───────┘                                                               │
└─────────┼───────────────────────────────────────────────────────────────────────┘
          │ Mongoose ODM (Binary JSON Protocol)
          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE TIER (MongoDB)                               │
│  Collections: users, admins, movies, theatres, shows, bookings, reviews, favs  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ 1. Models (Data Layer)

All domain entities are modeled using **Mongoose schemas** with strict validations, indexes, and lifecycle hooks located in `server/models/`:

### 1.1 `User` (`server/models/userModel.js`)
* **Purpose**: Manages authenticated customers and their verification standing.
* **Key Fields**:
  - `username` (String, unique, trimmed, minlength 3)
  - `email` (String, unique, lowercase, trimmed)
  - `password` (String, bcrypt salted hash)
  - `role` (String, enum: `['user', 'admin']`, default: `'user'`)
  - `isVerified` (Boolean, default: `false`)
  - `verificationOtp`, `verificationOtpExpires` (String, Date)
  - `verificationToken`, `verificationTokenExpires` (String, Date)
  - `resetPasswordOtp`, `resetPasswordOtpExpires` (String, Date)
  - `resetPasswordToken`, `resetPasswordExpires` (String, Date)

### 1.2 `Admin` (`server/models/adminModel.js`)
* **Purpose**: Represents dedicated administrative accounts isolated from public registration.
* **Key Fields**:
  - `username` (String, unique)
  - `email` (String, unique, lowercase)
  - `password` (String, bcrypt salted hash)
  - `role` (String, default: `'admin'`)

### 1.3 `Movie` (`server/models/movieModel.js`)
* **Purpose**: Stores movie catalog entries, metadata, and media links.
* **Key Fields**:
  - `movieName` (String, required)
  - `description` (String, required)
  - `genres` ([String], required)
  - `releaseDate` (Date, required)
  - `language` (String)
  - `duration` (Mixed: String or Number)
  - `certification` (String, e.g., 'U', 'UA', 'A')
  - `posterUrl`, `trailerUrl`, `backdropUrl` (String URLs)
  - `cast`, `director` ([String], String)

### 1.4 `Theatre` (`server/models/theatreModel.js`)
* **Purpose**: Represents multiplexes, screens, seating tier geometries, and schedules.
* **Key Fields**:
  - `theatreId` (String, unique UUID)
  - `theatreName` (String, required)
  - `location` (String, required)
  - `screenName` (String, default: `'Audi 1'`)
  - `facilities` ([String], e.g. `'IMAX Laser 3D'`, `'Dolby Atmos'`)
  - `balconySeatPrice`, `middleSeatPrice`, `lowerSeatPrice` (Numbers)
  - `showtimes` ([String], 6 distinct daily showtimes)
  - `balconySeats`, `middleSeats`, `lowerSeats` (`{ rows: Number, cols: Number }`)

### 1.5 `Show` (`server/models/showModel.js`)
* **Purpose**: Represents a specific movie screening on a given date, time, and theater screen with real-time seat inventory.
* **Key Fields**:
  - `showId` (String, unique UUID)
  - `movieId` (String, foreign ref to Movie)
  - `theatreId`, `theatreName`, `screenName` (Strings)
  - `showDate` (String: `YYYY-MM-DD`)
  - `showTime` (String: `HH:MM AM/PM`)
  - `tickets` (Mixed dictionary mapping `seatId` to `{ seatId, row, col, tier, status, price, lockExpiry, lockedBy, bookedBy }`)
* **Compound Indexes**:
  - `{ movieId: 1, showDate: 1, theatreId: 1 }`
  - `{ theatreId: 1, showDate: 1, showTime: 1 }`

### 1.6 `Booking` (`server/models/bookingModel.js`)
* **Purpose**: Immutable financial and admission record of reserved tickets.
* **Key Fields**:
  - `bookingId` (String, unique UUID)
  - `userEmail` (String, lowercase)
  - `showId`, `movieId`, `movieName`, `theatreId`, `theatreName`
  - `showDate`, `showTime`, `posterUrl`
  - `selectedSeats` ([String], e.g. `['D4', 'D5']`)
  - `ticketsData` (Snapshot of ticket objects at time of purchase)
  - `totalAmount` (Number in INR)
  - `paymentStatus` (Enum: `['Pending', 'Completed', 'Failed', 'Cancelled', 'Refunded']`)
  - `paymentMethod` (String, default: `'Razorpay'`)
  - `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`
  - `refundId`, `refundAmount`, `refundStatus`

### 1.7 `Review` & `Favorite` (`server/models/reviewModel.js`, `favoriteModel.js`)
* **Purpose**: Social rating and user preference tracking.
* **Key Fields**:
  - `Review`: `{ userEmail, username, movieId, rating (1-5), reviewText }` (Indexed `{ userEmail: 1, movieId: 1 }`)
  - `Favorite`: `{ userEmail, movieId }` (Indexed unique `{ userEmail: 1, movieId: 1 }`)

---

## 🎮 2. Controllers (Business Logic Layer)

Controllers process requests, enforce validation, interact with models, invoke third-party services, and emit WebSocket events:

| Controller | File Path | Core Responsibilities |
| :--- | :--- | :--- |
| **`authController`** | `server/controllers/authController.js` | User registration, bcrypt password hashing, Brevo email verification (OTP + Token), login JWT generation, password recovery reset flows. |
| **`adminController`** | `server/controllers/adminController.js` | Admin authentication, system dashboard metrics aggregation, registered user list with booking statistics, admin account creation, user account revocation. |
| **`showController`** | `server/controllers/showController.js` | Dynamic showtime scheduling (6 shows/day per theater), multi-theater show retrieval, auto-provisioning schedules, conflict detection, real-world system clock expiration tagging (`isShowExpired`). |
| **`theatreController`** | `server/controllers/theatreController.js` | Theater CRUD, seating tier dimension configuration, pricing management, amenity listings. |
| **`movieController`** | `server/controllers/movieController.js` | Movie catalog CRUD, TMDB live API proxying, genre and country filtering, search indexing. |
| **`bookingController`** | `server/controllers/bookingController.js` | 10-minute seat holding (`lockSeats`), booking creation, strict 2-hour cutoff ticket cancellation engine (`cancelBooking`), unauthenticated public ticket verification endpoint (`getPublicTicket`), user booking history. |
| **`paymentController`** | `server/controllers/paymentController.js` | Razorpay order generation (`create-order`), cryptographic HMAC-SHA256 signature verification (`verify`), instant automated refunds on cancellation. |
| **`reviewController`** | `server/controllers/reviewController.js` | User review submission, average movie star calculation, duplicate review restriction. |
| **`favoriteController`** | `server/controllers/favoriteController.js` | User bookmarking/favorite toggle, watchlist retrieval. |
| **`emailController`** | `server/controllers/emailController.js` | Brevo transactional email delivery, webhook handling, and delivery diagnostics. |

---

## 🖥️ 3. Views (Presentation Layer)

In the iMovies MERN architecture, the "View" layer consists of two distinct components:

### 3.1 Client-Side Single Page Application (React 18 + Vite)
* **User Presentation**:
  - `Landing.jsx` & `Home.jsx`: Hero carousels, genre pills, TMDB live discovery, country filtering.
  - `MovieDetails.jsx`: Synopsis, certification badges, trailer player modal, user reviews, cast cards.
  - `MovieShows.jsx`: Date selector tabs, interactive theater location filter pills, dynamic showtime chips (6 daily shows) with real-world time expiration badges.
  - `SeatSlug.jsx`: Dynamic seating grid (Balcony, Middle, Lower), screen orientation adjacent to the lowest-priced tier, 10-minute hold countdown timer, Razorpay checkout modal trigger.
  - `Bookings.jsx`: User ticket dashboard, cancellation button with 2-hour policy modal, ticket receipt modal.
  - `PublicTicketView.jsx`: Unauthenticated public view for `/tickets/view/:bookingId` displaying dynamic scannable QR code, movie poster, and admission credentials.
* **Admin Presentation**:
  - `Admin.jsx`: Real-time KPI stats cards, revenue charts, quick actions.
  - `AdminUsers.jsx`: Interactive registered user list, email verification standing, total booking counts, account deletion confirmation.
  - `AddMovie.jsx`, `AddTheatre.jsx`, `AddShow.jsx`: Dynamic creation forms with pre-fill showtime chips.
  - `AdminBookings.jsx` & `AdminTransactions.jsx`: Financial tables, CSV export, instant refund triggers.

### 3.2 Server-Side Response Views
* **Standardized JSON Envelope**:
  ```json
  {
    "success": true,
    "message": "Operation completed successfully",
    "data": { ... }
  }
  ```
* **HTML Transactional Email Views**:
  - Styled responsive HTML emails generated in `server/services/emailService.js` for account activation, OTP verification, password reset, and booking confirmation receipts.

---

## 🔄 4. Request-Response Lifecycle & Data Flow

### 4.1 Standard REST API Request Lifecycle
```
Client HTTP Request (Axios)
       │
       ▼
Express App Middleware Pipeline:
  1. cors() -> Validates origin (Vercel, localhost)
  2. express.json() -> Parses JSON body
  3. express.urlencoded() -> Parses query params
       │
       ▼
Routing Layer (`server/routes/*.js`):
  Matches URL path (e.g. `/api/bookings/lock`)
       │
       ▼
Security Guard Middleware (`server/middlewares/`):
  • `fetchUser`: Verifies JWT Bearer token in headers, extracts `req.user`
  • `fetchAdmin`: Enforces administrative role check
       │
       ▼
Controller Handler (`server/controllers/*.js`):
  • Validates payload parameters
  • Executes business rules (e.g. `isShowExpired()`, cancellation cutoff)
  • Queries / updates Mongoose models
       │
       ▼
Database Execution:
  MongoDB reads / writes with atomic operations
       │
       ▼
Side Effects (Optional):
  • WebSocket broadcast (`io.to(showId).emit(...)`)
  • External API calls (Razorpay, Brevo Email)
       │
       ▼
Controller JSON Response sent to Client
```

---

### 4.2 Real-Time Seat Locking & Reservation Flow

```
User A (Seat Selection)                 Server / Socket.io              User B (Simultaneous Viewer)
         │                                       │                                   │
         ├─── Emit `join:show` (showId) ─────────┼─── Joins room `showId`            │
         │                                       │                                   │
         ├─── Click Seat 'D4' & 'D5'             │                                   │
         ├─── POST `/api/bookings/lock` ─────────► Check seat availability           │
         │                                       │ Mark seats: { status: 'locked',   │
         │                                       │   lockedBy: userA,                │
         │                                       │   lockExpiry: now + 10m }         │
         │                                       │                                   │
         │◄── HTTP 200 (Seats Locked 10m) ───────┤                                   │
         │    Start 10-minute countdown          ├─── Broadcast `seats:locked` ──────► Seat 'D4', 'D5'
         │                                       │    to room `showId`               │ turn YELLOW (Locked)
         │                                       │                                   │
         ├─── Proceed to Pay (Razorpay)          │                                   │
         │    Order created -> Modal payment     │                                   │
         ├─── POST `/api/payment/verify` ────────► Verify HMAC signature             │
         │                                       │ Mark seats: { status: 'booked',   │
         │                                       │   bookedBy: userA }               │
         │                                       │ Create Booking in DB              │
         │                                       │ Trigger Brevo confirmation email  │
         │                                       │                                   │
         │◄── HTTP 200 (Payment Confirmed) ──────┤                                   │
         │    Navigate to Ticket / Confirmation  ├─── Broadcast `seats:booked` ──────► Seat 'D4', 'D5'
         │                                       │    to room `showId`               │ turn RED (Booked)
```

---

### 4.3 Ticket Cancellation & Inventory Release Flow

```
User (My Bookings)                               Server (Booking Controller)                   Database / Brevo
       │                                                      │                                       │
       ├─── Click "Cancel Ticket"                             │                                       │
       │    Evaluates `getCancellationEligibility()`          │                                       │
       │                                                      │                                       │
       ├─── Policy Check: (ShowTime - CurrentTime) >= 2 hrs?   │                                       │
       │    • If < 2 hrs: Button disabled in UI                │                                       │
       │    • If >= 2 hrs: Open Confirmation Modal             │                                       │
       │                                                      │                                       │
       ├─── Confirms Cancellation ────────────────────────────► PUT `/api/bookings/cancel/:id`        │
       │                                                      │ Verify ownership (user or admin)      │
       │                                                      │ Enforce strict 2-hr backend check:    │
       │                                                      │ diffHours >= 2.0                      │
       │                                                      │                                       │
       │                                                      │ Update Booking status to 'Cancelled' ─► MongoDB
       │                                                      │ Reset Show seats to 'available' ──────► MongoDB
       │                                                      │                                       │
       │                                                      │ Dispatch Brevo cancellation email ────► Brevo API
       │                                                      │ Emit `seats:released` to room ────────► Socket.io
       │◄── HTTP 200 (Cancelled & Seats Released) ────────────┤                                       │
       │    Refresh booking list & UI notification            │                                       │
```

---

## 🛡️ 5. Security & Authentication Architecture

1. **Password Encryption**: All passwords stored using **bcryptjs** with an adaptive salt factor (10 rounds).
2. **Stateless JWT Authorization**: Signed using `process.env.JWT_SECRET` with user identity payload (`{ user: { id: user._id, email: user.email, role: user.role } }`).
3. **Role-Based Access Control (RBAC)**:
   - `fetchUser`: Authenticates regular customer token.
   - `fetchAdmin`: Enforces administrative rights; regular user tokens cannot access `/api/admin/*` endpoints.
   - Registration endpoint locks role assignment: public signups strictly force `role: 'user'` to eliminate privilege escalation attacks.
4. **Payment Integrity**: Razorpay payment verification re-computes `crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id).digest('hex')` to match client signatures before issuing tickets.
5. **CORS & Environment Isolation**: Configured dynamic origin reflection allowing authorized development origins (`localhost:5173`) and production frontends (`vercel.app`).
