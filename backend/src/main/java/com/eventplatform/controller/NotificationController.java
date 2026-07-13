package com.eventplatform.controller;

import com.eventplatform.entity.Notification;
import com.eventplatform.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // 1. Get Logged-in User's Notifications
    // - Route: GET http://localhost:8080/api/notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String email = principal.getName();
        return ResponseEntity.ok(notificationRepository.findByUserEmailOrderByTimestampDesc(email));
    }

    // 2. Mark Single Notification as Read
    // - Route: POST http://localhost:8080/api/notifications/read/{id}
    @PostMapping("/read/{id}")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification == null) {
            return ResponseEntity.notFound().build();
        }
        // Verify ownership
        if (!notification.getUser().getEmail().equalsIgnoreCase(principal.getName())) {
            return ResponseEntity.status(403).body("Access Denied: Cannot modify other user's notification.");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok("Notification marked as read.");
    }

    // 3. Mark All Notifications as Read
    // - Route: POST http://localhost:8080/api/notifications/read-all
    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String email = principal.getName();
        List<Notification> unread = notificationRepository.findByUserEmailOrderByTimestampDesc(email);
        for (Notification notification : unread) {
            if (!notification.isRead()) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        }
        return ResponseEntity.ok("All notifications marked as read.");
    }
}
