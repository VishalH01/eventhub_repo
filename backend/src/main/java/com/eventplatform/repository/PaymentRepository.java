package com.eventplatform.repository;

import com.eventplatform.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Repository interface for managing Payment entity persistence in the MySQL 'payments' table.
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
