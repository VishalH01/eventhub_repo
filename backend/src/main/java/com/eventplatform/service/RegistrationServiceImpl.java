package com.eventplatform.service;

import com.eventplatform.entity.Event;
import com.eventplatform.entity.Registration;
import com.eventplatform.entity.User;
import com.eventplatform.entity.Payment;
import com.eventplatform.entity.Coupon;
import com.eventplatform.entity.Notification;
import com.eventplatform.repository.EventRepository;
import com.eventplatform.repository.RegistrationRepository;
import com.eventplatform.repository.UserRepository;
import com.eventplatform.repository.PaymentRepository;
import com.eventplatform.repository.CouponRepository;
import com.eventplatform.repository.NotificationRepository;
import com.eventplatform.entity.TicketAttendee;
import com.eventplatform.repository.TicketAttendeeRepository;
import com.eventplatform.entity.EventWaitlist;
import com.eventplatform.repository.EventWaitlistRepository;
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

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private TicketAttendeeRepository ticketAttendeeRepository;

    @Autowired
    private EventWaitlistRepository eventWaitlistRepository;

    @Autowired
    private EmailService emailService;

    @Override
    @Transactional
    public Registration bookEvent(Long eventId, String email, List<String> seats, String couponCode, List<RegistrationService.AttendeeDTO> attendees) {
        // Step B: Look up the user entity by email.
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Step C: Look up the event entity by ID.
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));

        boolean isWaitlist = (seats == null || seats.isEmpty()) || (seats.size() == 1 && "Waitlist".equalsIgnoreCase(seats.get(0)));

        if (isWaitlist) {
            // Check if user is already waitlisted (status WAITLISTED or WAITLISTED_PAID)
            boolean alreadyWaitlisted = registrationRepository.findByUserEmail(email).stream()
                .anyMatch(r -> r.getEvent().getId().equals(eventId) && ("WAITLISTED".equals(r.getStatus()) || "WAITLISTED_PAID".equals(r.getStatus())));
            if (alreadyWaitlisted) {
                throw new RuntimeException("You are already on the waitlist for this event!");
            }
            
            // Check if user already has a booking (CONFIRMED or PENDING)
            boolean alreadyBooked = registrationRepository.findByUserEmail(email).stream()
                .anyMatch(r -> r.getEvent().getId().equals(eventId) && ("CONFIRMED".equals(r.getStatus()) || "PENDING".equals(r.getStatus())));
            if (alreadyBooked) {
                throw new RuntimeException("You are already registered for this event!");
            }
        } else {
            // Validate that requested seats are not already booked/reserved
            List<String> reservedSeats = getReservedSeats(eventId);
            for (String seat : seats) {
                if (reservedSeats.contains(seat)) {
                    throw new RuntimeException("Seat " + seat + " is already reserved. Please select another seat.");
                }
            }
        }

        // Step D: Instantiate and populate a new Registration record.
        Registration registration = new Registration();
        
        // Generate a unique registration code using the format: REG-<CurrentTimestamp>-<Random3Digit>
        String uniqueCode = "REG-" + System.currentTimeMillis() + "-" + ((int) (Math.random() * 900) + 100);
        registration.setRegistrationNumber(uniqueCode);
        
        // Record current timestamp
        registration.setRegistrationDate(LocalDateTime.now());
        
        // Set initial status
        if (isWaitlist) {
            registration.setStatus("WAITLISTED");
            registration.setSeats("Waitlist");
        } else {
            registration.setStatus("PENDING");
            registration.setSeats(String.join(",", seats));
        }
        
        // Associate the foreign key relationships
        registration.setUser(user);
        registration.setEvent(event);

        // Compute Base Price
        double basePrice = event.getPrice();
        String layout = event.getSeatingLayout();
        double totalPrice = 0.0;
        if (isWaitlist) {
            totalPrice = basePrice;
        } else {
            for (String seat : seats) {
                seat = seat.trim();
                boolean isVIP = "VIP_FRONT".equalsIgnoreCase(layout) && seat.length() > 0 && (seat.charAt(0) - 'A') < 2;
                if (isVIP) {
                    totalPrice += basePrice * 1.5;
                } else {
                    totalPrice += basePrice;
                }
            }
        }

        // Process Coupon Discount if provided
        double discount = 0.0;
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Coupon coupon = couponRepository.findByCode(couponCode.trim().toUpperCase()).orElse(null);
            if (coupon != null && coupon.isActive()) {
                boolean expired = coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now());
                boolean limitReached = coupon.getUsageLimit() > 0 && coupon.getCurrentUsage() >= coupon.getUsageLimit();
                boolean minAmountMet = totalPrice >= coupon.getMinOrderAmount();

                if (!expired && !limitReached && minAmountMet) {
                    if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
                        discount = totalPrice * (coupon.getDiscountValue() / 100.0);
                    } else if ("FIXED".equalsIgnoreCase(coupon.getDiscountType())) {
                        discount = coupon.getDiscountValue();
                    }

                    if (discount > totalPrice) {
                        discount = totalPrice;
                    }

                    registration.setCouponCode(coupon.getCode());
                    registration.setDiscountAmount(discount);
                    
                    // Increment coupon usage count
                    coupon.setCurrentUsage(coupon.getCurrentUsage() + 1);
                    couponRepository.save(coupon);
                }
            }
        }

        registration.setFinalPrice(totalPrice - discount);

        // Step E: Persist to database. JPA handles inserting the foreign keys.
        Registration saved = registrationRepository.save(registration);

        // Map and save attendee details
        if (attendees != null && !attendees.isEmpty()) {
            for (RegistrationService.AttendeeDTO attDto : attendees) {
                TicketAttendee attendee = new TicketAttendee(
                    saved, 
                    attDto.getSeatCode(), 
                    attDto.getName(), 
                    attDto.getEmail()
                );
                ticketAttendeeRepository.save(attendee);
                saved.getAttendees().add(attendee);
            }
        }

        // Create an in-app notification for the user about the booking registration
        try {
            Notification notif = new Notification(user, "A ticket booking reservation was created for event '" + event.getTitle() + "' (Seats: " + saved.getSeats() + "). Complete payment to confirm your pass!");
            notificationRepository.save(notif);
        } catch (Exception e) {
            System.err.println("Failed to save booking creation notification: " + e.getMessage());
        }

        return saved;
    }

    @Override
    public List<Registration> getMyRegistrations(String email) {
        // Expire unpromoted paid waitlists for past events first
        processExpiredWaitlists(email);

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

        String originalStatus = registration.getStatus();

        // Step C: Calculate refund details
        double refundPercentage = 0.0;
        double refundAmount = 0.0;
        
        if ("WAITLISTED_PAID".equalsIgnoreCase(originalStatus)) {
            refundPercentage = 95.0;
            refundAmount = (registration.getFinalPrice() != null ? registration.getFinalPrice() : 0.0) * 0.95;
        } else if ("CONFIRMED".equalsIgnoreCase(originalStatus)) {
            java.time.LocalDateTime eventDate = registration.getEvent().getDate();
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            long hoursUntilEvent = java.time.Duration.between(now, eventDate).toHours();
            
            if (hoursUntilEvent > 48) {
                refundPercentage = 100.0;
                refundAmount = registration.getFinalPrice() != null ? registration.getFinalPrice() : 0.0;
            } else if (hoursUntilEvent >= 24) {
                refundPercentage = 50.0;
                refundAmount = (registration.getFinalPrice() != null ? registration.getFinalPrice() : 0.0) * 0.5;
            } else {
                refundPercentage = 0.0;
                refundAmount = 0.0;
            }
        }
        
        // Update payment status if exists
        Payment payment = registration.getPayment();
        if (payment != null) {
            if (refundAmount > 0) {
                payment.setStatus("REFUNDED");
                paymentRepository.save(payment);
            } else {
                payment.setStatus("CANCELLED");
                paymentRepository.save(payment);
            }
        }

        // Update registration status and persist
        registration.setStatus("CANCELLED");
        registrationRepository.save(registration);
        
        // Send email with details
        String refundMessage = String.format(
            "Booking cancellation confirmed. Event: %s, Seat(s): %s. Refund Percentage: %.1f%%, Refunded Amount: INR %.2f.",
            registration.getEvent().getTitle(),
            registration.getSeats() != null ? registration.getSeats() : "General",
            refundPercentage,
            refundAmount
        );
        
        try {
            Notification notif = new Notification(registration.getUser(), refundMessage);
            notificationRepository.save(notif);
        } catch (Exception e) {
            System.err.println("Failed to save cancellation notification: " + e.getMessage());
        }

        // Email dispatch
        emailService.sendSimpleEmail(
            registration.getUser().getEmail(), 
            "Booking Cancelled & Refund Receipt - " + registration.getEvent().getTitle(),
            "Dear " + registration.getUser().getName() + ",\n\n" +
            "Your registration booking has been cancelled.\n\n" +
            "Cancellation Summary:\n" +
            "- Event: " + registration.getEvent().getTitle() + "\n" +
            "- Date: " + registration.getEvent().getDate() + "\n" +
            "- Seats Released: " + (registration.getSeats() != null ? registration.getSeats() : "General") + "\n" +
            "- Total Price Paid: INR " + String.format("%.2f", registration.getFinalPrice() != null ? registration.getFinalPrice() : 0.0) + "\n" +
            "- Refund Percentage Applied: " + refundPercentage + "%\n" +
            "- Refunded Amount: INR " + String.format("%.2f", refundAmount) + "\n\n" +
            "Thank you,\nEventHub Team"
        );

        // Step D: Waitlist Auto-Promotion Trigger
        if ("CONFIRMED".equalsIgnoreCase(originalStatus)) {
            try {
                List<Registration> waitlist = registrationRepository.findByEventIdAndStatusOrderByRegistrationDateAsc(
                    registration.getEvent().getId(),
                    "WAITLISTED_PAID"
                );
                if (!waitlist.isEmpty()) {
                    Registration topEntry = waitlist.get(0);
                    
                    // Assign the released seats to the promoted user and confirm immediately since they paid upfront
                    topEntry.setStatus("CONFIRMED");
                    topEntry.setSeats(registration.getSeats());
                    registrationRepository.save(topEntry);
                    
                    // Save notification for promoted user
                    try {
                        Notification notif = new Notification(topEntry.getUser(), 
                            "Good news! You have been promoted from the waitlist for event '" + registration.getEvent().getTitle() + 
                            "'. Seats allocated: " + topEntry.getSeats() + ". Your pass is confirmed!");
                        notificationRepository.save(notif);
                    } catch (Exception e) {
                        System.err.println("Failed to save promotion notification: " + e.getMessage());
                    }

                    // Send booking confirmation email with PDF ticket
                    try {
                        emailService.sendBookingConfirmationWithPdf(topEntry);
                    } catch (Exception emailEx) {
                        System.err.println("Failed to send booking confirmation email on promotion: " + emailEx.getMessage());
                    }
                }
            } catch (Exception promoteEx) {
                System.err.println("Failed during waitlist promotion: " + promoteEx.getMessage());
            }
        }
    }

    @Override
    public List<String> getReservedSeats(Long eventId) {
        // Find all active or pending bookings for this event
        List<Registration> registrations = registrationRepository.findByEventIdAndStatusIn(
            eventId, 
            List.of("PENDING", "CONFIRMED")
        );
        
        List<String> reserved = new java.util.ArrayList<>();
        for (Registration reg : registrations) {
            if (reg.getSeats() != null && !reg.getSeats().trim().isEmpty()) {
                String[] seatsArray = reg.getSeats().split(",");
                for (String seat : seatsArray) {
                    reserved.add(seat.trim());
                }
            }
        }
        return reserved;
    }

    private void processExpiredWaitlists(String email) {
        try {
            List<Registration> waitlisted = registrationRepository.findByUserEmail(email);
            for (Registration reg : waitlisted) {
                if ("WAITLISTED_PAID".equalsIgnoreCase(reg.getStatus())) {
                    if (reg.getEvent().getDate().isBefore(LocalDateTime.now())) {
                        reg.setStatus("CANCELLED");
                        registrationRepository.save(reg);
                        
                        Payment payment = reg.getPayment();
                        if (payment != null) {
                            payment.setStatus("REFUNDED");
                            paymentRepository.save(payment);
                        }
                        
                        emailService.sendSimpleEmail(
                            reg.getUser().getEmail(),
                            "Waitlist Expired - 100% Refund Confirmation - " + reg.getEvent().getTitle(),
                            "Dear " + reg.getUser().getName() + ",\n\n" +
                            "Unfortunately, the event '" + reg.getEvent().getTitle() + "' has started and you were not promoted from the waitlist.\n\n" +
                            "As per policy, we have processed a 100% refund of your upfront payment:\n" +
                            "- Refund Amount: INR " + String.format("%.2f", reg.getFinalPrice() != null ? reg.getFinalPrice() : 0.0) + "\n\n" +
                            "The amount will be credited back to your account shortly.\n\n" +
                            "Best regards,\nEventHub Team"
                        );
                        
                        try {
                            Notification notif = new Notification(reg.getUser(), 
                                "Your waitlist entry for '" + reg.getEvent().getTitle() + "' expired unpromoted. A 100% refund has been initiated.");
                            notificationRepository.save(notif);
                        } catch (Exception notifEx) {
                            System.err.println("Failed to save expired waitlist notification: " + notifEx.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to process expired waitlist refunds: " + e.getMessage());
        }
    }

    @Override
    public void processAllExpiredWaitlists() {
        try {
            List<Registration> allWaitlisted = registrationRepository.findAll();
            for (Registration reg : allWaitlisted) {
                if ("WAITLISTED_PAID".equalsIgnoreCase(reg.getStatus())) {
                    if (reg.getEvent().getDate().isBefore(LocalDateTime.now())) {
                        reg.setStatus("CANCELLED");
                        registrationRepository.save(reg);
                        
                        Payment payment = reg.getPayment();
                        if (payment != null) {
                            payment.setStatus("REFUNDED");
                            paymentRepository.save(payment);
                        }
                        
                        emailService.sendSimpleEmail(
                            reg.getUser().getEmail(),
                            "Waitlist Expired - 100% Refund Confirmation - " + reg.getEvent().getTitle(),
                            "Dear " + reg.getUser().getName() + ",\n\n" +
                            "Unfortunately, the event '" + reg.getEvent().getTitle() + "' has started and you were not promoted from the waitlist.\n\n" +
                            "As per policy, we have processed a 100% refund of your upfront payment:\n" +
                            "- Refund Amount: INR " + String.format("%.2f", reg.getFinalPrice() != null ? reg.getFinalPrice() : 0.0) + "\n\n" +
                            "The amount will be credited back to your account shortly.\n\n" +
                            "Best regards,\nEventHub Team"
                        );
                        
                        try {
                            Notification notif = new Notification(reg.getUser(), 
                                "Your waitlist entry for '" + reg.getEvent().getTitle() + "' expired unpromoted. A 100% refund has been initiated.");
                            notificationRepository.save(notif);
                        } catch (Exception notifEx) {
                            System.err.println("Failed to save expired waitlist notification: " + notifEx.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to process all expired waitlist refunds: " + e.getMessage());
        }
    }
}
