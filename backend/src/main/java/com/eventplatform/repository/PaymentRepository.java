package com.eventplatform.repository;

import com.eventplatform.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

// Repository interface for managing Payment entity persistence in the MySQL 'payments' table.
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Custom JPQL Query: Calculates the sum of all successful payment transactions.
    // - COALESCE(SUM(p.amount), 0.0): If no successful payments exist yet in the database,
    //   this returns 0.0 instead of null, preventing NullPointerExceptions in our Java code.
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.status = 'SUCCESS'")
    Double getTotalRevenue();
}
