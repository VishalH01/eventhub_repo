package com.eventplatform.service;

import com.eventplatform.entity.Event;
import com.eventplatform.entity.Registration;
import java.util.List;

public interface EmailService {
    void sendSimpleEmail(String to, String subject, String body);
    void sendEventCreationEmail(Event event, List<String> userEmails);
    void sendBookingConfirmationWithPdf(Registration registration);
    void sendWelcomeEmail(String to, String name);
}
