# Full Stack Event Management Platform

Welcome to the Event Management Platform! This project is a full-stack web application built from scratch to help users register for events, complete secure payments via Razorpay, and receive QR codes for attendance verification. Admins can manage events, view analytics, and trace registrations/payments.

---

## Current Status: Phase 1 Completed

We have successfully initialized the Spring Boot backend, connected it to the local MySQL instance, and verified the configuration.

### Completed Features (Phase 1)
- **Spring Boot Project Setup**: Configured with Spring Web, Spring Data JPA, and Spring Security.
- **MySQL Connection**: Connected to the local database `event_management_db` using JDBC and Hibernate.
- **Project Structure**: Organized in a clean monorepo layout separating `backend/` and `frontend/`.

---

## Folder Structure

```text
d:\Intern_Assign\
├── .gitignore              # Root Git ignore rules (ignores IDE settings, etc.)
├── README.md               # Project documentation (this file)
└── backend/                # Spring Boot backend application
    ├── pom.xml             # Maven dependencies configuration
    ├── mvnw / mvnw.cmd     # Maven wrapper scripts
    └── src/
        └── main/
            ├── java/com/eventplatform/
            │   ├── EventPlatformApplication.java   # Main entry point
            │   ├── config/                         # Configuration classes
            │   ├── controller/                     # REST API Controllers
            │   ├── dto/                            # Data Transfer Objects
            │   ├── entity/                         # JPA Entities (Database Tables)
            │   ├── repository/                     # Spring Data JPA Repositories
            │   └── service/                        # Business Logic Services
            └── resources/
                └── application.properties          # Database & JPA settings
```

---

## Database Configuration

The application is configured to connect to MySQL on `localhost:3306` with the database `event_management_db`.

In `backend/src/main/resources/application.properties`:
- **Database URL**: `jdbc:mysql://localhost:3306/event_management_db`
- **Username**: `root`
- **Password**: `Vishal@2004`
- **JPA Dialect**: `MySQLDialect`
- **Hibernate DDL Auto**: `update` (automatically synchronizes Java entities to MySQL tables)

---

## How to Run the Backend Locally

1. **Prerequisites**:
   - Install **Java 21** (or higher).
   - Ensure a local **MySQL** service is running on port `3306`.
   - Create the database `event_management_db`:
     ```sql
     CREATE DATABASE event_management_db;
     ```

2. **Run Application**:
   Navigate to the `backend` folder and run the Maven wrapper:
   ```bash
   cd backend
   # On Windows (PowerShell):
   .\mvnw.cmd spring-boot:run
   # On macOS/Linux:
   ./mvnw spring-boot:run
   ```

3. **Verify Startup**:
   The console will output:
   `Tomcat started on port 8080 (http) with context path '/'`
   `Started EventPlatformApplication in ... seconds`

---

## Git Commit History
* `feat: Phase 1 - Initialize Spring Boot Backend & Connect MySQL`