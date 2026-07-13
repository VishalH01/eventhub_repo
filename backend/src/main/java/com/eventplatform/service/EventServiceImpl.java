package com.eventplatform.service;

import com.eventplatform.entity.Event;
import com.eventplatform.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

import com.eventplatform.repository.UserRepository;
import com.eventplatform.entity.Notification;
import com.eventplatform.repository.NotificationRepository;
import java.util.stream.Collectors;

// @Service: Declares this class as a Service Bean containing event-management business logic.
@Service
public class EventServiceImpl implements EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public Event createEvent(Event event) {
        // Validation: Verify price is not negative
        if (event.getPrice() < 0) {
            throw new RuntimeException("Event price cannot be negative!");
        }
        Event savedEvent = eventRepository.save(event);
        
        // Trigger email notification blast to all users
        try {
            List<String> userEmails = userRepository.findAll().stream()
                    .map(u -> u.getEmail())
                    .collect(Collectors.toList());
            emailService.sendEventCreationEmail(savedEvent, userEmails);
        } catch (Exception e) {
            System.err.println("Failed to execute new event email blast: " + e.getMessage());
        }

        // Trigger in-app notification to all users
        try {
            List<com.eventplatform.entity.User> allUsers = userRepository.findAll();
            for (com.eventplatform.entity.User u : allUsers) {
                Notification notif = new Notification(u, "New Event Added: '" + savedEvent.getTitle() + "' under category " + savedEvent.getCategory() + "! Book your tickets now!");
                notificationRepository.save(notif);
            }
        } catch (Exception e) {
            System.err.println("Failed to save new event in-app notifications: " + e.getMessage());
        }
        
        return savedEvent;
    }

    @Override
    public Event updateEvent(Long id, Event event) {
        // Step A: Locate the existing event in the database. Throw exception if it doesn't exist.
        Event existingEvent = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));

        // Validation: Verify price is not negative
        if (event.getPrice() < 0) {
            throw new RuntimeException("Event price cannot be negative!");
        }

        // Step B: Update the fields of the existing event with the new values
        existingEvent.setTitle(event.getTitle());
        existingEvent.setDescription(event.getDescription());
        existingEvent.setDate(event.getDate());
        existingEvent.setLocation(event.getLocation());
        existingEvent.setPrice(event.getPrice());
        existingEvent.setCategory(event.getCategory());
        existingEvent.setImageUrl(event.getImageUrl());
        existingEvent.setSeatingLayout(event.getSeatingLayout());
        existingEvent.setSeatingRows(event.getSeatingRows());
        existingEvent.setSeatingCols(event.getSeatingCols());
        existingEvent.setTotalCapacity(event.getTotalCapacity());
        existingEvent.setBlockedSeats(event.getBlockedSeats());

        // Step C: Save the updated event entity back to the database
        return eventRepository.save(existingEvent);
    }

    @Override
    public void deleteEvent(Long id) {
        // Step A: Verify the event exists before attempting deletion.
        Event existingEvent = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
        
        // Step B: Perform database deletion.
        eventRepository.delete(existingEvent);
    }

    @Override
    public Event getEventById(Long id) {
        // Fetch event details by ID, or throw exception.
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
    }

    @Override
    public List<Event> getAllEvents(String search, String category, String location, Double minPrice, Double maxPrice, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate, String sortBy) {
        // Normalize search term, category, and location to handle null query parameters:
        String normalizedSearch = (search != null) ? search.trim() : "";
        String normalizedCategory = (category != null) ? category.trim() : "All";
        String normalizedLocation = (location != null) ? location.trim() : "";

        // Determine sorting direction & property
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Order.asc("date"));
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            switch (sortBy.trim()) {
                case "priceAsc":
                    sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Order.asc("price"));
                    break;
                case "priceDesc":
                    sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Order.desc("price"));
                    break;
                case "title":
                    sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Order.asc("title"));
                    break;
                case "dateDesc":
                    sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Order.desc("date"));
                    break;
                case "date":
                case "dateAsc":
                default:
                    sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Order.asc("date"));
                    break;
            }
        }

        // Query repository layer with all advanced filter fields and sort order
        return eventRepository.searchAndFilterEvents(
                normalizedSearch, 
                normalizedCategory, 
                normalizedLocation, 
                minPrice, 
                maxPrice, 
                startDate, 
                endDate,
                sort
        );
    }
}
