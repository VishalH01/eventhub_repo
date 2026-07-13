package com.eventplatform.repository;

import com.eventplatform.entity.EventReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventReviewRepository extends JpaRepository<EventReview, Long> {
    List<EventReview> findByEventIdOrderByCreatedAtDesc(Long eventId);
    boolean existsByEventIdAndUserId(Long eventId, Long userId);
}
