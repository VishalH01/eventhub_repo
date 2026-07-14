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

        // 4. Wrap database purging and seeding in a check to seed up to 30 scenarios if not fully seeded
        if (eventRepository.count() < 30) {
            System.out.println("[DatabaseSeeder] Seeding/refreshing 30 test scenarios...");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            jdbcTemplate.execute("TRUNCATE TABLE ticket_attendees");
            jdbcTemplate.execute("TRUNCATE TABLE payments");
            jdbcTemplate.execute("TRUNCATE TABLE registrations");
            jdbcTemplate.execute("TRUNCATE TABLE event_reviews");
            jdbcTemplate.execute("TRUNCATE TABLE event_waitlists");
            jdbcTemplate.execute("TRUNCATE TABLE events");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

            // 5. Seed 30 distinct events matching different validation/cancellation scenarios
            System.out.println("[DatabaseSeeder] Seeding 30 brand new test events...");

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

            // Event 11: International Tech Expo 2026
            Event event11 = new Event();
            event11.setTitle("International Tech Expo 2026");
            event11.setDescription("A massive expo showing global tech developments, robotics, and hardware innovations.");
            event11.setLocation("Delhi Trade Center");
            event11.setDate(LocalDateTime.now().plusDays(28));
            event11.setPrice(1200.00);
            event11.setCategory("Tech");
            event11.setImageUrl("https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800");
            event11.setSeatingLayout("STANDARD");
            event11.setSeatingRows(8);
            event11.setSeatingCols(10);
            event11.setTotalCapacity(80);
            eventRepository.save(event11);

            // Event 12: VIP Classical Gala
            Event event12 = new Event();
            event12.setTitle("VIP Classical Gala");
            event12.setDescription("An exclusive evening of classical orchestra music. Row A and B are VIP seats with 1.5x pricing.");
            event12.setLocation("Opera House Mumbai");
            event12.setDate(LocalDateTime.now().plusDays(12));
            event12.setPrice(2500.00);
            event12.setCategory("Music");
            event12.setImageUrl("https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800");
            event12.setSeatingLayout("VIP_FRONT");
            event12.setSeatingRows(4);
            event12.setSeatingCols(6);
            event12.setTotalCapacity(24);
            eventRepository.save(event12);

            // Event 13: Indie Rock Fest
            Event event13 = new Event();
            event13.setTitle("Indie Rock Fest");
            event13.setDescription("Live performances from top independent rock bands. Features a center aisle layout.");
            event13.setLocation("Pune Festival Ground");
            event13.setDate(LocalDateTime.now().plusDays(18));
            event13.setPrice(600.00);
            event13.setCategory("Music");
            event13.setImageUrl("https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800");
            event13.setSeatingLayout("CENTER_AISLE");
            event13.setSeatingRows(6);
            event13.setSeatingCols(8);
            event13.setTotalCapacity(48);
            eventRepository.save(event13);

            // Event 14: Sports Championship Finale
            Event event14 = new Event();
            event14.setTitle("Sports Championship Finale");
            event14.setDescription("Watch the epic championship finale. Several front seats are pre-blocked.");
            event14.setLocation("Kolkata Stadium");
            event14.setDate(LocalDateTime.now().plusDays(35));
            event14.setPrice(1000.00);
            event14.setCategory("Sports");
            event14.setImageUrl("https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800");
            event14.setSeatingLayout("STANDARD");
            event14.setSeatingRows(10);
            event14.setSeatingCols(10);
            event14.setTotalCapacity(100);
            event14.setBlockedSeats("A-1, A-2, A-3, A-4, B-1, B-2");
            eventRepository.save(event14);

            // Event 15: AI Agents Workshop
            Event event15 = new Event();
            event15.setTitle("AI Agents Hands-on Workshop");
            event15.setDescription("A focused session on building autonomous coding agents. Small capacity of 5 seats to test waitlist features.");
            event15.setLocation("Bangalore Hub Room");
            event15.setDate(LocalDateTime.now().plusDays(9));
            event15.setPrice(300.00);
            event15.setCategory("Tech");
            event15.setImageUrl("https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=800");
            event15.setSeatingLayout("STANDARD");
            event15.setSeatingRows(1);
            event15.setSeatingCols(5);
            event15.setTotalCapacity(5);
            eventRepository.save(event15);

            // Event 16: Creative Arts Masterclass
            Event event16 = new Event();
            event16.setTitle("Creative Arts Masterclass");
            event16.setDescription("Master class on abstract canvas painting. Limited capacity (10 seats).");
            event16.setLocation("Goa Art Gallery");
            event16.setDate(LocalDateTime.now().plusDays(14));
            event16.setPrice(1500.00);
            event16.setCategory("Design");
            event16.setImageUrl("https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800");
            event16.setSeatingLayout("STANDARD");
            event16.setSeatingRows(2);
            event16.setSeatingCols(5);
            event16.setTotalCapacity(10);
            eventRepository.save(event16);

            // Event 17: Free Coding Bootcamp
            Event event17 = new Event();
            event17.setTitle("Free Full-Stack Coding Bootcamp");
            event17.setDescription("Learn the basics of HTML, CSS, React, and Spring Boot for free.");
            event17.setLocation("Online Virtual Link");
            event17.setDate(LocalDateTime.now().plusDays(16));
            event17.setPrice(0.00);
            event17.setCategory("Tech");
            event17.setImageUrl("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800");
            event17.setSeatingLayout("STANDARD");
            event17.setSeatingRows(5);
            event17.setSeatingCols(10);
            event17.setTotalCapacity(50);
            eventRepository.save(event17);

            // Event 18: Retro Jazz Evening
            Event event18 = new Event();
            event18.setTitle("Retro Jazz Evening");
            event18.setDescription("Immerse yourself in acoustic jazz melodies from the 1920s.");
            event18.setLocation("Mumbai Blue Bar");
            event18.setDate(LocalDateTime.now().plusDays(7));
            event18.setPrice(450.00);
            event18.setCategory("Music");
            event18.setImageUrl("https://images.unsplash.com/photo-1487180142328-054b783fc471?w=800");
            event18.setSeatingLayout("STANDARD");
            event18.setSeatingRows(4);
            event18.setSeatingCols(6);
            event18.setTotalCapacity(24);
            eventRepository.save(event18);

            // Event 19: Comedy Standup Special
            Event event19 = new Event();
            event19.setTitle("Comedy Standup Special");
            event19.setDescription("An evening of non-stop laughs with top stand-up comedians.");
            event19.setLocation("Pune Comedy Club");
            event19.setDate(LocalDateTime.now().plusDays(22));
            event19.setPrice(700.00);
            event19.setCategory("Design");
            event19.setImageUrl("https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=800");
            event19.setSeatingLayout("CENTER_AISLE");
            event19.setSeatingRows(5);
            event19.setSeatingCols(8);
            event19.setTotalCapacity(40);
            eventRepository.save(event19);

            // Event 20: Product Launch Keynote
            Event event20 = new Event();
            event20.setTitle("Product Launch Keynote");
            event20.setDescription("Be the first to see the release of new consumer electronics. Free registration.");
            event20.setLocation("Hyderabad HITEX City");
            event20.setDate(LocalDateTime.now().plusDays(30));
            event20.setPrice(0.00);
            event20.setCategory("Tech");
            event20.setImageUrl("https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800");
            event20.setSeatingLayout("VIP_FRONT");
            event20.setSeatingRows(6);
            event20.setSeatingCols(10);
            event20.setTotalCapacity(60);
            eventRepository.save(event20);

            // Event 21: Photography Walk
            Event event21 = new Event();
            event21.setTitle("Nature Photography Walk");
            event21.setDescription("Learn photography composition while exploring nature landscapes.");
            event21.setLocation("Sanjay Gandhi National Park");
            event21.setDate(LocalDateTime.now().plusDays(11));
            event21.setPrice(250.00);
            event21.setCategory("Design");
            event21.setImageUrl("https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800");
            event21.setSeatingLayout("STANDARD");
            event21.setSeatingRows(3);
            event21.setSeatingCols(8);
            event21.setTotalCapacity(24);
            eventRepository.save(event21);

            // Event 22: Virtual Reality Meetup
            Event event22 = new Event();
            event22.setTitle("Virtual Reality Developer Meetup");
            event22.setDescription("Try out the latest VR/AR headsets and discuss immersive software development.");
            event22.setLocation("Bangalore Innovation Center");
            event22.setDate(LocalDateTime.now().plusDays(24));
            event22.setPrice(400.00);
            event22.setCategory("Tech");
            event22.setImageUrl("https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800");
            event22.setSeatingLayout("CENTER_AISLE");
            event22.setSeatingRows(5);
            event22.setSeatingCols(10);
            event22.setTotalCapacity(50);
            eventRepository.save(event22);

            // Event 23: Food & Culinary Festival
            Event event23 = new Event();
            event23.setTitle("Food & Culinary Festival");
            event23.setDescription("Taste exotic recipes prepared by top chefs from across India.");
            event23.setLocation("Mumbai MMRDA Grounds");
            event23.setDate(LocalDateTime.now().plusDays(26));
            event23.setPrice(300.00);
            event23.setCategory("Design");
            event23.setImageUrl("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800");
            event23.setSeatingLayout("STANDARD");
            event23.setSeatingRows(8);
            event23.setSeatingCols(12);
            event23.setTotalCapacity(96);
            eventRepository.save(event23);

            // Event 24: Rock Climbing Workshop
            Event event24 = new Event();
            event24.setTitle("Rock Climbing Indoor Workshop");
            event24.setDescription("Learn safety and climbing techniques from certified instructors.");
            event24.setLocation("Pune Adventure Club");
            event24.setDate(LocalDateTime.now().plusDays(13));
            event24.setPrice(1800.00);
            event24.setCategory("Sports");
            event24.setImageUrl("https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800");
            event24.setSeatingLayout("STANDARD");
            event24.setSeatingRows(2);
            event24.setSeatingCols(6);
            event24.setTotalCapacity(12);
            eventRepository.save(event24);

            // Event 25: Yoga & Wellness Retreat
            Event event25 = new Event();
            event25.setTitle("Yoga & Meditation Retreat");
            event25.setDescription("A serene morning session focusing on breathing, relaxation, and mental wellness.");
            event25.setLocation("Lonavala Hill Center");
            event25.setDate(LocalDateTime.now().plusDays(6));
            event25.setPrice(550.00);
            event25.setCategory("Sports");
            event25.setImageUrl("https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800");
            event25.setSeatingLayout("STANDARD");
            event25.setSeatingRows(4);
            event25.setSeatingCols(8);
            event25.setTotalCapacity(32);
            eventRepository.save(event25);

            // Event 26: Startup Pitch Night
            Event event26 = new Event();
            event26.setTitle("Startup Pitch Night 2026");
            event26.setDescription("Watch 10 promising startups pitch to venture capitalists and angel investors.");
            event26.setLocation("Mumbai Coworking Space");
            event26.setDate(LocalDateTime.now().plusDays(17));
            event26.setPrice(200.00);
            event26.setCategory("Tech");
            event26.setImageUrl("https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800");
            event26.setSeatingLayout("STANDARD");
            event26.setSeatingRows(5);
            event26.setSeatingCols(8);
            event26.setTotalCapacity(40);
            eventRepository.save(event26);

            // Event 27: Symphony in the Park
            Event event27 = new Event();
            event27.setTitle("Symphony in the Park");
            event27.setDescription("Enjoy classical orchestral symphonies under the open sky. Free admission.");
            event27.setLocation("Delhi Central Park");
            event27.setDate(LocalDateTime.now().plusDays(21));
            event27.setPrice(0.00);
            event27.setCategory("Music");
            event27.setImageUrl("https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800");
            event27.setSeatingLayout("CENTER_AISLE");
            event27.setSeatingRows(6);
            event27.setSeatingCols(10);
            event27.setTotalCapacity(60);
            eventRepository.save(event27);

            // Event 28: UI/UX Design Hackathon
            Event event28 = new Event();
            event28.setTitle("UI/UX Design Hackathon");
            event28.setDescription("A 24-hour design marathon creating next-generation digital interface prototypes.");
            event28.setLocation("Bangalore Design Lab");
            event28.setDate(LocalDateTime.now().plusDays(19));
            event28.setPrice(650.00);
            event28.setCategory("Design");
            event28.setImageUrl("https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800");
            event28.setSeatingLayout("STANDARD");
            event28.setSeatingRows(3);
            event28.setSeatingCols(10);
            event28.setTotalCapacity(30);
            eventRepository.save(event28);

            // Event 29: Annual Marathon Run
            Event event29 = new Event();
            event29.setTitle("Annual City Marathon 2026");
            event29.setDescription("Join thousands of runners in the annual city-wide marathon event.");
            event29.setLocation("Pune Stadium Outer Ring");
            event29.setDate(LocalDateTime.now().plusDays(31));
            event29.setPrice(150.00);
            event29.setCategory("Sports");
            event29.setImageUrl("https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800");
            event29.setSeatingLayout("STANDARD");
            event29.setSeatingRows(10);
            event29.setSeatingCols(15);
            event29.setTotalCapacity(150);
            eventRepository.save(event29);

            // Event 30: Cyber Security Workshop
            Event event30 = new Event();
            event30.setTitle("Practical Cyber Security Workshop");
            event30.setDescription("Learn the fundamentals of penetration testing, ethical hacking, and server hardening.");
            event30.setLocation("Chennai Tech Labs");
            event30.setDate(LocalDateTime.now().plusDays(23));
            event30.setPrice(950.00);
            event30.setCategory("Tech");
            event30.setImageUrl("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800");
            event30.setSeatingLayout("STANDARD");
            event30.setSeatingRows(5);
            event30.setSeatingCols(8);
            event30.setTotalCapacity(40);
            eventRepository.save(event30);

            System.out.println("[DatabaseSeeder] Successfully finished seeding 30 test events!");
        } else {
            System.out.println("[DatabaseSeeder] Database already populated. Skipping purge and seed to preserve production records.");
        }
    }
}
