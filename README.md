# Full Stack Event Management Platform

Welcome to the Event Management Platform! This project is a full-stack web application built from scratch to help users register for events, complete secure payments via Razorpay, and receive QR codes for attendance verification. Admins can manage events, view analytics, and trace registrations/payments.

---

## Current Status: Phase 6 Completed

We have successfully implemented **Phase 6: Event Registration (Book Ticket)** on both the backend and frontend.

### Completed Features
#### Phase 1: Backend Initialization
- **Spring Boot Project Setup**: Configured with Spring Web, Spring Data JPA, and Spring Security.
- **MySQL Connection**: Connected to the local database `event_management_db` using JDBC and Hibernate.
- **Project Structure**: Organized in a clean monorepo layout.

#### Phase 2: Frontend Setup
- **React JS & Vite**: Initialized a React JS project.
- **Tailwind CSS Integration**: Configured Tailwind CSS v3 with PostCSS.
- **Routing Setup**: Configured `react-router-dom` routing paths.
- **Axios HTTP Client**: Set up a centralized API service with a request interceptor for JWT headers.
- **Modular Components & Pages**: Created global `Navbar` and `Layout` components, along with initial pages.

#### Phase 3: Database Design & JPA Entities
- **JPA Mappings**: Created and annotated Java entity classes.
- **Table Relationships**: Established Many-to-Many, Many-to-One, and One-to-One constraints.
- **Hibernate DDL Auto-Generation**: Ran application to auto-generate tables in MySQL.

#### Phase 4: JWT Authentication (Role-Based Access)
- **Dependencies Added**: Added Java JWT (JJWT) to `pom.xml`.
- **Spring Security Configuration**: Configured CORS, disabled CSRF, set sessions to stateless, and wired custom security filters.
- **Stateless JWT Validation**: Configured utility class to issue, parse, and validate tokens without querying the database on every request.
- **Role Seeding**: Configured automatic startup seeding for `ROLE_USER` and `ROLE_ADMIN` roles.
- **Test Accounts Seeding**: Pre-loaded accounts:
  - User: `user@eventhub.com` / Password: `user123` (Regular permissions)
  - Admin: `admin@eventhub.com` / Password: `admin123` (Administrator permissions)
- **Auth REST APIs**: Exposed register and login endpoints.
- **Frontend Integration**: Hooked up React login/register pages to backend APIs, saving JWT tokens in `localStorage`, showing responsive alerts, and updating the navigation header dynamically.

#### Phase 5: Events CRUD & Search/Filters
- **Backend JPQL Search Query**: Written `EventRepository` to support text keywords searching (against title/description) and category filtering in a single optimized database call.
- **Event REST APIs**: Created event services and controller exposing standard CRUD operations (public read, admin-only modify).
- **Frontend Events Feed & Filtering**: Integrated the Browse Events feed, supporting live keywords input and categories dropdown filters with Axios request parameters.
- **Frontend Event Details View**: Built a dedicated event page (`EventDetails.jsx`) loading detail logistics (Title, Description, Date/Time, Venue, Price) using React Router's path ID parameter.
- **Admin CRUD Dashboard**: Implemented full event management in the Admin Dashboard, enabling admins to create, update, and delete events via reusable forms.

#### Phase 6: Event Registration (Book Ticket)
- **Ticket Booking API**: Created `POST /api/registrations/book/{eventId}` to dynamically reserve pending tickets. Extracted logged-in user context statelessly from Spring's Security principal.
- **Duplicate Booking Prevention**: Built database existence checks returning clear validation responses if a user books the same event twice.
- **Registrations Listing API**: Exposed `GET /api/registrations/my` to let logged-in users fetch their personalized ticketing list.
- **Secure Ownership Cancellation**: Created `DELETE /api/registrations/{id}` with strict verification checks to ensure users can only cancel their own bookings.
- **Frontend Panel Integration**: Wired booking handlers in `EventDetails.jsx` and built a registrations manager layout in `MyRegistrations.jsx` supporting live API fetches, cancellations, and rendering visual attendance QR codes for `CONFIRMED` tickets.

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
│       │   ├── config/
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── EventController.java
│       │   │   └── RegistrationController.java # Registration REST endpoints
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── repository/
│       │   │   ├── RoleRepository.java
│       │   │   ├── UserRepository.java
│       │   │   ├── EventRepository.java
│       │   │   └── RegistrationRepository.java # Booking queries layer
│       │   ├── security/
│       │   └── service/
│       │       ├── AuthService.java
│       │       ├── EventService.java
│       │       ├── RegistrationService.java
│       │       └── RegistrationServiceImpl.java # Booking business logic
│       └── main/resources/application.properties
└── frontend/               # React JS frontend application
```

---

## API Endpoints

### Authentication APIs (`/api/auth`)
| HTTP Method | Endpoint | Description | Access | Request Body (JSON) | Response Body (JSON) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Registers a new user account | Public | `{"name", "email", "password"}` | String message |
| **POST** | `/api/auth/login` | Logins user & returns JWT token | Public | `{"email", "password"}` | `{"accessToken", "tokenType", "email", "name", "roles"}` |

### Event APIs (`/api/events`)
| HTTP Method | Endpoint | Description | Access | Request Parameters | Request Body (JSON) | Response Body (JSON) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/events` | Fetches all events matching search & category filters | Public | `search`, `category` (optional) | None | Event JSON Array |
| **GET** | `/api/events/{id}` | Fetches details of a specific event | Public | None | None | Event JSON Object |
| **POST** | `/api/events` | Creates a new event | Admin | None | Event Object (excluding ID) | Event JSON Object |
| **PUT** | `/api/events/{id}` | Updates properties of an existing event | Admin | None | Event Object (excluding ID) | Event JSON Object |
| **DELETE** | `/api/events/{id}` | Deletes an event | Admin | None | None | String message |

### Registration APIs (`/api/registrations`)
| HTTP Method | Endpoint | Description | Access | Request Body (JSON) | Response Body (JSON) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/registrations/book/{eventId}` | Books a pending ticket for an event | User | None | Registration JSON Object |
| **GET** | `/api/registrations/my` | Fetches bookings list of the logged-in user | User | None | Registration JSON Array |
| **DELETE** | `/api/registrations/{id}` | Cancels a registration booking | User | None | String message |

---

## Database Schema Design (MySQL)

We established 5 core tables + 1 junction table in the `event_management_db` database:
- `roles`: ID and unique role name.
- `users`: ID, name, email, and password.
- `user_roles`: Many-to-Many join table mapping users to roles.
- `events`: Event listings details.
- `registrations`: Tickets bookings.
- `payments`: Razorpay transaction details (1:1 with registrations).

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
* `feat: Phase 4 - Implement Spring Security & JWT Authentication`
* `feat: Phase 5 - Implement Events CRUD REST APIs & Search Filters`
* `feat: Phase 6 - Implement Event Registration (Book Ticket) APIs`