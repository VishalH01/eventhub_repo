package com.eventplatform.controller;

import com.eventplatform.entity.Event;
import com.eventplatform.entity.Registration;
import com.eventplatform.entity.User;
import com.eventplatform.repository.EventRepository;
import com.eventplatform.repository.RegistrationRepository;
import com.eventplatform.repository.UserRepository;
import com.eventplatform.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
public class EventWaitlistController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private RegistrationService registrationService;

    // 1. Join Waitlist
    // - Route: POST http://localhost:8080/api/events/{eventId}/waitlist
    @PostMapping("/{eventId}/waitlist")
    public ResponseEntity<?> joinWaitlist(@PathVariable("eventId") Long eventId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please log in to join the waitlist!");
        }

        String email = principal.getName();
        try {
            Registration reg = registrationService.bookEvent(eventId, email, List.of("Waitlist"), null, null);
            return ResponseEntity.ok(Map.of(
                "message", "Successfully added to the waitlist queue! Proceed to your dashboard to pay and activate your waitlist status.",
                "registrationId", reg.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Leave Waitlist
    // - Route: DELETE http://localhost:8080/api/events/{eventId}/waitlist
    @DeleteMapping("/{eventId}/waitlist")
    public ResponseEntity<?> leaveWaitlist(@PathVariable("eventId") Long eventId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please log in!");
        }

        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found!");
        }

        System.out.println("[Waitlist Debug] leaveWaitlist called by: " + email + " for eventId: " + eventId);
        List<Registration> userRegs = registrationRepository.findByUserEmail(email);
        System.out.println("[Waitlist Debug] Total user registrations found: " + userRegs.size());
        for (Registration r : userRegs) {
            System.out.println("[Waitlist Debug] Reg ID: " + r.getId() + 
                               ", Event ID: " + r.getEvent().getId() + 
                               ", Status: " + r.getStatus() + 
                               ", Matches event: " + r.getEvent().getId().equals(eventId) +
                               ", Status checks: " + ("WAITLISTED".equalsIgnoreCase(r.getStatus()) || "WAITLISTED_PAID".equalsIgnoreCase(r.getStatus())));
        }

        Optional<Registration> waitlistReg = userRegs.stream()
            .filter(r -> r.getEvent().getId().equals(eventId) && 
                         ("WAITLISTED".equalsIgnoreCase(r.getStatus()) || "WAITLISTED_PAID".equalsIgnoreCase(r.getStatus())))
            .findFirst();

        if (waitlistReg.isEmpty()) {
            return ResponseEntity.badRequest().body("You are not on the waitlist for this event!");
        }

        try {
            registrationService.cancelRegistration(waitlistReg.get().getId(), email);
            return ResponseEntity.ok(Map.of("message", "Successfully left the waitlist. Refund processed if applicable."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. Get Waitlist status / position
    // - Route: GET http://localhost:8080/api/events/{eventId}/waitlist/status
    @GetMapping("/{eventId}/waitlist/status")
    public ResponseEntity<?> getWaitlistStatus(@PathVariable("eventId") Long eventId, Principal principal) {
        // We fetch all waitlisted entries that have been PAID
        List<Registration> waitlist = registrationRepository.findByEventIdAndStatusOrderByRegistrationDateAsc(eventId, "WAITLISTED_PAID");
        int totalWaitlisted = waitlist.size();

        if (principal == null) {
            return ResponseEntity.ok(Map.of(
                "isWaitlisted", false,
                "isPaid", false,
                "position", -1,
                "totalWaitlisted", totalWaitlisted
            ));
        }

        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(Map.of(
                "isWaitlisted", false,
                "isPaid", false,
                "position", -1,
                "totalWaitlisted", totalWaitlisted
            ));
        }

        int position = -1;
        boolean isWaitlisted = false;
        boolean isPaid = false;

        // Check if user has an active PAID waitlist entry
        for (int i = 0; i < waitlist.size(); i++) {
            if (waitlist.get(i).getUser().getId().equals(user.getId())) {
                position = i + 1;
                isWaitlisted = true;
                isPaid = true;
                break;
            }
        }

        // If not found in paid waitlist, check if they have an unpaid waitlist entry
        if (!isWaitlisted) {
            List<Registration> userRegs = registrationRepository.findByUserEmail(email);
            boolean hasUnpaid = userRegs.stream()
                .anyMatch(r -> r.getEvent().getId().equals(eventId) && "WAITLISTED".equalsIgnoreCase(r.getStatus()));
            if (hasUnpaid) {
                isWaitlisted = true;
                isPaid = false;
            }
        }

        return ResponseEntity.ok(Map.of(
            "isWaitlisted", isWaitlisted,
            "isPaid", isPaid,
            "position", position,
            "totalWaitlisted", totalWaitlisted
        ));
    }
}
