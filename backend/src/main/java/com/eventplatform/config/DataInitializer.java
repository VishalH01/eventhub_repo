package com.eventplatform.config;

import com.eventplatform.entity.Role;
import com.eventplatform.entity.User;
import com.eventplatform.repository.RoleRepository;
import com.eventplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.HashSet;

// @Component: Marks this class as a Spring Bean that is automatically scanned and registered.
// CommandLineRunner: A Spring Boot interface used to run a block of code exactly ONCE
// immediately after the application startup completes.
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles in the database
        Role userRole = seedRole("ROLE_USER");
        Role adminRole = seedRole("ROLE_ADMIN");

        // 2. Seed default Test accounts
        seedDefaultUser("User Test", "user@eventhub.com", "user123", userRole);
        seedDefaultAdmin("Admin Test", "admin@eventhub.com", "admin123", userRole, adminRole);
    }

    // Helper method to check if a role exists, and create it if missing.
    private Role seedRole(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(new Role(name)));
    }

    // Helper method to seed a default USER test account
    private void seedDefaultUser(String name, String email, String rawPassword, Role role) {
        if (!userRepository.existsByEmail(email)) {
            // Encode the test password before saving
            String encodedPassword = passwordEncoder.encode(rawPassword);
            User user = new User(name, email, encodedPassword);
            // Add the USER role
            user.getRoles().add(role);
            userRepository.save(user);
            System.out.println("Seeded Default Test User Account: " + email + " / " + rawPassword);
        }
    }

    // Helper method to seed a default ADMIN test account
    private void seedDefaultAdmin(String name, String email, String rawPassword, Role userRole, Role adminRole) {
        if (!userRepository.existsByEmail(email)) {
            String encodedPassword = passwordEncoder.encode(rawPassword);
            User admin = new User(name, email, encodedPassword);
            // Admins get both USER and ADMIN roles
            admin.getRoles().add(userRole);
            admin.getRoles().add(adminRole);
            userRepository.save(admin);
            System.out.println("Seeded Default Test Admin Account: " + email + " / " + rawPassword);
        }
    }
}
