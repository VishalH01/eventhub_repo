package com.eventplatform.controller;

import com.eventplatform.entity.Coupon;
import com.eventplatform.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    // 1. Validate a Coupon (Public/User)
    // - Route: GET http://localhost:8080/api/coupons/validate
    @GetMapping("/api/coupons/validate")
    public ResponseEntity<?> validateCoupon(
            @RequestParam String code,
            @RequestParam Double amount) {
        
        Coupon coupon = couponRepository.findByCode(code.trim().toUpperCase())
                .orElse(null);

        if (coupon == null) {
            return ResponseEntity.badRequest().body("Invalid promo code. Please try another one.");
        }

        if (!coupon.isActive()) {
            return ResponseEntity.badRequest().body("This promo code has been deactivated.");
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("This promo code has expired.");
        }

        if (amount < coupon.getMinOrderAmount()) {
            return ResponseEntity.badRequest().body("Minimum booking amount to use this code is ₹" + coupon.getMinOrderAmount());
        }

        if (coupon.getUsageLimit() > 0 && coupon.getCurrentUsage() >= coupon.getUsageLimit()) {
            return ResponseEntity.badRequest().body("This promo code has reached its usage limit.");
        }

        double discount = 0.0;
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = amount * (coupon.getDiscountValue() / 100.0);
        } else if ("FIXED".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = coupon.getDiscountValue();
        }

        // Clamp discount to the amount
        if (discount > amount) {
            discount = amount;
        }

        double finalAmount = amount - discount;

        return ResponseEntity.ok(Map.of(
            "code", coupon.getCode(),
            "discountType", coupon.getDiscountType(),
            "discountValue", coupon.getDiscountValue(),
            "discountAmount", discount,
            "finalAmount", finalAmount
        ));
    }

    // 2. Admin: Get all coupons
    // - Route: GET http://localhost:8080/api/admin/coupons
    @GetMapping("/api/admin/coupons")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponRepository.findAll());
    }

    // 3. Admin: Create a coupon
    // - Route: POST http://localhost:8080/api/admin/coupons
    @PostMapping("/api/admin/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        if (coupon.getCode() == null || coupon.getCode().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Promo code cannot be empty.");
        }
        
        String cleanCode = coupon.getCode().trim().toUpperCase();
        if (couponRepository.findByCode(cleanCode).isPresent()) {
            return ResponseEntity.badRequest().body("Promo code '" + cleanCode + "' already exists.");
        }

        coupon.setCode(cleanCode);
        if (coupon.getDiscountType() == null || coupon.getDiscountType().trim().isEmpty()) {
            coupon.setDiscountType("PERCENTAGE");
        }
        if (coupon.getDiscountValue() == null || coupon.getDiscountValue() <= 0) {
            return ResponseEntity.badRequest().body("Discount value must be greater than 0.");
        }
        coupon.setCurrentUsage(0);

        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(saved);
    }

    // 4. Admin: Delete a coupon
    // - Route: DELETE http://localhost:8080/api/admin/coupons/{id}
    @DeleteMapping("/api/admin/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        Coupon coupon = couponRepository.findById(id).orElse(null);
        if (coupon == null) {
            return ResponseEntity.notFound().build();
        }
        couponRepository.delete(coupon);
        return ResponseEntity.ok("Coupon deleted successfully!");
    }
}
