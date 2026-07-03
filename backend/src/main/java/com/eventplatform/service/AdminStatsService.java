package com.eventplatform.service;

import com.eventplatform.dto.AdminStatsResponse;

public interface AdminStatsService {

    // Aggregates statistics for administrative display: counts of users, events,
    // bookings, and sums total successfully processed revenue.
    AdminStatsResponse getPlatformStats();
}
