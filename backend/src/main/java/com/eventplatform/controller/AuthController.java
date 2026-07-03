package com.eventplatform.controller;

import com.eventplatform.dto.AuthResponse;
import com.eventplatform.dto.LoginRequest;
import com.eventplatform.dto.RegisterRequest;
import com.eventplatform.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// @RestController: Combined annotation that marks this class as a REST Controller and automatically
// serializes method return values directly into JSON responses in the HTTP Response Body.
// @RequestMapping("/api/auth"): Maps all requests in this controller under the prefix "/api/auth".
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // 1. Register Endpoint
    // - Route: POST http://localhost:8080/api/auth/register
    // - Input: JSON body containing RegisterRequest.
    // - Output: HTTP Status 201 Created on success, or 400 Bad Request on failure (e.g. duplicate email).
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
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
}
