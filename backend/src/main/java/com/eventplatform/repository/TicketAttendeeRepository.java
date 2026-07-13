package com.eventplatform.repository;

import com.eventplatform.entity.TicketAttendee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketAttendeeRepository extends JpaRepository<TicketAttendee, Long> {
    List<TicketAttendee> findByRegistrationId(Long registrationId);
}
