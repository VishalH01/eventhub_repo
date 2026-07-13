package com.eventplatform.config;

import com.eventplatform.entity.*;
import com.eventplatform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Default Security Roles if missing
        Role userRole = roleRepository.findByName("ROLE_USER").orElseGet(() -> {
            Role r = new Role();
            r.setName("ROLE_USER");
            return roleRepository.save(r);
        });

        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> {
            Role r = new Role();
            r.setName("ROLE_ADMIN");
            return roleRepository.save(r);
        });

        // 2. Seed Default Admin if not present
        if (!userRepository.existsByEmail("admin@eventhub.com")) {
            User admin = new User();
            admin.setName("Admin Manager");
            admin.setEmail("admin@eventhub.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
            userRepository.save(admin);
        }

        // 3. Seed Default User if not present
        if (!userRepository.existsByEmail("user@eventhub.com")) {
            User user = new User();
            user.setName("Demo User");
            user.setEmail("user@eventhub.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRoles(new HashSet<>(Collections.singletonList(userRole)));
            userRepository.save(user);
        }

        // 4. Wrap database purging and seeding in an empty check to preserve production data across restarts
        if (eventRepository.count() == 0) {
            System.out.println("[DatabaseSeeder] Database is empty. Purging and seeding brand new test events...");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            jdbcTemplate.execute("TRUNCATE TABLE ticket_attendees");
            jdbcTemplate.execute("TRUNCATE TABLE payments");
            jdbcTemplate.execute("TRUNCATE TABLE registrations");
            jdbcTemplate.execute("TRUNCATE TABLE event_reviews");
            jdbcTemplate.execute("TRUNCATE TABLE event_waitlists");
            jdbcTemplate.execute("TRUNCATE TABLE events");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

            // 5. Seed 10 distinct events matching different validation/cancellation scenarios
            System.out.println("[DatabaseSeeder] Seeding 10 brand new test events...");

            // Event 1: VIP layout with front row multipliers
            Event event1 = new Event();
            event1.setTitle("VIP Frontline Conference");
            event1.setDescription("Learn Spring Security features. VIP Front layout applies a 1.5x price multiplier to rows A and B.");
            event1.setLocation("Delhi Convention Center");
            event1.setDate(LocalDateTime.now().plusDays(10));
            event1.setPrice(1000.00);
            event1.setCategory("Tech");
            event1.setImageUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800");
            event1.setSeatingLayout("VIP_FRONT");
            event1.setSeatingRows(5);
            event1.setSeatingCols(8);
            event1.setTotalCapacity(40);
            eventRepository.save(event1);

            // Event 2: Center Walkway Aisle layout
            Event event2 = new Event();
            event2.setTitle("Electronic Beats Festival");
            event2.setDescription("A premier electronic music concert featuring international indie pop and house music artists. Uses center aisle layout.");
            event2.setLocation("Pune Ground Hall");
            event2.setDate(LocalDateTime.now().plusDays(15));
            event2.setPrice(500.00);
            event2.setCategory("Music");
            event2.setImageUrl("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800");
            event2.setSeatingLayout("CENTER_AISLE");
            event2.setSeatingRows(6);
            event2.setSeatingCols(10);
            event2.setTotalCapacity(60);
            eventRepository.save(event2);

            // Event 3: Sold out capacity event to test waitlist queueing
            Event event3 = new Event();
            event3.setTitle("Sold Out Workshop");
            event3.setDescription("A small masterclass with minimal capacity (only 4 seats total) to test immediate sold-out state and waitlist promotion.");
            event3.setLocation("Mumbai Design Studio");
            event3.setDate(LocalDateTime.now().plusDays(8));
            event3.setPrice(200.00);
            event3.setCategory("Design");
            event3.setImageUrl("https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800");
            event3.setSeatingLayout("STANDARD");
            event3.setSeatingRows(2);
            event3.setSeatingCols(2);
            event3.setTotalCapacity(4);
            eventRepository.save(event3);

            // Event 4: Event with pre-blocked admin seats
            Event event4 = new Event();
            event4.setTitle("Admin Blocked Arena");
            event4.setDescription("An event seeded with pre-blocked seats (A-1, A-2, B-5) to verify they appear disabled for normal registrations.");
            event4.setLocation("Bangalore Exhibition Hall");
            event4.setDate(LocalDateTime.now().plusDays(20));
            event4.setPrice(1500.00);
            event4.setCategory("Tech");
            event4.setImageUrl("https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800");
            event4.setSeatingLayout("STANDARD");
            event4.setSeatingRows(6);
            event4.setSeatingCols(10);
            event4.setTotalCapacity(60);
            event4.setBlockedSeats("A-1, A-2, B-5, C-10");
            eventRepository.save(event4);

            // Event 5: Event starting soon (tests 0% refund cancellation window)
            Event event5 = new Event();
            event5.setTitle("No-Refund Speed Hackathon");
            event5.setDescription("This event starts in 12 hours. Cancellations within 24 hours of the start time are non-refundable (0% refund).");
            event5.setLocation("Chennai Innovation Lab");
            event5.setDate(LocalDateTime.now().plusHours(12));
            event5.setPrice(800.00);
            event5.setCategory("Tech");
            event5.setImageUrl("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800");
            event5.setSeatingLayout("STANDARD");
            event5.setSeatingRows(4);
            event5.setSeatingCols(6);
            event5.setTotalCapacity(24);
            eventRepository.save(event5);

            // Event 6: Event in intermediate refund range (tests 50% refund window)
            Event event6 = new Event();
            event6.setTitle("Half-Refund Design Bootcamp");
            event6.setDescription("This event starts in 36 hours. Cancellations between 24 and 48 hours receive a 50% refund.");
            event6.setLocation("Goa Creative Center");
            event6.setDate(LocalDateTime.now().plusHours(36));
            event6.setPrice(1200.00);
            event6.setCategory("Design");
            event6.setImageUrl("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800");
            event6.setSeatingLayout("STANDARD");
            event6.setSeatingRows(5);
            event6.setSeatingCols(6);
            event6.setTotalCapacity(30);
            eventRepository.save(event6);

            // Event 7: Free price event
            Event event7 = new Event();
            event7.setTitle("Free Open Air Concert");
            event7.setDescription("A completely free entry music event to test registrations and pass dispatch with 0.00 pricing.");
            event7.setLocation("Kolkata Science City");
            event7.setDate(LocalDateTime.now().plusDays(25));
            event7.setPrice(0.00);
            event7.setCategory("Music");
            event7.setImageUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800");
            event7.setSeatingLayout("CENTER_AISLE");
            event7.setSeatingRows(10);
            event7.setSeatingCols(12);
            event7.setTotalCapacity(120);
            eventRepository.save(event7);

            // Event 8: High price event to test coupon calculations
            Event event8 = new Event();
            event8.setTitle("Mega Tech Expo 2026");
            event8.setDescription("A premium expo with high-value tickets (INR 5000.00) ideal for testing percentage and flat rate promotional coupon discounts.");
            event8.setLocation("Hyderabad HITEX Hall");
            event8.setDate(LocalDateTime.now().plusDays(40));
            event8.setPrice(5000.00);
            event8.setCategory("Tech");
            event8.setImageUrl("https://images.unsplash.com/photo-1582192732961-23b15ef1a8d5?w=800");
            event8.setSeatingLayout("STANDARD");
            event8.setSeatingRows(8);
            event8.setSeatingCols(10);
            event8.setTotalCapacity(80);
            eventRepository.save(event8);

            // Event 9: Past event to test verified reviews submission
            Event event9 = new Event();
            event9.setTitle("Retrospective Tech History Class");
            event9.setDescription("An event that occurred 2 days ago. Since it has concluded, verified buyers can post star reviews.");
            event9.setLocation("Virtual Online Hall");
            event9.setDate(LocalDateTime.now().minusDays(2));
            event9.setPrice(150.00);
            event9.setCategory("Tech");
            event9.setImageUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800");
            event9.setSeatingLayout("STANDARD");
            event9.setSeatingRows(3);
            event9.setSeatingCols(5);
            event9.setTotalCapacity(15);
            eventRepository.save(event9);

            // Event 10: Standard concert event
            Event event10 = new Event();
            event10.setTitle("Jazz & Blues Night");
            event10.setDescription("A relaxed evening event of live acoustic jazz and classical blues performances.");
            event10.setLocation("Ahmednagar Cafe Club");
            event10.setDate(LocalDateTime.now().plusDays(5));
            event10.setPrice(350.00);
            event10.setCategory("Music");
            event10.setImageUrl("https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800");
            event10.setSeatingLayout("STANDARD");
            event10.setSeatingRows(4);
            event10.setSeatingCols(8);
            event10.setTotalCapacity(32);
            eventRepository.save(event10);

            System.out.println("[DatabaseSeeder] Successfully finished seeding 10 test events!");
        } else {
            System.out.println("[DatabaseSeeder] Database already populated. Skipping purge and seed to preserve production records.");
        }
    }
}
