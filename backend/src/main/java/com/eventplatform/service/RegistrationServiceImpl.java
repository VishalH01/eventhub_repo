package com.eventplatform.service;

import com.eventplatform.entity.Event;
import com.eventplatform.entity.Registration;
import com.eventplatform.entity.User;
import com.eventplatform.repository.EventRepository;
import com.eventplatform.repository.RegistrationRepository;
import com.eventplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

// @Service: Declares this as a Service Bean containing event registration business logic.
@Service
public class RegistrationServiceImpl implements RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Override
    public Registration bookEvent(Long eventId, String email) {
        // Step A: Check if the user has already booked a ticket for this event.
        // Prevent duplicate bookings to ensure fair access to tickets.
        if (registrationRepository.existsByUserEmailAndEventId(email, eventId)) {
            throw new RuntimeException("You have already registered for this event!");
        }

        // Step B: Look up the user entity by email.
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Step C: Look up the event entity by ID.
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));

        // Step D: Instantiate and populate a new Registration record.
        Registration registration = new Registration();
        
        // Generate a unique registration code using the format: REG-<CurrentTimestamp>-<Random3Digit>
        String uniqueCode = "REG-" + System.currentTimeMillis() + "-" + ((int) (Math.random() * 900) + 100);
        registration.setRegistrationNumber(uniqueCode);
        
        // Record current timestamp
        registration.setRegistrationDate(LocalDateTime.now());
        
        // Set initial status to PENDING. This will be updated to CONFIRMED once payment is finalized.
        registration.setStatus("PENDING");
        
        // Associate the foreign key relationships
        registration.setUser(user);
        registration.setEvent(event);

        // Step E: Persist to database. JPA handles inserting the foreign keys.
        return registrationRepository.save(registration);
    }

    @Override
    public List<Registration> getMyRegistrations(String email) {
        // Fetch all bookings associated with the authenticated user's email.
        return registrationRepository.findByUserEmail(email);
    }

    @Override
    public void cancelRegistration(Long id, String email) {
        // Step A: Find the target registration record.
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration booking not found with ID: " + id));

        // Step B: Crucial Security Check!
        // Validate that the email of the user who owns this booking record matches the
        // email of the currently authenticated caller requesting the cancellation.
        // This prevents malicious users from deleting other users' bookings.
        if (!registration.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied: You do not have permission to cancel this booking!");
        }

        // Step C: Delete registration from the database.
        registrationRepository.delete(registration);
    }
}
