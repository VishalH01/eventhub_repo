package com.eventplatform.service;

import com.eventplatform.entity.Registration;
import java.util.List;

public interface RegistrationService {

    public static class AttendeeDTO {
        private String seatCode;
        private String name;
        private String email;

        public AttendeeDTO() {}

        public AttendeeDTO(String seatCode, String name, String email) {
            this.seatCode = seatCode;
            this.name = name;
            this.email = email;
        }

        public String getSeatCode() {
            return seatCode;
        }

        public void setSeatCode(String seatCode) {
            this.seatCode = seatCode;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    // Books a ticket for a specific event by user email with custom seats and guest list.
    Registration bookEvent(Long eventId, String email, List<String> seats, String couponCode, List<AttendeeDTO> attendees);

    // Retrieves all bookings registered by the user.
    List<Registration> getMyRegistrations(String email);

    // Cancels a specific event registration after verifying ownership.
    void cancelRegistration(Long id, String email);

    // Retrieves all reserved seats for a specific event.
    List<String> getReservedSeats(Long eventId);

    // Processes refunds for expired waitlisted registrations globally.
    void processAllExpiredWaitlists();
}
