package com.eventplatform.security;

import com.eventplatform.entity.User;
import com.eventplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.stream.Collectors;

// @Service: Marks this class as a Service component managed by Spring.
// UserDetailsService: A core interface in Spring Security used to retrieve user authentication details.
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    // loadUserByUsername: Method invoked automatically by Spring Security's AuthenticationManager
    // to retrieve the user's password and authorities (roles) from the database during login.
    // In our system, the user logins with their email address, so the 'username' parameter receives the email.
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Query the database to find the user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Map the user's Set of Role entities to a Set of Spring Security SimpleGrantedAuthority objects
        Set<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toSet());

        // Return a Spring Security 'UserDetails' representation of our custom User object:
        // - user.getEmail(): Username
        // - user.getPassword(): Hashed password
        // - authorities: User role permissions
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}
