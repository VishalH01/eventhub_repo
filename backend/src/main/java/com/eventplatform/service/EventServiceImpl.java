package com.eventplatform.service;

import com.eventplatform.entity.Event;
import com.eventplatform.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

// @Service: Declares this class as a Service Bean containing event-management business logic.
@Service
public class EventServiceImpl implements EventService {

    @Autowired
    private EventRepository eventRepository;

    @Override
    public Event createEvent(Event event) {
        // Validation: Verify price is not negative
        if (event.getPrice() < 0) {
            throw new RuntimeException("Event price cannot be negative!");
        }
        return eventRepository.save(event);
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
    public List<Event> getAllEvents(String search, String category) {
        // Normalize search term and category to handle null query parameters from HTTP requests:
        // - If search query param is omitted, default to an empty string (retrieves everything).
        // - If category query param is omitted, default to "All" (ignores category filter).
        String normalizedSearch = (search != null) ? search.trim() : "";
        String normalizedCategory = (category != null) ? category.trim() : "All";

        // Query repository layer
        return eventRepository.searchAndFilterEvents(normalizedSearch, normalizedCategory);
    }
}
