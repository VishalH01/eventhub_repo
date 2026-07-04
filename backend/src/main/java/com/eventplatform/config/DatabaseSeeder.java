package com.eventplatform.config;

import com.eventplatform.entity.Event;
import com.eventplatform.entity.Role;
import com.eventplatform.entity.User;
import com.eventplatform.repository.EventRepository;
import com.eventplatform.repository.RoleRepository;
import com.eventplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
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

        // 4. Seed some sample premium events if database is empty
        if (eventRepository.count() == 0) {
            Event techConf = new Event();
            techConf.setTitle("Vite & Spring Boot Developer Conference");
            techConf.setDescription("Learn the latest fullstack web development techniques using Vite, React, Tailwind v4, and Spring Boot security configurations.");
            techConf.setLocation("Mumbai Tech Convention Hall");
            techConf.setDate(LocalDateTime.now().plusDays(10));
            techConf.setPrice(999.00);
            techConf.setCategory("Tech");
            techConf.setImageUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800");
            techConf.setSeatingLayout("VIP_FRONT");
            techConf.setSeatingRows(5);
            techConf.setSeatingCols(8);
            techConf.setTotalCapacity(40);
            eventRepository.save(techConf);

            Event musicFest = new Event();
            musicFest.setTitle("Ambient Sun Beats Live");
            musicFest.setDescription("A premier open-air electronic live music concert featuring international indie pop and house music artists.");
            musicFest.setLocation("Pune Arena Ground");
            musicFest.setDate(LocalDateTime.now().plusDays(15));
            musicFest.setPrice(499.00);
            musicFest.setCategory("Music");
            musicFest.setImageUrl("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800");
            musicFest.setSeatingLayout("CENTER_AISLE");
            musicFest.setSeatingRows(6);
            musicFest.setSeatingCols(10);
            musicFest.setTotalCapacity(60);
            eventRepository.save(musicFest);
        }

        // 5. Seed a new event with a different seat layout for dynamic hero ticket verification
        if (!eventRepository.existsByTitle("Global Tech Summit 2026")) {
            Event globalTech = new Event();
            globalTech.setTitle("Global Tech Summit 2026");
            globalTech.setDescription("Explore next-generation web technologies, edge compilation, and dynamic cloud state management systems.");
            globalTech.setLocation("Seattle Convention Center, WA");
            globalTech.setDate(LocalDateTime.now().plusDays(30));
            globalTech.setPrice(1200.00);
            globalTech.setCategory("Tech");
            globalTech.setImageUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800");
            globalTech.setSeatingLayout("CENTER_AISLE");
            globalTech.setSeatingRows(8);
            globalTech.setSeatingCols(12);
            globalTech.setTotalCapacity(96);
            eventRepository.save(globalTech);
            System.out.println("[DatabaseSeeder] Successfully seeded dynamic test event 'Global Tech Summit 2026'!");
        }
    }
}
