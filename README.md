# Full Stack Event Management Platform

Welcome to the Event Management Platform! This project is a full-stack web application built from scratch to help users register for events, complete secure payments via Razorpay, and receive QR codes for attendance verification. Admins can manage events, view analytics, and trace registrations/payments.

---

## Current Status: Phase 3 Completed

We have successfully initialized the Spring Boot backend, set up the React frontend, and designed the database schema. In Phase 3, we implemented the Java JPA Entity classes and verified table generation in MySQL.

### Completed Features
#### Phase 1: Backend Initialization
- **Spring Boot Project Setup**: Configured with Spring Web, Spring Data JPA, and Spring Security.
- **MySQL Connection**: Connected to the local database `event_management_db` using JDBC and Hibernate.
- **Project Structure**: Organized in a clean monorepo layout separating `backend/` and `frontend/`.

#### Phase 2: Frontend Setup
- **React JS & Vite**: Initialized a React JS project powered by Vite.
- **Tailwind CSS Integration**: Configured Tailwind CSS v3 with PostCSS and Autoprefixer.
- **Routing Setup**: Configured `react-router-dom` in `App.jsx`.
- **Axios HTTP Client**: Set up a centralized API service with a request interceptor for JWT headers.
- **Modular Components & Pages**: Created global `Navbar` and `Layout` components, along with initial mock-filled pages.

#### Phase 3: Database Design & JPA Entities
- **JPA Mappings**: Created and annotated Java entity classes representing database tables.
- **Table Relationships**: Established Many-to-Many, Many-to-One, and One-to-One constraints.
- **Hibernate DDL Auto-Generation**: Ran the backend application to automatically synchronize Java entities into MySQL database tables.

---

## Folder Structure

```text
d:\Intern_Assign/
├── .gitignore              # Root Git ignore rules (ignores IDE settings, etc.)
├── README.md               # Project documentation (this file)
├── backend/                # Spring Boot backend application
│   ├── pom.xml             # Maven dependencies configuration
│   └── src/
│       ├── main/java/com/eventplatform/
│       │   ├── EventPlatformApplication.java
│       │   └── entity/                 # [NEW] JPA Entities mapping MySQL tables
│       │       ├── Role.java           # User authorization roles
│       │       ├── User.java           # Registered user accounts
│       │       ├── Event.java          # Event listings
│       │       ├── Registration.java   # Event bookings
│       │       └── Payment.java        # Razorpay transactions
│       └── main/resources/application.properties
└── frontend/               # React JS frontend application
```

---

## Database Schema Design (MySQL)

We established 5 core tables + 1 junction table in the `event_management_db` database:

### 1. `roles` Table
Stores user role types (e.g., `ROLE_USER`, `ROLE_ADMIN`).
- `id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR, Unique, Not Null)

### 2. `users` Table
Stores user account details.
- `id` (BIGINT, Primary Key, Auto Increment)
- `name` (VARCHAR, Not Null)
- `email` (VARCHAR, Unique, Not Null)
- `password` (VARCHAR, Not Null) - BCrypt hash

### 3. `user_roles` Table (Junction Table)
Links users to their roles (Many-to-Many relationship).
- `user_id` (BIGINT, Foreign Key referencing `users(id)`)
- `role_id` (INT, Foreign Key referencing `roles(id)`)
- Primary Key is composite: `(user_id, role_id)`

### 4. `events` Table
Stores event listings created by admins.
- `id` (BIGINT, Primary Key, Auto Increment)
- `title` (VARCHAR, Not Null)
- `description` (TEXT)
- `date` (DATETIME(6), Not Null)
- `location` (VARCHAR, Not Null)
- `price` (DOUBLE, Not Null)
- `category` (VARCHAR, Not Null)
- `image_url` (VARCHAR)

### 5. `registrations` Table
Tracks registrations made by users for events.
- `id` (BIGINT, Primary Key, Auto Increment)
- `registration_number` (VARCHAR, Unique, Not Null) - E.g. `REG-178A9B`
- `registration_date` (DATETIME(6), Not Null)
- `status` (VARCHAR, Not Null) - `PENDING`, `CONFIRMED`, `FAILED`
- `user_id` (BIGINT, Foreign Key referencing `users(id)`)
- `event_id` (BIGINT, Foreign Key referencing `events(id)`)

### 6. `payments` Table
Tracks Razorpay order and transaction details.
- `id` (BIGINT, Primary Key, Auto Increment)
- `razorpay_order_id` (VARCHAR, Unique, Not Null)
- `razorpay_payment_id` (VARCHAR, Unique, Nullable until success)
- `razorpay_signature` (VARCHAR, Nullable until success)
- `amount` (DOUBLE, Not Null)
- `status` (VARCHAR, Not Null) - `PENDING`, `SUCCESS`, `FAILED`
- `payment_date` (DATETIME(6), Nullable)
- `registration_id` (BIGINT, Unique, Foreign Key referencing `registrations(id)`) - Enforces 1:1 relationship

---

## How to Run the Project Locally

### 1. Run the Backend
Navigate to the `backend` folder and run the Maven wrapper:
```bash
cd backend
# On Windows (PowerShell):
.\mvnw.cmd spring-boot:run
```

### 2. Run the Frontend
Navigate to the `frontend` folder, install Node packages, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```

---

## Git Commit History
* `feat: Phase 1 - Initialize Spring Boot Backend & Connect MySQL`
* `feat: Phase 2 - Initialize React JS Frontend, Tailwind CSS, & Routing`
* `feat: Phase 3 - Design Database Schema & Create JPA Entity Classes`