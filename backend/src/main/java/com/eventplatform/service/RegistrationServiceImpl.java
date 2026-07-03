package com.eventplatform.service;

import com.eventplatform.entity.Event;
import com.eventplatform.entity.Registration;
import com.eventplatform.entity.User;
import com.eventplatform.entity.Payment;
import com.eventplatform.repository.EventRepository;
import com.eventplatform.repository.RegistrationRepository;
import com.eventplatform.repository.UserRepository;
import com.eventplatform.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    @Autowired
    private PaymentRepository paymentRepository;

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
        List<Registration> registrations = registrationRepository.findByUserEmail(email);
        
        // Populate transient QR code Base64 string for any confirmed booking ticket
        registrations.forEach(this::populateQrCode);
        
        return registrations;
    }

    // Helper method to dynamically generate QR code Base64 text if the booking status is CONFIRMED.
    private void populateQrCode(Registration reg) {
        if ("CONFIRMED".equalsIgnoreCase(reg.getStatus())) {
            // String formatting to build the payload stored inside the entry barcode
            String qrContent = "Registration Code: " + reg.getRegistrationNumber() + "\n" +
                               "Attendee: " + reg.getUser().getName() + "\n" +
                               "Event: " + reg.getEvent().getTitle() + "\n" +
                               "Date: " + reg.getEvent().getDate() + "\n" +
                               "Venue: " + reg.getEvent().getLocation();
            
            // Generate QR code PNG bytes and convert to Base64 (200x200 pixels)
            String base64Image = com.eventplatform.util.QrCodeGenerator.generateQrCodeBase64(qrContent, 200, 200);
            reg.setQrCodeBase64(base64Image);
        }
    }

    @Override
    @Transactional
    public void cancelRegistration(Long id, String email) {
        // Step A: Find the target registration record.
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration booking not found with ID: " + id));

        // Step B: Crucial Security Check!
        if (!registration.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied: You do not have permission to cancel this booking!");
        }

        // Step C: Manually delete child Payment record if it exists to prevent MySQL constraint violation.
        Payment payment = registration.getPayment();
        if (payment != null) {
            payment.setRegistration(null);
            registration.setPayment(null);
            paymentRepository.delete(payment);
        }

        // Step D: Delete registration from the database.
        registrationRepository.delete(registration);
    }
}
