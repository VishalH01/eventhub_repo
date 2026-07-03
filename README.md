# Full Stack Event Management Platform

Welcome to the Event Management Platform! This project is a full-stack web application built from scratch to help users register for events, complete secure payments via Razorpay, and receive QR codes for attendance verification. Admins can manage events, view analytics, and trace registrations/payments.

---

## Current Status: Phase 2 Completed

We have successfully initialized the Spring Boot backend (Phase 1) and the React JS frontend (Phase 2) with Tailwind CSS, Axios, and React Router DOM.

### Completed Features
#### Phase 1: Backend Initialization
- **Spring Boot Project Setup**: Configured with Spring Web, Spring Data JPA, and Spring Security.
- **MySQL Connection**: Connected to the local database `event_management_db` using JDBC and Hibernate.
- **Project Structure**: Organized in a clean monorepo layout separating `backend/` and `frontend/`.

#### Phase 2: Frontend Setup
- **React JS & Vite**: Initialized a React JS project powered by Vite for blazing fast development.
- **Tailwind CSS Integration**: Fully configured Tailwind CSS v3 with PostCSS and Autoprefixer for modular, responsive designs.
- **Routing Setup**: Configured `react-router-dom` in `App.jsx` mapping paths (`/`, `/events`, `/my-registrations`, `/admin`, `/login`, `/register`).
- **Axios HTTP Client**: Set up a centralized API service in `services/api.js` with an interceptor to automatically attach JWT headers for authorized requests.
- **Modular Components & Pages**: Created global `Navbar` and `Layout` components, along with initial mock-filled pages (Home, Events, Login, Register, My Registrations, and Admin Dashboard).

---

## Folder Structure

```text
d:\Intern_Assign/
├── .gitignore              # Root Git ignore rules (ignores IDE settings, etc.)
├── README.md               # Project documentation (this file)
├── backend/                # Spring Boot backend application
│   ├── pom.xml             # Maven dependencies configuration
│   └── src/
│       ├── main/java/com/eventplatform/      # Main packages
│       └── main/resources/application.properties
└── frontend/               # React JS frontend application
    ├── package.json        # Node.js dependencies
    ├── vite.config.js      # Vite build settings
    ├── tailwind.config.js  # Tailwind utility setup
    ├── postcss.config.js   # CSS processing config
    ├── index.html          # HTML entry point
    └── src/
        ├── main.jsx        # React DOM render entry
        ├── App.jsx         # Routing & Layout configuration
        ├── index.css       # Tailwind directives
        ├── components/     # Reusable global layout items
        │   ├── Navbar.jsx  # Responsive Navigation bar
        │   └── Layout.jsx  # Main page template wrapper
        ├── pages/          # View/page components
        │   ├── Home.jsx    # Hero landing page
        │   ├── Events.jsx  # Event feed (mock)
        │   ├── Login.jsx   # Login form card
        │   ├── Register.jsx# Account registration form card
        │   ├── MyRegistrations.jsx # Tickets & QR codes page
        │   └── AdminDashboard.jsx  # Admin analytics & tables
        └── services/
            └── api.js      # Axios client with JWT interceptor
```

---

## Database Configuration

The application is configured to connect to MySQL on `localhost:3306` with the database `event_management_db`.
- **Database URL**: `jdbc:mysql://localhost:3306/event_management_db`
- **Username**: `root`
- **Password**: `Vishal@2004`

---

## How to Run the Project Locally

### 1. Run the Backend
Navigate to the `backend` folder and run the Maven wrapper:
```bash
cd backend
# On Windows (PowerShell):
.\mvnw.cmd spring-boot:run
# On macOS/Linux:
./mvnw spring-boot:run
```

### 2. Run the Frontend
Navigate to the `frontend` folder, install Node packages, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## Git Commit History
* `feat: Phase 1 - Initialize Spring Boot Backend & Connect MySQL`
* `feat: Phase 2 - Initialize React JS Frontend, Tailwind CSS, & Routing`