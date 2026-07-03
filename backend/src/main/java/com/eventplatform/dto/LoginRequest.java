package com.eventplatform.dto;

// DTO representing the login payload sent by the client.
public class LoginRequest {

    // The email address of the user attempting to log in.
    private String email;

    // The password of the user attempting to log in.
    private String password;

    // Default Constructor: Required for JSON mapping.
    public LoginRequest() {
    }

    // Parameterized Constructor:
    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getters and Setters:
    
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
