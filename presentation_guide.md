# 🎙️ EventHub: Interview Presentation & Explanation Guide

This guide is designed to help you present the **EventHub** project to an interviewer in a structured, high-impact, and professional manner. It breaks down the application's features, explains the technical architecture, provides a step-by-step speech script, and outlines potential technical questions and answers.

---

## 📖 Glossary of Expanded Technical Terms

To ensure absolute clarity during your interview, here is the full expansion and meaning of every technical term and acronym used in this project:

1.  **JSON Web Token (JWT)**:
    *   *Long Form*: JavaScript Object Notation Web Token.
    *   *Meaning*: A compact, URL-safe standard used for securely transmitting information between a client and a server as a JavaScript object. In this project, it is used to keep users logged in securely without storing sessions on the server.
2.  **Single Sign-On (SSO)**:
    *   *Long Form*: Single Sign-On.
    *   *Meaning*: An authentication mechanism that allows a user to access multiple independent software systems with a single set of login credentials. In this project, it allows users to log in instantly using their Google accounts.
3.  **One-Time Password (OTP)**:
    *   *Long Form*: One-Time Password.
    *   *Meaning*: An automatically generated numeric or alphanumeric string that authenticates a user for a single transaction or login session. In this project, it is used to securely verify users who want to reset their forgotten passwords.
4.  **Application Programming Interface (API)**:
    *   *Long Form*: Application Programming Interface.
    *   *Meaning*: A set of defined rules, protocols, and tools that enable different software applications or systems to communicate and exchange data with one another.
5.  **Hash-Based Message Authentication Code Secure Hash Algorithm 256-bit (HMAC-SHA256)**:
    *   *Long Form*: Hash-Based Message Authentication Code Secure Hash Algorithm 256-bit.
    *   *Meaning*: A cryptographic authentication algorithm that combines a hash function with a secret key to verify both the data integrity and the authenticity of a transaction.
6.  **Portable Document Format (PDF)**:
    *   *Long Form*: Portable Document Format.
    *   *Meaning*: A file format developed to present documents (including text formatting and images) in a manner independent of application software, hardware, and operating systems.
7.  **Request for Comments 5545 (RFC 5545)**:
    *   *Long Form*: Request for Comments 5545.
    *   *Meaning*: An official memorandum published by the Internet Engineering Task Force that defines the standard format for calendar data exchange.
8.  **iCalendar file extension (ICS)**:
    *   *Long Form*: iCalendar Calendar file.
    *   *Meaning*: The standard file format for calendar data exchange, allowing users to import calendar meetings into Google Calendar, Microsoft Outlook, or Apple Calendar.
9.  **Scalable Vector Graphics (SVG)**:
    *   *Long Form*: Scalable Vector Graphics.
    *   *Meaning*: An Extensible Markup Language (XML)-based vector image format for two-dimensional graphics that supports scaling, interactivity, and styling with Cascading Style Sheets (CSS).
10. **Comma-Separated Values (CSV)**:
    *   *Long Form*: Comma-Separated Values.
    *   *Meaning*: A delimited text file that uses a comma to separate values, commonly used to transfer structured table data between databases and spreadsheets.
11. **End-to-End (E2E)**:
    *   *Long Form*: End-to-End.
    *   *Meaning*: A software testing methodology used to verify that the entire system flow performs as designed from the very beginning to the final output.
12. **Jakarta Persistence API (JPA)**:
    *   *Long Form*: Jakarta Persistence Application Programming Interface (formerly Java Persistence Application Programming Interface).
    *   *Meaning*: A Java specification that standardizes how Java objects are mapped to relational database tables, enabling object-relational mapping.
13. **Representational State Transfer (REST)**:
    *   *Long Form*: Representational State Transfer.
    *   *Meaning*: An architectural style for building web services that communicate over Hypertext Transfer Protocol (HTTP) using standard operations (GET, POST, PUT, DELETE).
14. **Software as a Service (SaaS)**:
    *   *Long Form*: Software as a Service.
    *   *Meaning*: A software distribution model where applications are hosted by a provider and made available to customers over the internet.
15. **Quick Response Code (QR Code)**:
    *   *Long Form*: Quick Response Code.
    *   *Meaning*: A type of two-dimensional matrix barcode containing readable data that can be scanned using camera lenses.
16. **Java Specification Request 380 (JSR-380)**:
    *   *Long Form*: Java Specification Request 380.
    *   *Meaning*: The official Java specification for Bean Validation 2.0, defining metadata constraints (such as `@NotNull` or `@Email`) on Java objects.
17. **Create, Read, Update, and Delete (CRUD)**:
    *   *Long Form*: Create, Read, Update, and Delete.
    *   *Meaning*: The four basic functions of persistent storage in database applications.
