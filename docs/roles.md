# 👥 Team Roles & Responsibilities

This document outlines the organizational structure, individual ownership areas, and core technical responsibilities for the engineering team building and maintaining the **iMovies** cinema platform.

---

## 📊 Contribution Breakdown Matrix

| Role | Title / Focus Area | Core Responsibilities | Modules Owned | Primary Technologies |
| :--- | :--- | :--- | :--- | :--- |
| **Lead Full-Stack Architect** | System Design & Full-Stack Integration | • Overall system design, MVC layering, and architectural integrity<br>• Real-time WebSocket synchronization (`Socket.io`)<br>• Technical review, schema design, and production deployment | `server/server.js`<br>`client/src/App.jsx`<br>`docs/*` | Node.js, Express, React 18, Socket.io, Vite, Git |
| **Backend Engineer** | REST API, Database & Logic Layer | • Schema design, compound indexing, and validation models<br>• Show scheduling engine & multi-theater matrix (6 shows/day)<br>• Dynamic time validation (`timeHelper.js`) and 2-hour cancellation engine | `server/controllers/*`<br>`server/models/*`<br>`server/routes/*` | MongoDB, Mongoose, Express.js, Day.js, UUID |
| **Frontend UI/UX Engineer** | Client Application & Interactive Components | • Interactive multi-tier seat layout & adjacent cinema screen placement<br>• Date selection tabs & dynamic theater location filter pills<br>• Dark/Light theme context, responsive Bootstrap & custom CSS | `client/src/pages/*`<br>`client/src/components/*`<br>`client/src/context/*` | React 18, Bootstrap 5, FontAwesome, CSS Grid/Flexbox |
| **Security & Payment Specialist** | Auth, Gateway & Financial Operations | • Stateless JWT authentication & Role-Based Access Control (RBAC)<br>• Razorpay 5-step transaction lifecycle & HMAC-SHA256 signature verification<br>• Admin user management & account revocation safeguards | `server/middlewares/*`<br>`server/controllers/paymentController.js`<br>`server/controllers/authController.js` | Razorpay SDK, Crypto, Bcryptjs, JWT |
| **Communications & Cloud Engineer** | Transactional Messaging & Public Sharing | • Brevo (Sendinblue) transactional email service integration (OTP, tickets)<br>• Public unauthenticated ticket viewer (`/tickets/view/:bookingId`)<br>• Dynamic QR code generation & Web Share / WhatsApp integration | `server/services/emailService.js`<br>`client/src/pages/PublicTicketView.jsx`<br>`client/src/components/TicketModal.jsx` | Brevo API, QRCode, Web Share API, Nodemailer |
| **DevOps & QA Automation Engineer** | CI/CD, Deployment & Automated Testing | • Render backend deployment & Vercel frontend hosting configuration<br>• Environment variable safety fallback & configuration audit<br>• Automated test suites, build pipeline validation, and bug audits | `package.json`<br>`client/vite.config.js`<br>`server/seed.js` | Render, Vercel, Vite Build, Postman, Node Test Runner |

---

## 🛠️ Detailed Role Descriptions

### 1. Lead Full-Stack Architect
* **Architectural Oversight**: Defines system boundaries, directory structuring, and ensures clean decoupling between client state and server models.
* **WebSocket Orchestration**: Implements Socket.io rooms per show (`join:show`) and orchestrates real-time events (`seats:locked`, `seats:booked`, `seats:released`).
* **Cross-Cutting Concerns**: Configures CORS middleware, centralized error handling, and API client interceptors.

### 2. Backend & Database Engineer
* **Mongoose Schema Modeling**: Authors schemas for `User`, `Admin`, `Movie`, `Theatre`, `Show`, `Booking`, `Review`, and `Favorite`.
* **Multi-Theater Showtime Engine**: Provisions 6 distinct daily showtimes per theater (`showController.js`) and ensures conflict-free scheduling.
* **Time Synchronization Logic**: Develops `parseShowDateTime`, `isShowExpired`, and `getCancellationEligibility` utilities to enforce real-world clock validation.

### 3. Frontend UI/UX Engineer
* **Seat Map Engineering**: Builds `SeatSlug.jsx` with Balcony (₹300), Middle (₹200), and Lower (₹150) tiers, with the curved screen beam positioned directly adjacent to the budget-friendly front rows.
* **Responsive Multi-Theater Selection**: Implements `MovieShows.jsx` featuring dynamic theater filter pills, 7-day date carousels, and expiration status badges.
* **Accessibility**: Ensures proper ARIA labels, semantic landmark roles, and responsive mobile viewports.

### 4. Security & Payment Specialist
* **Authentication Pipeline**: Implements bcrypt salted password hashing (10 rounds) and JWT issuance with role claims (`user` vs `admin`).
* **Privilege Escalation Prevention**: Hardens public registration routes so client-injected role parameters cannot grant administrative privileges.
* **Razorpay Gateway Orchestration**: Implements order generation in paise, client-side checkout modal invocation, and cryptographic server-side verification using HMAC-SHA256.

### 5. Communications & Cloud Engineer
* **Brevo Integration**: Configures transactional email client with robust fallbacks, graceful startup on cloud platforms, and retry handlers.
* **Dynamic E-Tickets**: Implements `qrcode` data-URL synthesis with structured JSON payloads containing booking references and validation URLs.
* **Public Link Sharing**: Creates dedicated, unauthenticated ticket routes (`/tickets/view/:bookingId`) with native Web Share API and clipboard copy fallbacks.

### 6. DevOps & QA Automation Engineer
* **Cloud Infrastructure**: Manages live continuous deployment pipelines on Render (Node server) and Vercel (React client).
* **Database Seeding**: Maintains `server/seed.js` to seed realistic demo data, theater configurations, and movie listings.
* **Verification & Audit**: Validates production builds with `npm run build` and conducts regression testing on API endpoints.

---

## 🤝 Development Standards & Workflow

* **Branching Strategy**: All functional updates originate from feature branches or direct pair-programming sessions with commits pushed to `main`.
* **Commit Conventions**: Standard Conventional Commits:
  - `feat:` New user-facing or backend features
  - `fix:` Bug fixes or security patches
  - `docs:` Documentation and architecture diagrams
  - `refactor:` Code improvements without behavioral changes
* **Quality Gates**:
  1. `npm run build` must compile cleanly with 0 TypeScript/Vite bundle errors.
  2. All server routes must pass static syntax checking (`node -c server.js`).
  3. No secrets or API credentials may be committed to version control.
