package com.eventplatform.dto;

// DTO representing the platform metrics response sent to the Admin Dashboard.
public class AdminStatsResponse {

    // Total count of registered user accounts.
    private long totalUsers;

    // Total count of events currently listed in the catalog.
    private long totalEvents;

    // Total count of event ticket bookings.
    private long totalRegistrations;

    // Sum total amount (INR) generated from successful transactions.
    private double totalRevenue;

    // Default Constructor: Required for JSON serialization
    public AdminStatsResponse() {
    }

    // Parameterized Constructor:
    public AdminStatsResponse(long totalUsers, long totalEvents, long totalRegistrations, double totalRevenue) {
        this.totalUsers = totalUsers;
        this.totalEvents = totalEvents;
        this.totalRegistrations = totalRegistrations;
        this.totalRevenue = totalRevenue;
    }

    // Getters and Setters:
    
    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public long getTotalRegistrations() {
        return totalRegistrations;
    }

    public void setTotalRegistrations(long totalRegistrations) {
        this.totalRegistrations = totalRegistrations;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
}
