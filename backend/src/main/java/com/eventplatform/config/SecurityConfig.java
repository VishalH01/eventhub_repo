package com.eventplatform.config;

import com.eventplatform.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

// @Configuration: Tells Spring Boot that this class contains configuration settings and Bean declarations.
// @EnableWebSecurity: Integrates Spring Security's web security support.
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // 1. Password Encoder Bean
    // - BCryptPasswordEncoder is a standard, strong password hashing function.
    // - It automatically generates a secure salt value and hashes the password multiple times.
    // - Never store plain text passwords in the database.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 2. Authentication Manager Bean
    // - The AuthenticationManager is the core Spring Security interface responsible for validating user credentials.
    // - Used during login to authenticate users.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // 3. Security Filter Chain Configuration Bean
    // - This method configures HTTP security filter constraints.
    // - It defines which URL paths are public and which ones require authentication/authorization.
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // http.csrf(csrf -> csrf.disable()):
        // - CSRF (Cross-Site Request Forgery) protection is disabled because our REST API is stateless
        //   and authenticated via JWT (we do not use server-side session cookies).
        http.csrf(csrf -> csrf.disable())
            
            // Enable our custom CORS configuration (detailed below)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Configure route-level URL access control rules:
            .authorizeHttpRequests(auth -> auth
                // Allow public access to all auth API endpoints (Register and Login must be public!)
                .requestMatchers("/api/auth/**").permitAll()
                
                // Allow public access to read (GET) event listings
                .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
                
                // Restrict modifying events (POST, PUT, DELETE) strictly to ADMIN users
                .requestMatchers(HttpMethod.POST, "/api/events/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/events/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/events/**").hasRole("ADMIN")
                
                // Restrict administrative stats APIs strictly to ADMIN users
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Any other API requests require the user to be logged in (authenticated)
                .anyRequest().authenticated()
            )
            
            // Configure Session Management:
            // - SessionCreationPolicy.STATELESS: Disables HTTP Sessions. Spring Boot will not create or
            //   store sessions for users. This forces the app to validate the JWT token on every request.
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // Add our custom JwtAuthenticationFilter before Spring Security's standard UsernamePasswordAuthenticationFilter.
        // This ensures the JWT token is checked, validated, and authentication is set in the context
        // before Spring Security performs any subsequent role authorization checks.
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 4. CORS Configuration Source Bean
    // - CORS (Cross-Origin Resource Sharing) is a security mechanism built into browsers.
    // - By default, browsers block web pages (e.g. React running on port 5173) from making requests to
    //   a different domain/port (e.g. Spring Boot on port 8080).
    // - This bean explicitly configures our backend to allow cross-origin requests from our React app.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> allowedPatterns = new ArrayList<>();
        // Always allow local development
        allowedPatterns.add("http://localhost:5173");
        allowedPatterns.add("http://localhost:3000");
        // Always allow Vercel production and preview subdomains
        allowedPatterns.add("https://*.vercel.app");
        allowedPatterns.add("https://eventhub-repo.vercel.app");

        // Parse and append custom production domains from environment variables if defined
        String allowedOriginsEnv = System.getenv("ALLOWED_ORIGINS");
        if (allowedOriginsEnv != null && !allowedOriginsEnv.trim().isEmpty()) {
            for (String origin : allowedOriginsEnv.split(",")) {
                String trimmed = origin.trim();
                if (!trimmed.isEmpty()) {
                    allowedPatterns.add(trimmed);
                }
            }
        }
        configuration.setAllowedOriginPatterns(allowedPatterns);
        // Allow all standard HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Allow all request headers (Authorization, Content-Type, etc.)
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // Allow sending cookie credentials or Authorization headers
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this CORS configuration to all API routes
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
