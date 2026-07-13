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

    @Autowired
    private EmailService emailService;

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

        // Step G: Trigger welcome email
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getName());
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }

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

    // 3. Google OAuth2 SSO Authentication Logic
    @Override
    public AuthResponse googleLogin(String googleIdToken) {
        try {
            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier =
                new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(
                    new com.google.api.client.http.javanet.NetHttpTransport(),
                    new com.google.api.client.json.gson.GsonFactory()
                ).build();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(googleIdToken);
            if (idToken == null) {
                throw new RuntimeException("Invalid Google ID Token signature!");
            }

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            // Check if the user already exists in our database
            java.util.Optional<User> userOpt = userRepository.findByEmail(email);
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
            } else {
                // Auto-register the Google user in our system
                String randomPassword = passwordEncoder.encode(java.util.UUID.randomUUID().toString());
                user = new User(name, email, randomPassword);
                
                Role defaultRole = roleRepository.findByName("ROLE_USER")
                        .orElseThrow(() -> new RuntimeException("Default User Role not found in database."));
                user.getRoles().add(defaultRole);
                userRepository.save(user);

                // Trigger welcome email for new Google user
                try {
                    emailService.sendWelcomeEmail(email, name);
                } catch (Exception ex) {
                    System.err.println("Failed to send Google welcome email: " + ex.getMessage());
                }
            }

            // Create Spring Security Authentication object dynamically for the verified user
            UsernamePasswordAuthenticationToken authenticationToken = 
                new UsernamePasswordAuthenticationToken(email, null, 
                    user.getRoles().stream()
                        .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority(role.getName()))
                        .collect(Collectors.toList())
                );

            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            // Generate our own local EventHub JWT token
            String localToken = tokenProvider.generateToken(authenticationToken);

            List<String> roles = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());

            return new AuthResponse(localToken, user.getEmail(), user.getName(), roles);

        } catch (Exception e) {
            throw new RuntimeException("Google Authentication failed: " + e.getMessage(), e);
        }
    }
}
