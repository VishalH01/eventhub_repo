package com.eventplatform.repository;

import com.eventplatform.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    // Custom Query Method: Finds all registrations belonging to a specific user's email.
    // - Spring Data JPA automatically traverses the Registration -> User relationship to perform the join query:
    //   SELECT r.* FROM registrations r JOIN users u ON r.user_id = u.id WHERE u.email = ?;
    // - Returned lists are used to display the user's booking history under "My Registrations".
    List<Registration> findByUserEmail(String email);

    // Custom Query Method: Checks if a registration already exists for a specific user email and event ID.
    // - Compiles into a fast EXISTS query in MySQL.
    // - Used to prevent duplicate bookings for the same event by the same user.
    boolean existsByUserEmailAndEventId(String email, Long eventId);

    List<Registration> findByEventIdAndStatusIn(Long eventId, List<String> statuses);

    List<Registration> findByEventIdAndStatusOrderByRegistrationDateAsc(Long eventId, String status);
}
