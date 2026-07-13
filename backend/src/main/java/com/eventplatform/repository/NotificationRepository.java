package com.eventplatform.repository;

import com.eventplatform.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserEmailOrderByTimestampDesc(String email);
    List<Notification> findByUserIdIsNullOrderByTimestampDesc();
}
