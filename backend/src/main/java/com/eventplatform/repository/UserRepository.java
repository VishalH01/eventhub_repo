package com.eventplatform.repository;

import com.eventplatform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// @Repository: Marks this interface as a database access repository managed by Spring.
// JpaRepository<User, Long> manages the User entity, and the primary key id is of type Long.
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Custom Query Method: Finds a User by their email address.
    // - Hibernate translates this method name into: SELECT * FROM users WHERE email = ?;
    // - Used during login to look up the user record by their entered email.
    Optional<User> findByEmail(String email);

    // Custom Query Method: Checks if a user already exists with the given email.
    // - Hibernate translates this into a quick EXISTS SQL query returning a boolean.
    // - Used during registration to prevent duplicate accounts with the same email.
    Boolean existsByEmail(String email);
}
