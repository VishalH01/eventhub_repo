package com.eventplatform.service;

import com.eventplatform.dto.AuthResponse;
import com.eventplatform.dto.LoginRequest;
import com.eventplatform.dto.RegisterRequest;

// Service Interface: Declares the business logic methods for authentication.
// Interfaces promote decoupling (separating definition from implementation) which is a key design best practice.
public interface AuthService {

    // Handles user account creation.
    // - Input: RegisterRequest DTO containing name, email, and raw password.
    // - Returns: Success message string.
    String register(RegisterRequest registerRequest);

    // Handles user sign-in authentication.
    // - Input: LoginRequest DTO containing email and raw password.
    // - Returns: AuthResponse DTO containing JWT token and basic user details on success.
    AuthResponse login(LoginRequest loginRequest);
}
