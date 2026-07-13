package com.eventplatform.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

// @Entity: Maps this Java class to the "registrations" database table.
@Entity
@Table(name = "registrations")
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // A unique number generated for the registration (e.g., REG-993218). Cannot be empty and must be unique.
    @Column(name = "registration_number", unique = true, nullable = false)
    private String registrationNumber;

    // The timestamp when the registration was requested.
    @Column(name = "registration_date", nullable = false)
    private LocalDateTime registrationDate;

    // The status of the registration:
    // - PENDING: Registered but payment is not yet completed.
    // - CONFIRMED: Payment succeeded; ticket is valid.
    // - FAILED: Payment failed.
    @Column(name = "status", nullable = false)
    private String status;

    // @ManyToOne: Establishes a Many-to-One relationship with User.
    // - Many registrations can belong to one single User (e.g. Vishal can register for 3 events).
    // - @JoinColumn(name = "user_id", nullable = false): Creates a foreign key column named 'user_id'
    //   in the registrations table that links to the primary key of the users table.
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // @ManyToOne: Establishes a Many-to-One relationship with Event.
    // - Many registrations can map to one single Event (e.g. 50 people register for 'National Tech Summit').
    // - @JoinColumn(name = "event_id", nullable = false): Creates a foreign key column named 'event_id'
    //   in the registrations table linking to the primary key of the events table.
    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    // @OneToOne(mappedBy = "registration"): Configures a One-to-One bi-directional relationship with Payment.
    // - Each event registration has exactly one corresponding payment record.
    // - 'mappedBy = "registration"' tells Hibernate that the foreign key mapping is defined in the Payment class,
    //   not in this class (Registration is the inverse side of the relationship).
    @OneToOne(mappedBy = "registration")
    private Payment payment;

    @Column(name = "seats")
    private String seats;

    @Column(name = "coupon_code")
    private String couponCode;

    @Column(name = "discount_amount")
    private Double discountAmount = 0.0;

    @Column(name = "final_price")
    private Double finalPrice;

    @OneToMany(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TicketAttendee> attendees = new ArrayList<>();

    // Default Constructor: Required by JPA/Hibernate.
    public Registration() {
    }

    // Parameterized Constructor: Helper for creating registrations.
    public Registration(String registrationNumber, LocalDateTime registrationDate, String status, User user, Event event) {
        this.registrationNumber = registrationNumber;
        this.registrationDate = registrationDate;
        this.status = status;
        this.user = user;
        this.event = event;
    }

    // Getters and Setters:
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    // @Transient: Tells Hibernate/JPA that this field does NOT correspond to a column in our MySQL 'registrations' table.
    // Keeping this field transient is a database design best practice because storing large Base64 image strings in
    // MySQL rows is highly inefficient. Instead, we generate the QR code dynamically in Java and serialize it to JSON.
    @Transient
    private String qrCodeBase64;

    public String getQrCodeBase64() {
        return qrCodeBase64;
    }

    public void setQrCodeBase64(String qrCodeBase64) {
        this.qrCodeBase64 = qrCodeBase64;
    }

    public String getSeats() {
        return seats;
    }

    public void setSeats(String seats) {
        this.seats = seats;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(Double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public Double getFinalPrice() {
        return finalPrice;
    }

    public void setFinalPrice(Double finalPrice) {
        this.finalPrice = finalPrice;
    }

    public List<TicketAttendee> getAttendees() {
        return attendees;
    }

    public void setAttendees(List<TicketAttendee> attendees) {
        this.attendees = attendees;
    }
}
