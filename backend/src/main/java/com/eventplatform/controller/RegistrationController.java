package com.eventplatform.controller;

import com.eventplatform.entity.Registration;
import com.eventplatform.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

// @RestController: Enables REST controller capabilities mapping responses to JSON body payloads.
// @RequestMapping("/api/registrations"): Base path prefix for all endpoints here.
@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    public static class SeatBookingRequest {
        private List<String> seats;

        public List<String> getSeats() {
            return seats;
        }

        public void setSeats(List<String> seats) {
            this.seats = seats;
        }
    }

    // 1. Book Event Ticket with Seat Selection
    // - Route: POST http://localhost:8080/api/registrations/book/{eventId}
    @PostMapping("/book/{eventId}")
    public ResponseEntity<?> bookEvent(
            @PathVariable("eventId") Long eventId, 
            @RequestBody SeatBookingRequest request,
            Principal principal) {
        try {
            String email = principal.getName(); // Extract logged-in user's email
            Registration registration = registrationService.bookEvent(eventId, email, request.getSeats());
            return new ResponseEntity<>(registration, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Return bad request error (e.g. duplicate bookings or seat already taken)
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Fetch Logged-in User's Bookings List
    // - Route: GET http://localhost:8080/api/registrations/my
    @GetMapping("/my")
    public ResponseEntity<List<Registration>> getMyRegistrations(Principal principal) {
        String email = principal.getName(); // Extract email
        List<Registration> registrations = registrationService.getMyRegistrations(email);
        return ResponseEntity.ok(registrations);
    }

    // 3. Cancel Booking Ticket
    // - Route: DELETE http://localhost:8080/api/registrations/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelRegistration(@PathVariable("id") Long id, Principal principal) {
        try {
            String email = principal.getName(); // Extract email
            registrationService.cancelRegistration(id, email);
            return ResponseEntity.ok("Registration cancelled successfully!");
        } catch (RuntimeException e) {
            // Returns 400 Bad Request if ownership validation checks fail or ID doesn't exist
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. Fetch Reserved Seats for an Event
    // - Route: GET http://localhost:8080/api/registrations/event/{eventId}/reserved
    @GetMapping("/event/{eventId}/reserved")
    public ResponseEntity<List<String>> getReservedSeats(@PathVariable("eventId") Long eventId) {
        List<String> reserved = registrationService.getReservedSeats(eventId);
        return ResponseEntity.ok(reserved);
    }
}
