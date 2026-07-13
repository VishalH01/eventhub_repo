package com.eventplatform.controller;

import com.eventplatform.dto.AdminStatsResponse;
import com.eventplatform.entity.User;
import com.eventplatform.entity.Role;
import com.eventplatform.entity.Registration;
import com.eventplatform.repository.UserRepository;
import com.eventplatform.repository.RoleRepository;
import com.eventplatform.repository.RegistrationRepository;
import com.eventplatform.service.AdminStatsService;
import com.eventplatform.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

// @RestController: Combined mapping for JSON payload serialization.
// @RequestMapping("/api/admin"): Sets prefix prefix `/api/admin` for administrative routes.
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminStatsService adminStatsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private RegistrationService registrationService;

    // 1. Fetch Analytics Metrics
    // - Route: GET http://localhost:8080/api/admin/stats
    // - Access: Secured (restricted strictly to ROLE_ADMIN via SecurityConfig)
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getPlatformStats() {
        registrationService.processAllExpiredWaitlists();
        AdminStatsResponse stats = adminStatsService.getPlatformStats();
        return ResponseEntity.ok(stats);
    }

    // 2. Promote a User to Admin Role
    // - Route: POST http://localhost:8080/api/admin/make-admin
    // - Access: Secured (restricted strictly to ROLE_ADMIN via SecurityConfig)
    @PostMapping("/make-admin")
    public ResponseEntity<String> makeAdmin(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseThrow(() -> new RuntimeException("ROLE_ADMIN role not found in database."));

        if (user.getRoles().contains(adminRole)) {
            return ResponseEntity.badRequest().body("User is already an Admin.");
        }

        user.getRoles().add(adminRole);
        userRepository.save(user);

        return ResponseEntity.ok("User promoted to Admin successfully!");
    }

    // 2b. Demote an Admin to Regular User Role
    // - Route: POST http://localhost:8080/api/admin/demote-admin
    // - Access: Secured (restricted strictly to ROLE_ADMIN via SecurityConfig)
    @PostMapping("/demote-admin")
    public ResponseEntity<String> demoteAdmin(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseThrow(() -> new RuntimeException("ROLE_ADMIN role not found in database."));

        if (!user.getRoles().contains(adminRole)) {
            return ResponseEntity.badRequest().body("User is not an Admin.");
        }

        // Prevent self-demotion to avoid locking out the current session
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && email.equalsIgnoreCase(auth.getName())) {
            return ResponseEntity.badRequest().body("Self-demotion is not allowed to prevent admin lockout.");
        }

        user.getRoles().remove(adminRole);
        userRepository.save(user);

        return ResponseEntity.ok("Administrator demoted to regular user successfully!");
    }

    // 3. Fetch All Bookings
    // - Route: GET http://localhost:8080/api/admin/bookings
    // - Access: Secured (restricted strictly to ROLE_ADMIN via SecurityConfig)
    @GetMapping("/bookings")
    public ResponseEntity<List<Registration>> getAllBookings() {
        registrationService.processAllExpiredWaitlists();
        return ResponseEntity.ok(registrationRepository.findAll());
    }

    // 4. Fetch All Registered Users
    // - Route: GET http://localhost:8080/api/admin/users
    // - Access: Secured (restricted strictly to ROLE_ADMIN via SecurityConfig)
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 5. Export Registered Users as CSV
    // - Route: GET http://localhost:8080/api/admin/export/users
    @GetMapping("/export/users")
    public ResponseEntity<String> exportUsersCsv() {
        List<User> users = userRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("User ID,Name,Email,Roles\n");
        for (User u : users) {
            String roleNames = u.getRoles().stream()
                .map(r -> r.getName())
                .reduce((r1, r2) -> r1 + "|" + r2)
                .orElse("ROLE_USER");
            csv.append(u.getId()).append(",")
               .append("\"").append(u.getName().replace("\"", "\"\"")).append("\",")
               .append("\"").append(u.getEmail().replace("\"", "\"\"")).append("\",")
               .append("\"").append(roleNames).append("\"\n");
        }
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=users_export.csv")
            .header("Content-Type", "text/csv; charset=UTF-8")
            .body(csv.toString());
    }

    // 6. Export Bookings List as CSV
    // - Route: GET http://localhost:8080/api/admin/export/bookings
    @GetMapping("/export/bookings")
    public ResponseEntity<String> exportBookingsCsv() {
        registrationService.processAllExpiredWaitlists();
        List<Registration> bookings = registrationRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("Booking ID,Customer Name,Customer Email,Event Title,Seats,Amount Paid,Status,Date Booked\n");
        for (Registration reg : bookings) {
            String seats = reg.getSeats() != null ? reg.getSeats() : "General";
            double amount = reg.getFinalPrice() != null ? reg.getFinalPrice() : (reg.getEvent() != null ? reg.getEvent().getPrice() : 0.0);
            String title = reg.getEvent() != null ? reg.getEvent().getTitle() : "Unknown Event";
            csv.append(reg.getRegistrationNumber()).append(",")
               .append("\"").append(reg.getUser().getName().replace("\"", "\"\"")).append("\",")
               .append("\"").append(reg.getUser().getEmail().replace("\"", "\"\"")).append("\",")
               .append("\"").append(title.replace("\"", "\"\"")).append("\",")
               .append("\"").append(seats).append("\",")
               .append(amount).append(",")
               .append(reg.getStatus()).append(",")
               .append(reg.getRegistrationDate()).append("\n");
        }
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=bookings_export.csv")
            .header("Content-Type", "text/csv; charset=UTF-8")
            .body(csv.toString());
    }
}
