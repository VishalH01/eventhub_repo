package com.eventplatform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// DTO (Data Transfer Object): A simple POJO (Plain Old Java Object) used to carry data between the client (frontend) and the server.
// Using DTOs is a best practice because it separates the API request body format from the actual database entities.
public class RegisterRequest {

    // The name entered by the user in the registration form.
    @NotBlank(message = "Full name is required.")
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "Full name must contain only alphabets and spaces.")
    private String name;

    // The email address entered by the user in the registration form.
    @NotBlank(message = "Email is required.")
    @Email(message = "Invalid email format.")
    @Pattern(
        regexp = "^[a-zA-Z0-9._%+-]+@(gmail\\.com|outlook\\.com|yahoo\\.com|hotmail\\.com|icloud\\.com|aol\\.com|zoho\\.com)$",
        message = "Email must belong to a trusted domain (gmail.com, outlook.com, yahoo.com, hotmail.com, icloud.com, aol.com, zoho.com)."
    )
    private String email;

    // The raw password entered by the user in the registration form.
    @NotBlank(message = "Password is required.")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
        message = "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    )
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
