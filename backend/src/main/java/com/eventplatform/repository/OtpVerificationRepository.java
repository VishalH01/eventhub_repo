package com.eventplatform.repository;

import com.eventplatform.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    
    Optional<OtpVerification> findByEmail(String email);
    
    Optional<OtpVerification> findByEmailAndOtp(String email, String otp);
    
    void deleteByEmail(String email);
}
