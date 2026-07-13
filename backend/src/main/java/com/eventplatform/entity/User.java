package com.eventplatform.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import java.util.HashSet;
import java.util.Set;

// @Entity: Maps this Java class to a database table called "users".
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Full name of the user. Cannot be empty.
    @Column(name = "name", nullable = false)
    private String name;

    // Email address used as the unique login username. Cannot be empty and must be unique.
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    // BCrypt-hashed password. Cannot be empty.
    @Column(name = "password", nullable = false)
    private String password;

    // @ManyToMany: Establishes a Many-to-Many relationship between Users and Roles.
    // - Many users can share the same role (e.g., thousands of accounts have ROLE_USER).
    // - A single user can hold multiple roles (e.g., both ROLE_USER and ROLE_ADMIN).
    // - fetch = FetchType.EAGER: Tells Hibernate to immediately load the user's roles when fetching the user.
    //   This is crucial for Spring Security authorization checks on login.
    @ManyToMany(fetch = FetchType.EAGER)
    // @JoinTable: Defines a separate mapping/junction table 'user_roles' in MySQL.
    // - name = "user_roles" is the name of this junction table.
    // - joinColumns: Defines the foreign key column 'user_id' referencing this User table.
    // - inverseJoinColumns: Defines the foreign key column 'role_id' referencing the Role table.
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    // Default Constructor: Required by JPA/Hibernate.
    public User() {
    }

    // Parameterized Constructor: Convenient helper for user registration.
    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters:
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    @com.fasterxml.jackson.annotation.JsonIgnore
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }
}
