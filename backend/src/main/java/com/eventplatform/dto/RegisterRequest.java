package com.eventplatform.dto;

// DTO (Data Transfer Object): A simple POJO (Plain Old Java Object) used to carry data between the client (frontend) and the server.
// Using DTOs is a best practice because it separates the API request body format from the actual database entities.
public class RegisterRequest {

    // The name entered by the user in the registration form.
    private String name;

    // The email address entered by the user in the registration form.
    private String email;

    // The raw password entered by the user in the registration form.
    private String password;

    // Default Constructor: Required for JSON deserialization (mapping JSON string into Java object).
    public RegisterRequest() {
    }

    // Parameterized Constructor: Helper for unit tests or manual instantiation.
    public RegisterRequest(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters:
    
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
