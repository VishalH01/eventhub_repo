package com.eventplatform.controller;

import com.eventplatform.entity.Event;
import com.eventplatform.entity.EventReview;
import com.eventplatform.entity.Registration;
import com.eventplatform.entity.User;
import com.eventplatform.repository.EventRepository;
import com.eventplatform.repository.EventReviewRepository;
import com.eventplatform.repository.RegistrationRepository;
import com.eventplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventReviewController {

    @Autowired
    private EventReviewRepository eventReviewRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    public static class ReviewRequest {
        private int rating;
        private String comment;

        public int getRating() {
            return rating;
        }

        public void setRating(int rating) {
            this.rating = rating;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }
    }

    // 1. Get all reviews for an event
    // - Route: GET http://localhost:8080/api/events/{eventId}/reviews
    @GetMapping("/{eventId}/reviews")
    public ResponseEntity<List<EventReview>> getReviews(@PathVariable("eventId") Long eventId) {
        List<EventReview> reviews = eventReviewRepository.findByEventIdOrderByCreatedAtDesc(eventId);
        return ResponseEntity.ok(reviews);
    }

    // 2. Post a review for an event (Verified Attendee Only)
    // - Route: POST http://localhost:8080/api/events/{eventId}/reviews
    @PostMapping("/{eventId}/reviews")
    public ResponseEntity<?> postReview(
            @PathVariable("eventId") Long eventId,
            @RequestBody ReviewRequest request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please log in to post a review!");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            return ResponseEntity.badRequest().body("Rating must be between 1 and 5 stars!");
        }

        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found!");
        }

        Event event = eventRepository.findById(eventId).orElse(null);
        if (event == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event not found!");
        }

        // Verified Purchase Check: Check if user has a CONFIRMED registration for this event
        List<Registration> registrations = registrationRepository.findByUserEmail(email);
        boolean hasConfirmedBooking = registrations.stream().anyMatch(reg -> 
            reg.getEvent().getId().equals(eventId) && "CONFIRMED".equalsIgnoreCase(reg.getStatus())
        );

        if (!hasConfirmedBooking) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Verified Purchase Required: You can only review events you have booked and paid for!");
        }

        // Duplicate Review Check
        boolean alreadyReviewed = eventReviewRepository.existsByEventIdAndUserId(eventId, user.getId());
        if (alreadyReviewed) {
            return ResponseEntity.badRequest().body("You have already reviewed this event!");
        }

        // Create and save review
        EventReview review = new EventReview(event, user, request.getRating(), request.getComment());
        EventReview savedReview = eventReviewRepository.save(review);
        return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
    }
}
