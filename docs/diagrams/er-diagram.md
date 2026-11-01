# 📊 Entity-Relationship (ER) Diagram

The following diagram represents the core data entities, schemas, and relational associations in the **iMovies** MongoDB database modeled via **Mongoose**.

---

## 📐 Mermaid.js ER Diagram

```mermaid
erDiagram
    USER ||--o{ BOOKING : "places"
    USER ||--o{ REVIEW : "writes"
    USER ||--o{ FAVORITE : "bookmarks"
    ADMIN ||--o{ THEATRE : "manages"
    ADMIN ||--o{ SHOW : "schedules"
    MOVIE ||--o{ SHOW : "screened_in"
    MOVIE ||--o{ REVIEW : "receives"
    MOVIE ||--o{ FAVORITE : "saved_as"
    THEATRE ||--o{ SHOW : "hosts"
    SHOW ||--o{ BOOKING : "generates"

    USER {
        ObjectId _id PK
        string username "unique"
        string email "unique, indexed"
        string password "bcrypt hash"
        string role "user | admin"
        boolean isVerified "default: false"
        string verificationOtp
        date verificationOtpExpires
        string verificationToken
        date verificationTokenExpires
        string resetPasswordOtp
        date resetPasswordOtpExpires
        string resetPasswordToken
        date resetPasswordExpires
        date createdAt
        date updatedAt
    }

    ADMIN {
        ObjectId _id PK
        string username "unique"
        string email "unique, indexed"
        string password "bcrypt hash"
        string role "default: admin"
        date createdAt
        date updatedAt
    }

    MOVIE {
        ObjectId _id PK
        string movieName "required, min 2"
        string description "required, min 10"
        array genres "e.g. Action, Sci-Fi"
        date releaseDate "required"
        string language "e.g. English, Hindi"
        mixed duration "duration formatted"
        string certification "e.g. U, UA, A"
        string posterUrl "image URL"
        string trailerUrl "YouTube embed URL"
        array cast "actors list"
        string director "director name"
        date createdAt
        date updatedAt
    }

    THEATRE {
        ObjectId _id PK
        string theatreId "unique UUID, indexed"
        string theatreName "multiplex name"
        string location "city / mall location"
        string screenName "e.g. Audi 1, IMAX"
        string adminEmail "owner admin email"
        number balconySeatPrice "default: 300"
        number middleSeatPrice "default: 200"
        number lowerSeatPrice "default: 150"
        array showtimes "6 distinct daily slots"
        array facilities "e.g. Dolby 7.1, 4K Laser"
        object balconySeats "rows: 3, cols: 10"
        object middleSeats "rows: 5, cols: 12"
        object lowerSeats "rows: 7, cols: 14"
        date createdAt
        date updatedAt
    }

    SHOW {
        ObjectId _id PK
        string showId "unique UUID, indexed"
        string adminEmail "scheduler email"
        string movieId "foreign key -> MOVIE"
        string movieName "cached title"
        string theatreId "foreign key -> THEATRE"
        string theatreName "cached name"
        string screenName "screen identifier"
        string showDate "YYYY-MM-DD, indexed"
        string showTime "HH:MM AM/PM"
        mixed tickets "seatId -> status, tier, price, lockedBy, lockExpiry"
        date createdAt
        date updatedAt
    }

    BOOKING {
        ObjectId _id PK
        string bookingId "unique UUID, indexed"
        string userEmail "customer email, indexed"
        string showId "foreign key -> SHOW"
        string movieId "movie reference"
        string movieName "cached title"
        string posterUrl "movie poster snapshot"
        string theatreId "theater reference"
        string theatreName "cached theater name"
        string showDate "screening date"
        string showTime "screening time"
        mixed ticketsData "snapshot of seats purchased"
        array selectedSeats "e.g. [D4, D5]"
        number totalAmount "grand total INR"
        string paymentStatus "Pending | Completed | Cancelled | Refunded"
        string paymentMethod "Razorpay"
        string razorpayOrderId "gateway order"
        string razorpayPaymentId "gateway payment"
        string razorpaySignature "cryptographic HMAC"
        string refundId "gateway refund"
        number refundAmount "refunded INR"
        string refundStatus "refund state"
        date createdAt
        date updatedAt
    }

    REVIEW {
        ObjectId _id PK
        string userEmail "reviewer email"
        string username "reviewer display name"
        string movieId "foreign key -> MOVIE"
        number rating "1 to 5 stars"
        string reviewText "min 10 characters"
        date createdAt
        date updatedAt
    }

    FAVORITE {
        ObjectId _id PK
        string userEmail "user email"
        string movieId "foreign key -> MOVIE"
        date createdAt
        date updatedAt
    }
```

---

## 🔍 Schema Relationships & Indexing Strategy

### 1. Relationships & Foreign Keys
* **`User -> Booking`**: One-to-many relationship mapped via `userEmail`. Allows fast queries for personal booking history without requiring cross-collection joins.
* **`Show -> Theatre`**: Linked through `theatreId`. The `theatreName`, `screenName`, and pricing tiers are cached in the `Show` document to prevent runtime lookup latency.
* **`Show -> Movie`**: Linked through `movieId`. Movie titles and poster URLs are snapshot into `Booking` records to preserve historical integrity even if movie records are edited later.
* **`Booking -> Show`**: Linked through `showId`. Seat availability in `show.tickets` is updated atomically using Mongoose `$set` operators when seats are locked, booked, or released.

### 2. Compound Indexes for High-Traffic Queries
* **`Show` Collection**:
  - `{ movieId: 1, showDate: 1, theatreId: 1 }`: Optimized for movie-specific schedule lookups with optional date and theater filtering.
  - `{ theatreId: 1, showDate: 1, showTime: 1 }`: Guarantees non-overlapping schedule uniqueness per theater screen.
* **`Review` Collection**:
  - `{ userEmail: 1, movieId: 1 }` (Unique): Enforces one review per user per movie.
* **`Favorite` Collection**:
  - `{ userEmail: 1, movieId: 1 }` (Unique): Eliminates duplicate bookmark entries.
* **`Booking` Collection**:
  - `{ bookingId: 1 }` (Unique): Enables instant lookup for public ticket verification (`/tickets/view/:bookingId`).
  - `{ userEmail: 1, createdAt: -1 }`: Accelerated sorting for user dashboard booking history.
