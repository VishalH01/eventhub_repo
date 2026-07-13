package com.eventplatform.repository;

import com.eventplatform.entity.EventWaitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventWaitlistRepository extends JpaRepository<EventWaitlist, Long> {
    List<EventWaitlist> findByEventIdOrderByCreatedAtAsc(Long eventId);
    boolean existsByEventIdAndUserId(Long eventId, Long userId);
    Optional<EventWaitlist> findByEventIdAndUserId(Long eventId, Long userId);
}
