package com.eventplatform.service;

import com.eventplatform.entity.Registration;
import java.util.List;

public interface RegistrationService {

    // Books a ticket for a specific event by user email.
    Registration bookEvent(Long eventId, String email);

    // Retrieves all bookings registered by the user.
    List<Registration> getMyRegistrations(String email);

    // Cancels a specific event registration after verifying ownership.
    void cancelRegistration(Long id, String email);
}
