package com.eventplatform.service;

import com.eventplatform.dto.PaymentRequest;
import com.eventplatform.entity.Registration;

public interface PaymentService {

    // Contacts Razorpay servers to open a transaction order for the given booking ID.
    // Returns the unique Razorpay Order ID.
    String createOrder(Long registrationId);

    // Cryptographically verifies the payment signature received from frontend.
    // If validated, updates the registration status to CONFIRMED and logs the transaction.
    Registration verifyPayment(Long registrationId, PaymentRequest verifyRequest);
}
