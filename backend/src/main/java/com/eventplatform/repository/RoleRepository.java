package com.eventplatform.repository;

import com.eventplatform.entity.Role;
// Importing JpaRepository which provides standard CRUD (Create, Read, Update, Delete) methods.
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// @Repository: Marks this interface as a Spring Data repository bean.
// Spring Boot will automatically implement this interface for us at runtime.
// JpaRepository<Role, Integer> takes two type arguments:
// 1. Role: The entity class this repository manages.
// 2. Integer: The type of the Role entity's primary key (id).
@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

    // Custom Query Method: Finds a Role by its unique name (e.g., "ROLE_USER" or "ROLE_ADMIN").
    // - Spring Data JPA parses the method name 'findByName' and automatically generates the corresponding
    //   SQL query: SELECT * FROM roles WHERE name = ?;
    // - Optional<Role>: A container object that may or may not contain a Role. Prevents NullPointerExceptions.
    Optional<Role> findByName(String name);
}
