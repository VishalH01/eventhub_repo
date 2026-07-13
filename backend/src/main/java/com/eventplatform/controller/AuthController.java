package com.eventplatform.controller;

import com.eventplatform.dto.AuthResponse;
import com.eventplatform.dto.LoginRequest;
import com.eventplatform.dto.RegisterRequest;
import com.eventplatform.dto.GoogleLoginRequest;
import com.eventplatform.dto.ResetPasswordRequest;
import com.eventplatform.entity.User;
import com.eventplatform.entity.OtpVerification;
import com.eventplatform.repository.UserRepository;
import com.eventplatform.repository.OtpVerificationRepository;
import com.eventplatform.service.AuthService;
import com.eventplatform.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

// @RestController: Combined annotation that marks this class as a REST Controller and automatically
// serializes method return values directly into JSON responses in the HTTP Response Body.
// @RequestMapping("/api/auth"): Maps all requests in this controller under the prefix "/api/auth".
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. Register Endpoint
    // - Route: POST http://localhost:8080/api/auth/register
    // - Input: JSON body containing RegisterRequest.
    // - Output: HTTP Status 201 Created on success, or 400 Bad Request on failure (e.g. duplicate email).
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            // Call service layer to perform registration logic
            String responseMessage = authService.register(registerRequest);
            // Return HTTP 201 (Created) along with the success message
            return new ResponseEntity<>(responseMessage, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // If any duplicate email or invalid assignment exception is thrown,
            // return HTTP 400 (Bad Request) along with the error message.
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Login Endpoint
    // - Route: POST http://localhost:8080/api/auth/login
    // - Input: JSON body containing LoginRequest.
    // - Output: HTTP Status 200 OK with JWT token & profile DTO on success, or 401 Unauthorized on bad credentials.
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            // Call service layer to authenticate and retrieve token details
            AuthResponse authResponse = authService.login(loginRequest);
            // Return HTTP 200 (OK) with the token response details
            return ResponseEntity.ok(authResponse);
        } catch (RuntimeException e) {
            // Return HTTP 401 (Unauthorized) if authentication fails (e.g. invalid username/password)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password!");
        }
    }

    // 3. Google OAuth SSO Login Endpoint
    // - Route: POST http://localhost:8080/api/auth/google-login
    // - Input: JSON body containing GoogleLoginRequest.
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        try {
            AuthResponse authResponse = authService.googleLogin(request.getIdToken());
            return ResponseEntity.ok(authResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // 4. Forgot Password - Generate & Send OTP Endpoint
    // - Route: POST http://localhost:8080/api/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam("email") String email) {
        // Verify user exists with this email
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No account found with email: " + email);
        }

        try {
            // Generate a 6-digit random numeric OTP
            Random random = new Random();
            int otpNum = 100000 + random.nextInt(900000);
            String otp = String.valueOf(otpNum);

            // Clear any previously generated OTPs for this email address to keep database clean
            Optional<OtpVerification> existingOpt = otpVerificationRepository.findByEmail(email);
            existingOpt.ifPresent(otpVerificationRepository::delete);

            // Save new OTP verification token with a 10-minute expiry time
            OtpVerification verification = new OtpVerification(email, otp, LocalDateTime.now().plusMinutes(10));
            otpVerificationRepository.save(verification);

            // Send OTP email
            String emailBody = "Hello " + userOpt.get().getName() + ",\n\n" +
                    "We received a request to reset your EventHub account password.\n" +
                    "Your One-Time Password (OTP) verification code is:\n\n" +
                    "=== " + otp + " ===\n\n" +
                    "This OTP is valid for 10 minutes. If you did not make this request, please ignore this email.\n\n" +
                    "Best regards,\nEventHub Team";
            emailService.sendSimpleEmail(email, "Reset Password OTP Verification - EventHub", emailBody);

            return ResponseEntity.ok("OTP sent to your email address successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process forgot password request: " + e.getMessage());
        }
    }

    // 5. Verify OTP Endpoint
    // - Route: POST http://localhost:8080/api/auth/verify-otp
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam("email") String email, @RequestParam("otp") String otp) {
        Optional<OtpVerification> verificationOpt = otpVerificationRepository.findByEmailAndOtp(email, otp);
        
        if (verificationOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid OTP code!");
        }

        OtpVerification verification = verificationOpt.get();
        if (verification.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpVerificationRepository.delete(verification);
            return ResponseEntity.badRequest().body("OTP has expired! Please request a new code.");
        }

        return ResponseEntity.ok("OTP verified successfully.");
    }

    // 6. Reset Password Endpoint
    // - Route: POST http://localhost:8080/api/auth/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        Optional<OtpVerification> verificationOpt = otpVerificationRepository.findByEmailAndOtp(request.getEmail(), request.getOtp());
        
        if (verificationOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid OTP or authorization mismatch!");
        }

        OtpVerification verification = verificationOpt.get();
        if (verification.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpVerificationRepository.delete(verification);
            return ResponseEntity.badRequest().body("Verification code expired!");
        }

        // Locate user to reset
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User profile not found!"));

        // Hash new password and save
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Delete OTP verification token so it cannot be reused
        otpVerificationRepository.delete(verification);

        return ResponseEntity.ok("Password reset successfully. You can now log in with your new password.");
    }
}
