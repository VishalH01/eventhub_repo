package com.eventplatform.config;

import com.eventplatform.entity.Role;
import com.eventplatform.entity.User;
import com.eventplatform.entity.Event;
import com.eventplatform.repository.RoleRepository;
import com.eventplatform.repository.UserRepository;
import com.eventplatform.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
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
    private EventRepository eventRepository;

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

        // 3. Seed default Event listings
        seedDefaultEvents();
    }

    // Helper method to seed 5 premium default events
    private void seedDefaultEvents() {
        seedEventIfMissing(
            "Java & Spring Boot Advanced Workshop 2026",
            "Join us for an intensive hands-on session exploring Spring Boot 3.x, Spring Data JPA optimization, JWT stateless authentication filters, and production Docker container packaging.",
            LocalDateTime.of(2026, 9, 10, 9, 0),
            "Bangalore, India",
            799.00,
            "Technology",
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60"
        );

        seedEventIfMissing(
            "Creative UI/UX Design & Typography Masterclass",
            "Learn the art of crafting premium user interfaces, HSL-tailored dark modes, fluid transitions, and glassmorphism. Perfect for frontend engineers working with React and Tailwind CSS.",
            LocalDateTime.of(2026, 10, 15, 14, 30),
            "Pune, India",
            499.00,
            "Design",
            "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=60"
        );

        seedEventIfMissing(
            "Symphony & Beats: Classical Fusion Night",
            "An evening of breathtaking acoustic melodies, fusion beats, and orchestration performances by renowned classical and modern artists. Tickets include complimentary drinks.",
            LocalDateTime.of(2026, 11, 20, 18, 0),
            "Mumbai, India",
            1299.00,
            "Music",
            "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=60"
        );

        seedEventIfMissing(
            "Cloud-Native Kubernetes & DevOps Bootcamp",
            "Master container orchestration, Helm charts, CI/CD pipeline building, monitoring with Prometheus/Grafana, and secure production deployments on Google Cloud Platform.",
            LocalDateTime.of(2026, 12, 5, 10, 0),
            "Hyderabad, India",
            999.00,
            "Technology",
            "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=600&auto=format&fit=crop&q=60"
        );

        seedEventIfMissing(
            "Product Design Summit 2026",
            "A conference gathering lead designers and researchers from top tech companies to share insights on design systems, human-centered research, and product design strategy.",
            LocalDateTime.of(2026, 12, 18, 11, 0),
            "Delhi, India",
            599.00,
            "Design",
            "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60"
        );
    }

    // Helper method to insert event if it is not already created
    private void seedEventIfMissing(String title, String description, LocalDateTime date, String location, Double price, String category, String imageUrl) {
        if (!eventRepository.existsByTitle(title)) {
            Event event = new Event(title, description, date, location, price, category, imageUrl);
            eventRepository.save(event);
            System.out.println("Seeded Default Event: " + title);
        }
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
