package com.eventplatform.service;

import com.eventplatform.dto.AuthResponse;
import com.eventplatform.dto.LoginRequest;
import com.eventplatform.dto.RegisterRequest;
import com.eventplatform.entity.Role;
import com.eventplatform.entity.User;
import com.eventplatform.repository.RoleRepository;
import com.eventplatform.repository.UserRepository;
import com.eventplatform.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

// @Service: Declares this class as a Service component, containing our core authentication business logic.
@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    // 1. User Registration Logic
    @Override
    public String register(RegisterRequest registerRequest) {
        // Step A: Check if the email is already registered in our database.
        // If it is, throw a RuntimeException to halt registration and inform the client.
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already registered! Please use a different email.");
        }

        // Step B: Encrypt the user's raw password before saving it.
        // Hashing ensures that even if our database is compromised, passwords remain unreadable.
        String encodedPassword = passwordEncoder.encode(registerRequest.getPassword());

        // Step C: Create a new User entity from the request details.
        User user = new User(
                registerRequest.getName(),
                registerRequest.getEmail(),
                encodedPassword
        );

        // Step D: Retrieve the default 'ROLE_USER' role from the database.
        // The default role is seeded on startup (configured in DataInitializer).
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Default User Role not found in database."));

        // Step E: Assign the default user role to this user account
        user.getRoles().add(userRole);

        // Step F: Save the User entity. JPA automatically inserts records in both 'users' and the junction 'user_roles' tables.
        userRepository.save(user);

        return "User registered successfully!";
    }

    // 2. User Login Logic
    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        // Step A: Authenticate user credentials using the AuthenticationManager.
        // - It will automatically invoke our CustomUserDetailsService to load the user's password hash from the database.
        // - It compares the hashed password against the entered password.
        // - If credentials are invalid, it throws a BadCredentialsException.
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        ));

        // Step B: Set the authenticated Authentication object inside Spring's SecurityContext.
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Step C: Generate a signed JWT token containing the authenticated user's details.
        String token = tokenProvider.generateToken(authentication);

        // Step D: Retrieve the user from our database to get their profile name and roles to return to the frontend.
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found: " + loginRequest.getEmail()));

        // Convert the user's roles to a list of role name strings
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        // Step E: Return the AuthResponse containing the JWT token and user profile details.
        return new AuthResponse(token, user.getEmail(), user.getName(), roles);
    }
}