18. **Indian Rupee (INR)**:
    *   *Long Form*: Indian Rupee.
    *   *Meaning*: The official currency of the Republic of India.
19. **Blowfish Crypt Algorithm (BCrypt)**:
    *   *Long Form*: Blowfish Crypt Algorithm.
    *   *Meaning*: A password-hashing function based on the Blowfish cipher that incorporates a random string (salt) to protect against rainbow table dictionary attacks.
20. **Software Development Kit (SDK)**:
    *   *Long Form*: Software Development Kit.
    *   *Meaning*: A collection of software development tools in one installable package that facilitates the creation of applications.

---

## 📋 1. Project Overview & Architecture

### **What is EventHub?**
EventHub is a premium, secure, full-stack Event Management and Interactive Ticket Booking Platform. It enables users to browse events, select specific seats from a dynamic visual seating layout, make simulated secure payments, and receive programmatic Portable Document Format (PDF) passes with attached iCalendar (ICS) calendar invitations. It also equips administrators with controls to manage events, seed promotion coupons, promote or demote users, monitor real-time Scalable Vector Graphics (SVG) analytics, and export Comma-Separated Values (CSV) data.

### **The Technology Stack**
*   **Frontend**: React 19, Vite, Tailwind Cascading Style Sheets (CSS), Lucide React (Icons), Axios, React Router Dom.
*   **Backend**: Spring Boot 3.x, Spring Security, Jakarta Persistence Application Programming Interface (JPA), Java Mail Sender, OpenPDF.
*   **Database**: MySQL.
*   **Payment Gateway**: Razorpay Application Programming Interface (API) (Simulated sandbox environment for interview/testing safety).

---

## 🚀 2. Core Features Breakdown (The "Wow" Factors)

1.  **Strict Security & Authentication**:
    *   JSON Web Token (JWT)-based session authentication.
    *   Strict registration validation (alphabetic names only, verified email domains like Gmail/Yahoo, and strong passwords requiring uppercase, lowercase, numbers, and special characters).
    *   Show/Hide password toggles with real-time password strength indicators.
    *   Self-service Forgot Password system powered by email-based One-Time Passwords (OTPs) with a 10-minute expiry window.
    *   **Google OAuth 2.0 Sign-In / Single Sign-On (SSO)**: Quick registration and login via the Google Identity Software Development Kit (SDK).

2.  **Dynamic Seating Chart Selector & Block Designer**:
    *   Fully interactive visual map of rows and columns based on custom event configuration.
    *   Responsive layouts (e.g., standard grids, center walkway aisles, VIP front-row seating).
    *   Visual indicators for available, selected, occupied (marked in red), and blocked (marked in gray with cross symbol).
    *   Automatic 1.5x price multiplier applied on VIP seats, calculated dynamically on the fly.
    *   **Interactive Seating Layout Block Designer**: Located in the Admin Dashboard, this allows administrators to visually select and block specific seats (such as staging areas, VIP booths, or broken seats) during event creation or editing.

3.  **Multi-Ticket Guest Registrations**:
    *   Allows a buyer to purchase multiple tickets and input individual guest names and email addresses.
    *   The backend records each guest under the main registration database.
    *   Individual Portable Document Format (PDF) tickets containing personalized guest names, seat numbers, and custom Quick Response (QR) Codes are dynamically generated and emailed directly to each guest's inbox.

4.  **Verified Purchase Reviews & Star Ratings**:
    *   An integrated rating system (from 1 to 5 stars) and review comment board.
    *   Strict backend validation ensures that reviews are restricted to users who have a confirmed booking (`CONFIRMED` status) for that specific event and prevents duplicate review postings.

5.  **Self-Service Cancellations & Refund Engine**:
    *   Allows users to cancel bookings from their dashboard, executing a soft cancellation (updating database status to `CANCELLED`).
    *   A built-in rules engine automatically determines the refund rate: 100% refund if cancelled > 48 hours in advance; 50% refund if between 24 and 48 hours; non-refundable if less than 24 hours.
    *   Seats are immediately released back into the available seating pool.

6.  **Database-Backed Upfront Waitlist & Auto-Promotion**:
    *   Allows users to join a queue for sold-out events by paying 100% ticket amount upfront.
    *   **Prospective Position Visibility**: The frontend queries the waitlist status API to display the current queue size and the user's prospective position *before* they subscribe (e.g., `"Current queue: X people. You will join at position #Y."`).
    *   **Auto-Promotion Trigger**: When a reservation is cancelled, the system automatically checks the waitlist, promotes the oldest queued user directly to a `CONFIRMED` booking, allocates the released seats to them, and automatically sends them the standard HTML booking confirmation email with the PDF ticket pass.
    *   **Waitlist Refund Rules**: If a waitlisted user cancels or leaves the waitlist, a 95% refund is processed (5% platform fee retained). If the event starts and the user was not promoted, a 100% automatic refund is processed.

