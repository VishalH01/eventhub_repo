package com.eventplatform.service;

import com.eventplatform.entity.Event;
import com.eventplatform.entity.Registration;
import com.eventplatform.util.PdfTicketGenerator;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private com.eventplatform.repository.TicketAttendeeRepository ticketAttendeeRepository;

    @Override
    @Async
    public void sendSimpleEmail(String to, String subject, String body) {
        if (mailSender == null) {
            logFallback(to, subject, body);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send simple email via SMTP: " + e.getMessage());
            logFallback(to, subject, body);
        }
    }

    @Override
    @Async
    public void sendEventCreationEmail(Event event, List<String> userEmails) {
        if (userEmails == null || userEmails.isEmpty()) return;
        
        String subject = "New Event Added: " + event.getTitle();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy - hh:mm a");
        String formattedDate = event.getDate().format(formatter);
        
        String htmlContent = "<h3>Hi there!</h3>" +
                "<p>A exciting new event has just been added on EventHub!</p>" +
                "<p><strong>" + event.getTitle() + "</strong></p>" +
                "<p><strong>Category:</strong> " + event.getCategory() + "</p>" +
                "<p><strong>Date & Time:</strong> " + formattedDate + "</p>" +
                "<p><strong>Venue:</strong> " + event.getLocation() + "</p>" +
                "<p><strong>Ticket Price:</strong> INR " + event.getPrice() + "</p>" +
                "<p>Book your seats now before they sell out!</p>" +
                "<br/><p>Best regards,<br/>EventHub Team</p>";

        for (String email : userEmails) {
            if (mailSender == null) {
                logFallback(email, subject, htmlContent);
                continue;
            }
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(email);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("Failed to send new event email blast to " + email + ": " + e.getMessage());
                logFallback(email, subject, htmlContent);
            }
        }
    }

    @Override
    @Async
    public void sendBookingConfirmationWithPdf(Registration registration) {
        String toEmail = registration.getUser().getEmail();
        String subject = "Ticket Booking Confirmed - " + registration.getEvent().getTitle();
        
        List<com.eventplatform.entity.TicketAttendee> guests = ticketAttendeeRepository.findByRegistrationId(registration.getId());

        if (mailSender == null) {
            logFallback(toEmail, subject, "PDF Ticket generated for primary: " + registration.getRegistrationNumber());
            for (com.eventplatform.entity.TicketAttendee guest : guests) {
                logFallback(guest.getAttendeeEmail(), "Guest Ticket: " + registration.getEvent().getTitle(), "PDF Ticket generated for guest " + guest.getAttendeeName() + " (Seat " + guest.getSeatCode() + ")");
            }
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(toEmail);
            helper.setSubject(subject);
            
            String htmlContent = "<h3>Dear " + registration.getUser().getName() + ",</h3>" +
                    "<p>Your ticket booking for <strong>" + registration.getEvent().getTitle() + "</strong> has been successfully confirmed!</p>" +
                    "<p><strong>Ticket Details:</strong></p>" +
                    "<ul>" +
                    "<li><strong>Booking ID:</strong> " + registration.getRegistrationNumber() + "</li>" +
                    "<li><strong>Seats:</strong> " + (registration.getSeats() != null ? registration.getSeats() : "General") + "</li>" +
                    "<li><strong>Venue:</strong> " + registration.getEvent().getLocation() + "</li>" +
                    "</ul>" +
                    "<p>Your entry ticket PDF pass is attached to this email. Please scan the QR code at the entry gate.</p>" +
                    "<br/><p>Best regards,<br/>EventHub Team</p>";
            
            helper.setText(htmlContent, true);
            
            // Generate PDF Ticket pass using OpenPDF helper
            byte[] pdfBytes = PdfTicketGenerator.generateTicketPdf(registration);
            helper.addAttachment("Ticket-" + registration.getRegistrationNumber() + ".pdf", new ByteArrayResource(pdfBytes));

            // Generate ICS Calendar Invitation attachment (RFC 5545 compliance)
            try {
                java.time.format.DateTimeFormatter icsFormatter = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
                String startStr = registration.getEvent().getDate().format(icsFormatter);
                String endStr = registration.getEvent().getDate().plusHours(2).format(icsFormatter);
                String icsContent = "BEGIN:VCALENDAR\n" +
                        "VERSION:2.0\n" +
                        "PRODID:-//EventHub//CalendarInvitation//EN\n" +
                        "CALSCALE:GREGORIAN\n" +
                        "METHOD:REQUEST\n" +
                        "BEGIN:VEVENT\n" +
                        "UID:" + registration.getRegistrationNumber() + "@eventhub.com\n" +
                        "DTSTAMP:" + java.time.LocalDateTime.now().format(icsFormatter) + "\n" +
                        "DTSTART:" + startStr + "\n" +
                        "DTEND:" + endStr + "\n" +
                        "SUMMARY:" + registration.getEvent().getTitle() + "\n" +
                        "DESCRIPTION:Your Event Ticket Code is: " + registration.getRegistrationNumber() + "\\nSeats Booked: " + (registration.getSeats() != null ? registration.getSeats() : "General") + "\n" +
                        "LOCATION:" + registration.getEvent().getLocation() + "\n" +
                        "SEQUENCE:0\n" +
                        "STATUS:CONFIRMED\n" +
                        "TRANSP:OPAQUE\n" +
                        "END:VEVENT\n" +
                        "END:VCALENDAR";
                helper.addAttachment("event-invite.ics", new ByteArrayResource(icsContent.getBytes(java.nio.charset.StandardCharsets.UTF_8)), "text/calendar");
            } catch (Exception icsEx) {
                System.err.println("Failed to generate and attach ICS calendar invite: " + icsEx.getMessage());
            }
            
            mailSender.send(message);

            // Send guest tickets
            for (com.eventplatform.entity.TicketAttendee guest : guests) {
                try {
                    MimeMessage guestMessage = mailSender.createMimeMessage();
                    MimeMessageHelper guestHelper = new MimeMessageHelper(guestMessage, true, "UTF-8");
                    
                    guestHelper.setTo(guest.getAttendeeEmail());
                    guestHelper.setSubject("Ticket Pass for Event: " + registration.getEvent().getTitle());
                    
                    String guestHtml = "<h3>Dear " + guest.getAttendeeName() + ",</h3>" +
                            "<p>A ticket booking seat has been reserved for you by <strong>" + registration.getUser().getName() + "</strong> for the event <strong>" + registration.getEvent().getTitle() + "</strong>!</p>" +
                            "<p><strong>Ticket Details:</strong></p>" +
                            "<ul>" +
                            "<li><strong>Booking ID:</strong> " + registration.getRegistrationNumber() + "</li>" +
                            "<li><strong>Seat Allocated:</strong> " + guest.getSeatCode() + "</li>" +
                            "<li><strong>Venue:</strong> " + registration.getEvent().getLocation() + "</li>" +
                            "</ul>" +
                            "<p>Your individual entry ticket PDF pass is attached to this email. Please scan the QR code at the entry gate.</p>" +
                            "<br/><p>Best regards,<br/>EventHub Team</p>";
                    
                    guestHelper.setText(guestHtml, true);
                    
                    // Generate Guest PDF Ticket (single seat)
                    double seatPrice = registration.getEvent().getPrice();
                    boolean isVIP = "VIP_FRONT".equalsIgnoreCase(registration.getEvent().getSeatingLayout()) && guest.getSeatCode().length() > 0 && (guest.getSeatCode().charAt(0) - 'A') < 2;
                    if (isVIP) {
                        seatPrice *= 1.5;
                    }
                    byte[] guestPdfBytes = PdfTicketGenerator.generateTicketPdf(registration, guest.getAttendeeName(), guest.getSeatCode(), seatPrice);
                    guestHelper.addAttachment("Ticket-" + guest.getAttendeeName().replaceAll("\\s+", "_") + ".pdf", new ByteArrayResource(guestPdfBytes));

                    // Generate guest calendar invite
                    try {
                        java.time.format.DateTimeFormatter icsFormatter = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
                        String startStr = registration.getEvent().getDate().format(icsFormatter);
                        String endStr = registration.getEvent().getDate().plusHours(2).format(icsFormatter);
                        String icsContent = "BEGIN:VCALENDAR\n" +
                                "VERSION:2.0\n" +
                                "PRODID:-//EventHub//CalendarInvitation//EN\n" +
                                "CALSCALE:GREGORIAN\n" +
                                "METHOD:REQUEST\n" +
                                "BEGIN:VEVENT\n" +
                                "UID:" + registration.getRegistrationNumber() + "-" + guest.getSeatCode() + "@eventhub.com\n" +
                                "DTSTAMP:" + java.time.LocalDateTime.now().format(icsFormatter) + "\n" +
                                "DTSTART:" + startStr + "\n" +
                                "DTEND:" + endStr + "\n" +
                                "SUMMARY:" + registration.getEvent().getTitle() + "\n" +
                                "DESCRIPTION:Your Event Ticket Code is: " + registration.getRegistrationNumber() + "\\nSeat: " + guest.getSeatCode() + "\n" +
                                "LOCATION:" + registration.getEvent().getLocation() + "\n" +
                                "SEQUENCE:0\n" +
                                "STATUS:CONFIRMED\n" +
                                "TRANSP:OPAQUE\n" +
                                "END:VEVENT\n" +
                                "END:VCALENDAR";
                        guestHelper.addAttachment("event-invite.ics", new ByteArrayResource(icsContent.getBytes(java.nio.charset.StandardCharsets.UTF_8)), "text/calendar");
                    } catch (Exception icsEx) {
                        System.err.println("Failed to attach guest calendar invite: " + icsEx.getMessage());
                    }

                    mailSender.send(guestMessage);
                    System.out.println("Dispatched guest ticket email to: " + guest.getAttendeeEmail());
                } catch (Exception ex) {
                    System.err.println("Failed to send guest ticket email to " + guest.getAttendeeEmail() + ": " + ex.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send booking confirmation email via SMTP: " + e.getMessage());
            logFallback(toEmail, subject, "Booking Confirmation for: " + registration.getRegistrationNumber());
        }
    }
    @Override
    @Async
    public void sendWelcomeEmail(String to, String name) {
        String subject = "Welcome to EventHub, " + name + "! 🎉";
        
        String htmlContent = "<div style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;\">" +
                "  <div style=\"text-align: center; margin-bottom: 24px;\">" +
                "    <span style=\"font-size: 26px; font-weight: 900; color: #4f46e5; letter-spacing: -0.025em;\">Event<span style=\"color: #0f172a;\">Hub</span></span>" +
                "  </div>" +
                "  <div style=\"background-color: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #f1f5f9; margin-bottom: 24px; text-align: left;\">" +
                "    <h2 style=\"margin-top: 0; color: #0f172a; font-size: 20px; font-weight: 800; line-height: 1.3;\">Welcome to the Club, " + name + "! 🎉</h2>" +
                "    <p style=\"color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 16px;\">We are absolutely thrilled to have you join EventHub—your new gateway to premium live concerts, technical conferences, and hands-on workshops!</p>" +
                "    <p style=\"color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 8px;\">Here is what you can do right now:</p>" +
                "    <ul style=\"color: #475569; font-size: 14px; line-height: 1.6; padding-left: 20px; margin-top: 0;\">" +
                "      <li style=\"margin-bottom: 8px;\">🔍 <strong>Explore Catalog</strong>: Browse upcoming live events and filter by location, price, and category.</li>" +
                "      <li style=\"margin-bottom: 8px;\">🎟️ <strong>Interactive Seating</strong>: Choose your perfect seat using our real-time interactive seat layouts.</li>" +
                "      <li style=\"margin-bottom: 8px;\">📥 <strong>Instant Tickets</strong>: Get verified QR passes emailed directly as PDF attachments.</li>" +
                "    </ul>" +
                "  </div>" +
                "  <div style=\"text-align: center; margin-bottom: 24px;\">" +
                "    <a href=\"https://eventhub-repo.vercel.app\" style=\"display: inline-block; padding: 12px 28px; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);\">Explore Upcoming Events</a>" +
                "  </div>" +
                "  <hr style=\"border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;\" />" +
                "  <p style=\"color: #94a3b8; font-size: 11px; text-align: center; margin: 0;\">You received this email because you signed up on EventHub.<br/>&copy; 2026 EventHub Inc. All rights reserved.</p>" +
                "</div>";

        if (mailSender == null) {
            logFallback(to, subject, htmlContent);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email via SMTP: " + e.getMessage());
            logFallback(to, subject, htmlContent);
        }
    }
    private void logFallback(String to, String subject, String content) {
        System.out.println("========== [EMAIL FALLBACK LOGGER] ==========");
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Body/Info: " + content.replaceAll("<[^>]*>", " "));
        System.out.println("=============================================");
    }
}
