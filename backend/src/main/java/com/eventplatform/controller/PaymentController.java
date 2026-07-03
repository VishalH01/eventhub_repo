package com.eventplatform.controller;

import com.eventplatform.dto.PaymentRequest;
import com.eventplatform.entity.Registration;
import com.eventplatform.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

// @RestController: Combined annotation mapping REST routes to JSON responses.
// @RequestMapping("/api/payments"): Prefixes all payment API endpoints.
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // 1. Create Payment Order
    // - Route: POST http://localhost:8080/api/payments/create-order/{registrationId}
    // - Generates a unique Razorpay Order ID for the ticket price.
    // - Access: Secured (authenticated users only)
    @PostMapping("/create-order/{registrationId}")
    public ResponseEntity<?> createOrder(@PathVariable("registrationId") Long registrationId) {
        try {
            String orderId = paymentService.createOrder(registrationId);
            // Return Order ID wrapped in a JSON map (e.g. {"orderId": "order_Njks883hda902"})
            return ResponseEntity.ok(Map.of("orderId", orderId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Verify Payment Callback Details
    // - Route: POST http://localhost:8080/api/payments/verify/{registrationId}
    // - Cryptographically validates signature returned by Razorpay Checkout.
    // - Access: Secured (authenticated users only)
    @PostMapping("/verify/{registrationId}")
    public ResponseEntity<?> verifyPayment(
            @PathVariable("registrationId") Long registrationId,
            @RequestBody PaymentRequest verifyRequest) {
        try {
            Registration confirmedReg = paymentService.verifyPayment(registrationId, verifyRequest);
            // Returns the confirmed registration object detailing the updated 'CONFIRMED' status.
            return ResponseEntity.ok(confirmedReg);
        } catch (RuntimeException e) {
            // Returns 400 Bad Request if cryptographic checks fail
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
