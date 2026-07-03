package com.eventplatform.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

// @Component: Marks this class as a Spring Bean component that can be injected (auto-wired) elsewhere.
@Component
public class JwtTokenProvider {

    // Base64-encoded secret key (must be at least 256 bits/32 bytes for HS256, or 512 bits for HS512).
    // We inject this from application.properties using @Value, with a secure fallback value.
    @Value("${app.jwt-secret:dGhpcy1pcy1hLXNlY3VyZS1hbmQtc3Ryb25nLXNlY3JldC1rZXktZm9yLWp3dC1hdXRoZW50aWNhdGlvbi1zcHJpbmctYm9vdC1ldmVudC1wbGF0Zm9ybQ==}")
    private String jwtSecret;

    // Token expiration time in milliseconds (e.g., 604800000 ms = 7 days).
    @Value("${app.jwt-expiration-milliseconds:604800000}")
    private long jwtExpirationDate;

    // Helper method to convert our Base64 secret string into a cryptographic Key object.
    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    // 1. Generate JWT Token
    // - This method takes the Spring Security Authentication object representing the logged-in user.
    // - It extracts their username and roles, and packs them into a signed JWT string.
    public String generateToken(Authentication authentication) {
        // Extract the user's principal name (username / email in our case)
        String username = authentication.getName();

        // Get the current time and calculate the token's expiration date
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationDate);

        // Convert the user's collection of GrantedAuthorities (roles) into a simple List of Strings
        // (e.g. GrantedAuthority [authority=ROLE_USER] -> "ROLE_USER")
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        // Build the JWT:
        // - setSubject(username): Sets the username (email) as the token subject.
        // - claim("roles", roles): Stores the list of roles in a custom claim called "roles".
        // - setIssuedAt(currentDate): Sets the time the token was created.
        // - setExpiration(expireDate): Sets the time the token expires.
        // - signWith(key(), SignatureAlgorithm.HS512): Signs the token with our secret key using HS512.
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .setIssuedAt(currentDate)
                .setExpiration(expireDate)
                .signWith(key(), SignatureAlgorithm.HS512)
                .compact();
    }

    // 2. Extract Username (Email) from JWT Token
    public String getUsernameFromJWT(String token) {
        // Parse the token's claims (payload) using our secret key
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
        
        // The subject of the JWT stores the username (email)
        return claims.getSubject();
    }

    // 3. Extract Roles from JWT Token
    public List<String> getRolesFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();

        // Retrieve our custom "roles" claim list
        return claims.get("roles", List.class);
    }

    // 4. Validate JWT Token
    // Checks if the token is properly signed, not expired, and not malformed.
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parse(token);
            return true; // Token is valid
        } catch (MalformedJwtException ex) {
            System.err.println("Invalid JWT token: " + ex.getMessage());
        } catch (ExpiredJwtException ex) {
            System.err.println("Expired JWT token: " + ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            System.err.println("Unsupported JWT token: " + ex.getMessage());
        } catch (IllegalArgumentException ex) {
            System.err.println("JWT claims string is empty: " + ex.getMessage());
        }
        return false; // Token is invalid
    }
}
