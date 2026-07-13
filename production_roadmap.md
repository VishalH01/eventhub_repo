# 🚀 EventHub: Advanced Application Feature Roadmap

This roadmap outlines high-impact, industry-grade features that can be implemented directly within the existing stack (**React**, **Spring Boot**, and **MySQL**) without requiring external infrastructure, third-party messaging queues, or memory caches.

---

## 📋 Glossary of Expanded Technical Terms

*   **Create, Read, Update, and Delete (CRUD)**:
    *   *Long Form*: Create, Read, Update, and Delete.
    *   *Meaning*: The four basic functions of persistent data storage in a database system.
*   **Database Management System (DBMS)**:
    *   *Long Form*: Database Management System.
    *   *Meaning*: System software for creating and managing databases (in this project, MySQL).
*   **Application Programming Interface (API)**:
    *   *Long Form*: Application Programming Interface.
    *   *Meaning*: A set of rules and specifications that allow different software programs to communicate with each other.
*   **Portable Document Format (PDF)**:
    *   *Long Form*: Portable Document Format.
    *   *Meaning*: The file format used to present documents in a manner independent of hardware or software.
*   **Quick Response Code (QR Code)**:
    *   *Long Form*: Quick Response Code.
    *   *Meaning*: A two-dimensional barcode containing scanned data.
*   **Jakarta Persistence API (JPA)**:
    *   *Long Form*: Jakarta Persistence Application Programming Interface.
    *   *Meaning*: The standard framework in Java for mapping objects to database tables.

---

## 🎟️ 1. Multi-Ticket Attendee Details & Custom Passes
*   **Concept**: When booking multiple seats (for example, seats A1, A2, and A3), the system currently associates all seats with the primary booker. An industry-grade app allows the user to enter the individual name and email address of each attendee.
*   **How to Build**:
    *   **Database Schema Update**: Modify the Registration Seat entity or create a new `TicketAttendee` table linking to the booking, storing seat code, attendee name, and attendee email.
    *   **Frontend Check-out Form**: When seats are selected, display input fields for each seat so the buyer can type their guest details.
    *   **Backend Automation**: The backend loop compiles individual Portable Document Format (PDF) ticket passes for each attendee containing their custom name and a unique Quick Response (QR) Code. It then mails each ticket directly to the respective guest's email.

## ✍️ 2. Verified Attendee Reviews & Star Ratings
*   **Concept**: Allow users to leave ratings and text feedback on events, but restrict it strictly to users who actually purchased a ticket and attended (Verified Purchase).
*   **How to Build**:
    *   **Database Schema**: Create an `EventReview` table: `id`, `user_id`, `event_id`, `rating` (1 to 5 integer), `comment`, and `created_at`.
    *   **Business Logic Constraint**: Before saving a review, query the registration database to confirm that the user has a confirmed booking for that event.
    *   **Frontend Display**: Show the average rating and count of reviews at the top of the event page, and display a list of comments at the bottom.

## 🕒 3. Self-Service Booking Cancellations & Smart Refunds
*   **Concept**: Allow users to cancel their bookings and automatically calculate refund amounts based on cancellation timelines.
*   **How to Build**:
    *   **Database Model**: Add a `refunded_amount` column and update registration statuses to include a `CANCELLED` state.
    *   **Business Rules Engine**:
        *   Cancellation > 48 hours before event: 100% refund.
        *   Cancellation between 24 and 48 hours: 50% refund.
        *   Cancellation < 24 hours: No refund allowed.
    *   **Seating Grid Release**: When a cancellation is processed, immediately update the event's seating map, marking those seats as available for other users to book.

## 📋 4. Database-Backed Booking Waitlist System
*   **Concept**: If an event sells out, instead of blocking bookings, allow users to join a waitlist. If an active booking is cancelled, the system automatically offers the seat to the first person on the waitlist.
*   **How to Build**:
    *   **Database Table**: Create an `EventWaitlist` table: `id`, `user_id`, `event_id`, `position` (integer representing queue rank), and `created_at`.
    *   **Automated Queue Promotion**: Write a database transaction hook: when a booking status changes to `CANCELLED`, query the waitlist for the highest-ranking user, create a pending booking for them, and send an email notification giving them 12 hours to complete checkout.

## 🔍 5. Advanced Search, Filter & Multi-Criteria Sorting
*   **Concept**: Enhance catalog discovery by allowing users to search and filter events dynamically.
*   **How to Build**:
    *   **Backend Specifications**: Implement dynamic query specifications using Spring Data JPA Criteria Application Programming Interface (API) to search across title, description, category, price ranges, and dates.
    *   **Frontend Control Drawer**: Build a filter sidebar on the events page with:
        *   Price range slider (Minimum to Maximum ticket cost).
        *   Category checkboxes.
        *   Availability toggle (Hide sold-out events).
        *   Sort dropdown (Sort by Date, Price Low-to-High, or popularity based on reservation counts).

## 🛠️ 6. Interactive Admin Seating Map Layout Designer
*   **Concept**: Instead of admins typing seating rows and columns as plain numbers, give them a grid builder where they can visually mark certain seats as "Blocked" (e.g., space reserved for sound booths, wheelchair access, or broken seats) before publishing.
*   **How to Build**:
    *   **Database Schema**: Add a `blocked_seats` column (storing a comma-separated string of seat codes like "A5, B5") to the Event entity.
    *   **Frontend Grid builder**: In the Admin Event Creation Form, render a mock grid. The admin can click seats to toggle them between "Blocked" and "Available". Blocked seats are saved and locked out from the user booking screen.

---

## ✅ Implementation & Completion Status

All features listed in this roadmap have been fully implemented, integrated, and verified to compile and run cleanly:

1.  **Multi-Ticket Guest Registrations**: Complete E2E (End-to-End) flow. Guest details are captured during selection, custom PDF (Portable Document Format) passes with unique QR (Quick Response) Codes are generated, and email invitations are sent.
2.  **Verified Purchase Reviews & Star Ratings**: Complete E2E flow. Reviews are validated against confirmed bookings and displayed.
3.  **Self-Service Cancellations & Refund Rules**: Complete E2E flow. Soft cancellations release seats immediately, calculating refunds dynamically based on a 48h/24h schedule.
4.  **Database-Backed Event Waitlist**: Complete E2E flow. Integrates automatic top-of-queue promotion during ticket cancellation.
5.  **Advanced Search, Filter, & Sorting**: Complete E2E flow. Custom JPQL (Java Persistence Query Language) specifications query filters and apply sorting criteria dynamically.
6.  **Interactive Admin Layout Designer**: Complete E2E flow. Admins visually block seats on a grid creator, which disable booking options in the customer selection view.
