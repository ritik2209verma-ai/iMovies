# 🎬 iMovies - Full-Stack Movie Ticket Booking & Cinema Management Platform

A modern, production-grade MERN stack movie booking platform featuring live market movies via TMDB, real-time interactive seat maps with hold locking using WebSockets, Razorpay payment processing (Cards, UPI, Netbanking), automated Brevo transactional email ticket confirmations & OTP verification, dynamic QR pass generation, WhatsApp digital ticket sharing, and an advanced Admin Management Suite.

---

## 📁 Project Documentation

Comprehensive technical documentation, architecture blueprints, database schemas, and workflows are available in the [`docs/`](./docs) directory:

| Document | Description | Link |
| :--- | :--- | :--- |
| **🏛️ System Architecture** | Detailed MVC pattern implementation, Mongoose models, Express controllers, React presentation views, request-response lifecycles, and real-time Socket.io events. | [`docs/architecture.md`](./docs/architecture.md) |
| **👥 Team Roles & Responsibilities** | Complete team contribution breakdown matrix detailing module ownership, core tasks, and engineering roles. | [`docs/roles.md`](./docs/roles.md) |
| **📊 Entity-Relationship (ER) Diagram** | Database schema design, primary/foreign keys, cardinality associations, and compound indexes across all 8 collections. | [`docs/diagrams/er-diagram.md`](./docs/diagrams/er-diagram.md) |
| **🗺️ User Flow & Journey Diagram** | Complete customer journey from landing page discovery through showtimes, seat holding, Razorpay checkout, QR verification, and 2-hour cancellation. | [`docs/diagrams/user-flow.md`](./docs/diagrams/user-flow.md) |
| **🎨 Visual Diagrams Overview** | Index and visual guide for all Mermaid.js diagrams. | [`docs/diagrams/README.md`](./docs/diagrams/README.md) |

---

## ✨ Features

### 🌟 Customer Experience
- **Live Market Movies from TMDB:** Fetches the latest blockbusters, trailers, synopsis, cast, and ratings directly from The Movie Database (TMDB) API.
- **Dynamic Filtering:** Filter movies by **Genre** (Action, Comedy, Drama, Sci-Fi, Horror, etc.) and **Country/Location** (India, USA, South Korea, UK, Japan, etc.).
- **Real-Time Seat Booking:** Interactive multi-tiered cinema layout (Balcony, Middle, Lower).
- **10-Minute Hold Locking:** Powered by **Socket.io** to prevent double-booking. Locked seats expire automatically if payment is not completed within 10 minutes.
- **Razorpay Payment Gateway:** Integrated test-mode checkout supporting credit/debit cards, netbanking, and UPI (Google Pay, PhonePe, Paytm, BHIM, QR code).
- **Automated Email Confirmations:** Sends styled HTML tickets to customer emails upon booking confirmation via Nodemailer.
- **Digital Ticket & WhatsApp Sharing:** Printable tickets with simulated QR pass and a 1-click **Share to WhatsApp** action.
- **Dark & Light Mode:** Seamless theme toggling with persistent state management across the app.
- **User Profile Management:** Edit personal details and manage booking histories.

### 🛡️ Admin Suite & Role-Based Access Control (RBAC)
- **Role Isolation:** Strict role validation (`admin` vs `user`). Public signups are strictly constrained to `role: 'user'`, preventing privilege escalation.
- **Admin Dashboard & Analytics:** Real-time metrics for total revenue, active theatres, scheduled shows, and user base.
- **Movie, Theatre & Showtime Management:** Create, edit, and schedule shows across custom seating configurations and price tiers.
- **Transactions & Refund Management:** View all user payments and issue instant Razorpay refunds directly from the admin panel, automatically freeing up reserved seats in real time.
- **Protected Admin Provisioning:** Super-admin protected route (`POST /api/admin/create-admin`) to securely provision new administrator accounts.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router DOM v6, Bootstrap 5, FontAwesome, React Toastify, Axios, Socket.io-client
- **Backend:** Node.js, Express.js, MongoDB with Mongoose, Socket.io, JWT (JSON Web Tokens), Bcrypt.js
- **Integrations:**
  - **TMDB API** (Movie Discovery, Trailers & Metadata)
  - **Razorpay** (Payment Processing, UPI / Cards / QR, & Instant Refunds)
  - **Brevo / Sendinblue** (Transactional Emails, Account Verification OTP, Password Recovery, & E-Ticket Delivery)
  - **QRCode** (Dynamic Scannable Pass Generation)

---

## 📁 Project Structure

```text
iMovies/
├── docs/                       # Project Documentation & Architecture
│   ├── architecture.md         # MVC pattern, controllers, models, request lifecycle
│   ├── roles.md                # Team roles, responsibilities & contribution matrix
│   └── diagrams/               # Visual system diagrams
│       ├── er-diagram.md       # Entity-Relationship diagram (Mermaid.js)
│       ├── user-flow.md        # User journey flowchart (Mermaid.js)
│       └── README.md           # Visual diagrams index
│
├── client/                     # React Frontend (Vite SPA)
│   ├── src/
│   │   ├── components/         # Navbar, MovieCard, Modals, Checkout, TicketModal
│   │   ├── context/            # ThemeContext (Dark / Light)
│   │   ├── hooks/              # Custom data fetching hooks
│   │   ├── pages/              # Landing, Home, SeatSlug, Bookings, AdminUsers, etc.
│   │   └── utils/              # API interceptors, guards, timeHelper, whatsapp
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express Backend
│   ├── config/                 # Email and environment configuration
│   ├── controllers/            # Auth, Movie, Theatre, Show, Booking, Admin, Payment
│   ├── middlewares/            # fetchUser, fetchAdmin RBAC guards
│   ├── models/                 # User, Admin, Movie, Theatre, Show, Booking, Review
│   ├── routes/                 # Express API endpoints
│   ├── services/               # Brevo transactional email & TMDB services
│   ├── utils/                  # timeHelper, cron cleanup & mailers
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/ritik2209verma-ai/iMovies.git
cd iMovies
```

### 2. Configure Backend Environment
Navigate to `server/` and create `.env` based on `.env.example`:
```bash
cd server
cp .env.example .env
```
Fill in your credentials:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/imovies
JWT_SECRET=your_secret_key
TMDB_API_KEY=your_tmdb_api_key
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Install backend dependencies and start the server:
```bash
npm install
npm run dev   # or: node server.js
```

### 3. Configure Frontend Environment
Navigate to `client/` and create `.env` based on `.env.example`:
```bash
cd ../client
cp .env.example .env
```
Fill in your Razorpay Key:
```env
VITE_RAZORPAY_KEY_ID=your_razorpay_id
```

Install frontend dependencies and start the Vite dev server:
```bash
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser!

---

## 🔒 Security & RBAC Enforcement

- Public signup `/api/auth/register` and `/api/auth/signup` will always default to `role: 'user'`, ignoring any client-injected role fields.
- Admin creation `/api/admin/create-admin` requires both a verified admin JWT and active record check in MongoDB.
- Razorpay payment webhooks / signature verification validate transaction integrity using HMAC-SHA256 before confirming ticket bookings.

---

## 📜 License
MIT License. Created by [ritik2209verma-ai](https://github.com/ritik2209verma-ai).
