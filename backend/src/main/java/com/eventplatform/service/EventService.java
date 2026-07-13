package com.eventplatform.service;

import com.eventplatform.entity.Event;
import java.util.List;

// Service Interface defining business methods for managing events.
public interface EventService {

    // Saves a new event created by the administrator.
    Event createEvent(Event event);

    // Updates properties of an existing event.
    Event updateEvent(Long id, Event event);

    // Deletes an event by its ID.
    void deleteEvent(Long id);

    // Retrieves details of a specific event.
    Event getEventById(Long id);

    // Retrieves all events matching the optional search, category, location, price, and date filters, sorted by choice.
    List<Event> getAllEvents(String search, String category, String location, Double minPrice, Double maxPrice, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate, String sortBy);
}
