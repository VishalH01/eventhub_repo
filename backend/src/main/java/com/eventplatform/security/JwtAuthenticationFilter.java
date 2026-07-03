package com.eventplatform.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

// @Component: Marks this class as a Spring Bean managed by Spring IoC container.
// OncePerRequestFilter: A base class that guarantees a single execution per request dispatch.
// This is critical to ensure we only validate the JWT token once for every incoming API request.
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    // doFilterInternal: The core filter method. It intercepts every HTTP request.
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        // 1. Get the JWT token from the Authorization header of the request
        String token = getJwtFromRequest(request);

        // 2. Validate the token and authenticate the user if the token is valid
        if (StringUtils.hasText(token) && tokenProvider.validateToken(token)) {
            
            // Extract the username (email) from the token
            String username = tokenProvider.getUsernameFromJWT(token);
            
            // Extract the roles from the token claims
            List<String> roles = tokenProvider.getRolesFromJWT(token);

            // Convert our role strings (e.g. "ROLE_USER") into SimpleGrantedAuthority objects
            // which Spring Security uses to enforce authorization constraints.
            List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            // Create a UsernamePasswordAuthenticationToken:
            // - username: User identity principal.
            // - null: Password credentials (we set this to null since JWT is stateless and we don't hold passwords here).
            // - authorities: User permission list.
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    username, null, authorities
            );

            // Build request-level details (like IP address, session ID) and attach them to the authentication token.
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Set the authentication in the SecurityContextHolder.
            // Once set, this tells Spring Security that the user is officially logged in (authenticated) for this request.
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 3. Forward the request/response to the next filter in the filter chain (e.g., other security checks, or the controller)
        filterChain.doFilter(request, response);
    }

    // Helper method to extract the JWT token from the HTTP 'Authorization' header.
    private String getJwtFromRequest(HttpServletRequest request) {
        // Read the 'Authorization' header from the request
        String bearerToken = request.getHeader("Authorization");
        
        // The standard token format is: Bearer <token_string>
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            // Remove the 'Bearer ' prefix (7 characters) to extract only the raw token string
            return bearerToken.substring(7);
        }
        return null; // Return null if header is missing or in wrong format
    }
}
