package com.eventplatform.controller;

import com.eventplatform.dto.AdminStatsResponse;
import com.eventplatform.service.AdminStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// @RestController: Combined mapping for JSON payload serialization.
// @RequestMapping("/api/admin"): Sets prefix prefix `/api/admin` for administrative routes.
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminStatsService adminStatsService;

    // 1. Fetch Analytics Metrics
    // - Route: GET http://localhost:8080/api/admin/stats
    // - Access: Secured (restricted strictly to ROLE_ADMIN via SecurityConfig)
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getPlatformStats() {
        AdminStatsResponse stats = adminStatsService.getPlatformStats();
        return ResponseEntity.ok(stats);
    }
}
