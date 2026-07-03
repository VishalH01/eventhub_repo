package com.eventplatform.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import java.time.LocalDateTime;

// @Entity: Tells JPA/Hibernate that this Java class maps to a database table.
@Entity
// @Table: Specifies the database table name as "events".
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The name/title of the event. Cannot be empty.
    @Column(name = "title", nullable = false)
    private String title;

    // The detailed description of the event.
    // - columnDefinition = "TEXT": Tells MySQL to use the TEXT data type instead of a standard VARCHAR(255).
    //   This allows the event description to store thousands of characters.
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // The date and time when the event takes place.
    // - LocalDateTime: Standard Java 8+ class for representing date and time (without timezone offset).
    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    // Venue or geographic location of the event. Cannot be empty.
    @Column(name = "location", nullable = false)
    private String location;

    // Ticket price for attending the event. Cannot be empty.
    @Column(name = "price", nullable = false)
    private Double price;

    // Event category (e.g. Technology, Design, Music). Cannot be empty.
    @Column(name = "category", nullable = false)
    private String category;

    // Image URL for the event banner display.
    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "seating_layout")
    private String seatingLayout = "STANDARD";

    @Column(name = "seating_rows")
    private Integer seatingRows = 6;

    @Column(name = "seating_cols")
    private Integer seatingCols = 10;

    @Column(name = "total_capacity")
    private Integer totalCapacity = 60;

    // Default Constructor: Required by JPA/Hibernate.
    public Event() {
    }

    // Parameterized Constructor: Helper for creating events quickly.
    public Event(String title, String description, LocalDateTime date, String location, Double price, String category, String imageUrl) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.location = location;
        this.price = price;
        this.category = category;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters:
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getSeatingLayout() {
        return seatingLayout;
    }

    public void setSeatingLayout(String seatingLayout) {
        this.seatingLayout = seatingLayout;
    }

    public Integer getSeatingRows() {
        return seatingRows;
    }

    public void setSeatingRows(Integer seatingRows) {
        this.seatingRows = seatingRows;
    }

    public Integer getSeatingCols() {
        return seatingCols;
    }

    public void setSeatingCols(Integer seatingCols) {
        this.seatingCols = seatingCols;
    }

    public Integer getTotalCapacity() {
        return totalCapacity;
    }

    public void setTotalCapacity(Integer totalCapacity) {
        this.totalCapacity = totalCapacity;
    }
}
