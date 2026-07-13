package com.eventplatform.controller;

import com.eventplatform.entity.Event;
import com.eventplatform.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.format.annotation.DateTimeFormat;

// @RestController: Marks this class as a REST Controller providing JSON-serializable responses.
// @RequestMapping("/api/events"): Sets the base path prefix to "/api/events" for all routes here.
@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    // 1. Get All Events (Browse, Search, Filter)
    // - Route: GET http://localhost:8080/api/events
    // - Query Params:
    //   - 'search': keywords matching event titles or descriptions (optional)
    //   - 'category': event category name (optional)
    //   - 'location': event location matching (optional)
    //   - 'minPrice' / 'maxPrice': price range (optional)
    //   - 'startDate' / 'endDate': ISO datetime limits (optional)
    // - Access: Public (configured in SecurityConfig.java)
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "minPrice", required = false) Double minPrice,
            @RequestParam(value = "maxPrice", required = false) Double maxPrice,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(value = "sortBy", required = false) String sortBy) {
        
        List<Event> events = eventService.getAllEvents(search, category, location, minPrice, maxPrice, startDate, endDate, sortBy);
        return ResponseEntity.ok(events);
    }

    // 2. Get Event Details
    // - Route: GET http://localhost:8080/api/events/{id}
    // - Access: Public
    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable("id") Long id) {
        try {
            Event event = eventService.getEventById(id);
            return ResponseEntity.ok(event);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // 3. Create Event
    // - Route: POST http://localhost:8080/api/events
    // - Access: Secured (ROLE_ADMIN only)
    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        try {
            Event createdEvent = eventService.createEvent(event);
            return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. Update Event
    // - Route: PUT http://localhost:8080/api/events/{id}
    // - Access: Secured (ROLE_ADMIN only)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable("id") Long id, @RequestBody Event event) {
        try {
            Event updatedEvent = eventService.updateEvent(id, event);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 5. Delete Event
    // - Route: DELETE http://localhost:8080/api/events/{id}
    // - Access: Secured (ROLE_ADMIN only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable("id") Long id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.ok("Event deleted successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
