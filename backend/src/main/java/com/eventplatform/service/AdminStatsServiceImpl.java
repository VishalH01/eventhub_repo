package com.eventplatform.service;

import com.eventplatform.dto.AdminStatsResponse;
import com.eventplatform.repository.EventRepository;
import com.eventplatform.repository.PaymentRepository;
import com.eventplatform.repository.RegistrationRepository;
import com.eventplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// @Service: Declares this class as a Service Bean containing dashboard analytics aggregation logic.
@Service
public class AdminStatsServiceImpl implements AdminStatsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Override
    public AdminStatsResponse getPlatformStats() {
        // Step A: Aggregate total counts from JpaRepository default count() methods
        long totalUsers = userRepository.count();
        long totalEvents = eventRepository.count();
        long totalRegistrations = registrationRepository.count();

        // Step B: Query the custom JPQL revenue summation in PaymentRepository.
        // Even with COALESCE, we perform a safe double-check for null wrapper object values.
        Double calculatedRevenue = paymentRepository.getTotalRevenue();
        double totalRevenue = (calculatedRevenue != null) ? calculatedRevenue : 0.0;

        // Step C: Package aggregates into the AdminStatsResponse DTO
        return new AdminStatsResponse(
                totalUsers,
                totalEvents,
                totalRegistrations,
                totalRevenue
        );
    }
}
