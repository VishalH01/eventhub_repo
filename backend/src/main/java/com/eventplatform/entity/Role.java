package com.eventplatform.entity;

// Importing Jakarta Persistence API (JPA) annotations to map this class to a database table.
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;

// @Entity: Tells JPA/Hibernate that this Java class represents a database table.
// Hibernate will create a table for this class automatically.
@Entity
// @Table(name = "roles"): Explicitly specifies the name of the database table as "roles".
// If not specified, Hibernate would default to using the class name "Role".
@Table(name = "roles")
public class Role {

    // @Id: Designates this field as the Primary Key of our "roles" table.
    @Id
    // @GeneratedValue(strategy = GenerationType.IDENTITY): Configures the database to automatically
    // increment this primary key (AUTO_INCREMENT in MySQL) whenever a new role is inserted.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // @Column: Configures specific column settings in the database:
    // - name = "name" specifies the column name.
    // - unique = true ensures no two roles can share the exact same name (e.g., duplicate ROLE_USER).
    // - nullable = false ensures the role name cannot be left empty (NOT NULL constraint).
    @Column(name = "name", unique = true, nullable = false)
    private String name;

    // Default Constructor: Required by JPA/Hibernate to initialize entities via reflection.
    // Without this empty constructor, Hibernate will fail to map database rows into Java objects.
    public Role() {
    }

    // Parameterized Constructor: Helper constructor to easily create a Role with a specific name.
    public Role(String name) {
        this.name = name;
    }

    // Getters and Setters: Used for Encapsulation (hiding fields and allowing access only via public methods).
    
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