7.  **Real-Time Seating Sync & Double-Booking Guardrails**:
    *   **Dynamic Seating Polling**: The frontend performs a 3-second background polling of the occupied seat map while the selection modal is open, auto-deselecting seats and alerting the user via Toast if another buyer books them.
    *   **Double-Booking Transaction Guardrails**: In the backend (`PaymentServiceImpl`), checked-out seats are validated immediately before Razorpay order generation and verification to ensure they are still available, preventing double booking during simultaneous checkouts (excluding the user's own registration ID).

8.  **Advanced Search, Filter, & Sorting**:
    *   Features dynamic JPQL (Java Persistence Query Language) specifications allowing catalog filtering by price range, date range, location, and categories.
    *   Supports multi-criteria sorting (Soonest Date, Latest Date, Price Low-to-High, Price High-to-Low, and Alphabetical Title) passed natively to the database query layer.

9.  **Granular Admin Controls & Visual Analytics**:
    *   Tab-swapped admin console (Events, Users, Bookings, Coupons, Analytics).
    *   **Promotion & Demotion Panel**: Admins can promote regular users to administrators or demote existing admins (with lockout safeguards preventing self-demotion).
    *   **Coupons Management**: Seed promo codes (percentage or flat rate discounts in Indian Rupees [INR]) with usage limits, minimum order requirements, and expiry dates.
    *   **Dynamic Scalable Vector Graphics (SVG) Charting**: Native SVG charts (bar and category distribution) plotted using live database counts.
    *   **Comma-Separated Values (CSV) Ledger Exports**: Direct links to download user tables or financial logs as Comma-Separated Values (CSV) files.

---

## 🗣️ 3. Step-by-Step Presentation Speech Script

*Here is a 5-minute presentation script you can read or adapt during your interview.*

### **Phase 1: Introduction (30 seconds)**
> *"Good morning/afternoon. Today, I'm excited to present my project, **EventHub**—a full-stack Event Management and Interactive Ticket Booking Platform. Built using Spring Boot on the backend, React 19 on the frontend, and MySQL, the goal of this project was to build a secure, highly interactive, and production-ready ticketing Software as a Service (SaaS). I focused heavily on security, user experience, and backend automation."*

### **Phase 2: Core User Journey & Seating Layout (1.5 minutes)**
> *"Let's walk through the user experience. 
> 
> When registering, EventHub enforces strict Java Specification Request 380 (JSR-380) validation on the backend to ensure clean user input. Passwords must meet strong criteria, which is visually guided on the frontend with a strength indicator. I also integrated Google Single Sign-On (SSO) for one-click authentication.
> 
> Once logged in, the user can browse events, which supports dynamic filtering and multi-criteria sorting. Sorting by price, date, or title is executed efficiently directly in the database.
> 
> When booking an event, the user is presented with a dynamic seating layout grid. Admins can configure layouts like VIP Front Rows or Center Walkways. More importantly, I implemented an Interactive Seating Block Designer in the Admin Panel that allows visual seat blocking (such as for sound booths or VIP areas). These blocked seats are instantly deactivated and disabled in the user's booking view.
> 
> During checkout, buyers specify the individual names and email addresses of their guests for each seat, and apply any valid promo coupons."*

### **Phase 3: Secure Payments, Portable Document Formats (PDFs) & Automation (1.5 minutes)**
> *"Once a booking is created, the payment flows through Razorpay. To prevent payment tampering, the backend performs Hash-Based Message Authentication Code Secure Hash Algorithm 256-bit (HMAC-SHA256) signature verification upon callback.
> 
> Once verified, the booking is confirmed, and the system automates several tasks:
> First, it generates an individual Portable Document Format (PDF) ticket pass for each attendee. Each PDF contains a personalized guest name, seat code, and a unique Quick Response (QR) Code.
> Second, it generates RFC 5545 calendar invitations in-memory and mails them directly to each guest's email.
> 
> Simultaneously, the buyer receives an in-app notification. I implemented a real-time notification drawer on the navbar that updates dynamically and closes automatically when clicking outside."*

### **Phase 4: Advanced Waitlists & Cancellation Refund Rules (1 minute)**
> *"If an event is sold out, users are given the option to join a database-backed waitlist queue.
> 
> If an existing attendee cancels their ticket, the system automatically triggers a soft cancellation. The canceled seats are immediately released back to the seating pool.
> 
> The system calculates refund amounts based on cancellation timelines (100% refund if cancelled > 48 hours, 50% if between 24 and 48 hours, and non-refundable under 24 hours).
> 
> Upon cancellation, the system automatically promotes the oldest waitlisted user to a PENDING booking, allocates the released seats, and sends them checkout emails."*

### **Phase 5: Technical Highlights & Summary (30 seconds)**
> *"From an engineering perspective, I prioritized security, keeping database password hashes private, and ensured transaction safety. I also built native Scalable Vector Graphics (SVG) charts for live analytics to bypass compatibility issues in React 19. Thank you for your time, and I'd love to answer any questions you have about the architecture."*

---

## ❓ 4. Expected Interviewer Q&As

### **Q1: How do you prevent two users from booking the same seat simultaneously?**
*   **Answer**: *"I address concurrency at two levels. On the frontend, the seating grid pulls active bookings to prevent selection of reserved seats. On the database level, I utilize Jakarta Persistence Application Programming Interface (JPA) transaction isolation. When writing the registration, I check seat availability inside a Transactional block. If another thread inserts the same seat coordinates first, the database unique constraint or business check throws an exception, rolling back the transaction and alerting the user."*

### **Q2: How does the auto-promotion waitlist logic operate without a background message queue broker?**
*   **Answer**: *"I implemented a synchronous queue promotion event trigger inside the cancellation transaction. When a user cancels a reservation, inside the same Transactional execution block, the system queries the oldest waitlist entry for that event. It creates a new registration with status PENDING, copies the newly freed seat coordinates to this registration, notifies the promoted user via email and in-app logs, and deletes the waitlist record. Because it is transactional, the database remains in a consistent state."*

### **Q3: How do you calculate refund amounts, and how are canceled seats released?**
*   **Answer**: *"In the cancellation service, I calculate the duration in hours between the current time and the event date. Based on that range, a percentage is applied to the payment amount to record a refund. The registration status is updated to CANCELLED. The active seating availability query only sums bookings with status PENDING or CONFIRMED, which means the seats are immediately released back into the pool."*

### **Q4: How did you build the Interactive Admin Layout Designer?**
*   **Answer**: *"I added a text column `blocked_seats` in the Event database entity to store comma-separated seat coordinates (e.g. A-5, B-5). In the Admin Dashboard, I rendered a responsive grid based on rows and columns. Clicking any seat toggles it in a React State Set, which is serialized as a joined string and saved. When a customer opens the Seat Selection Modal, this string is parsed, and any matching seat code is rendered in a disabled visual style and locked from clicks."*

### **Q5: How did you implement dynamic sorting and advanced filtering in the JPA query layer?**
*   **Answer**: *"I modified the Event JPQL (Java Persistence Query Language) query to support passing a Spring Data Sort parameter. In the Event Controller and Service, the sortBy request parameter (such as priceAsc, priceDesc, date, title) is mapped to Sort.by(Order.asc/desc) objects and passed as the final parameter to the JPQL query method. Spring Data JPA automatically appends the correct SQL ORDER BY clause."*

### **Q6: How did you implement the upfront waitlist payment and auto-promotion email flow?**
*   **Answer**: *"When a user joins the sold-out event waitlist, they complete a 100% upfront checkout via Razorpay, setting their status to `WAITLISTED_PAID`. When a confirmed user cancels their booking, inside the same database transaction, the oldest waitlisted user's status is changed to `CONFIRMED` and the cancelled seat coordinates are automatically allocated to them. We then trigger the standard booking confirmation email service which dynamically generates their PDF ticket pass with a QR code and calendar invitation, sending it directly to their email inbox."*

### **Q7: What is your refund policy for waitlist leaves vs event cancellations, and how did you automate it?**
*   **Answer**: *"Our refund engine handles two waitlist refund scenarios. First, if a user manually cancels or leaves the waitlist, we issue a 95% refund (deducting a 5% platform fee for Razorpay and platform maintenance). Second, if the event starts and the user was never promoted, they receive a 100% automatic refund. We automated this by querying all expired waitlist registrations when users fetch their dashboard or via a global scheduler, changing the status to `CANCELLED` and update the payment log status to `REFUNDED`."*

### **Q8: How did you prevent double-booking conflicts during concurrent payment checkouts?**
*   **Answer**: *"We implemented a dual-layer check. On the frontend, we use 3-second background polling of reserved seats to deselect conflicting selections and alert the user via Toast. On the backend, immediately before Razorpay order generation (`createOrder`) and signature verification (`verifyPayment`), we query active reservations to ensure the selected seats are still free (explicitly filtering out the user's own registration ID to prevent self-conflict). If a conflict is found, we block the payment and roll back the transaction."*

