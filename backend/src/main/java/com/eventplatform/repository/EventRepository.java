package com.eventplatform.repository;

import com.eventplatform.entity.Event;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Custom JPQL Search and Filter Query:
    // - JPQL (Java Persistence Query Language) operates on Java Entity classes and attributes instead of SQL tables.
    // - LOWER(e.title): Converts the title to lowercase to make the search case-insensitive.
    // - LIKE LOWER(CONCAT('%', :search, '%')): Wildcard pattern matching (matches anything containing the search term).
    // - (:category = 'All' OR e.category = :category): If category is 'All', it bypasses the category filter.
    //   Otherwise, it retrieves only events matching the selected category.
    // - @Param("search") maps the Java string variable to the JPQL variable ':search'.
    @Query("SELECT e FROM Event e WHERE " +
           "(LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:category = 'All' OR e.category = :category) AND " +
           "(:location IS NULL OR :location = '' OR LOWER(e.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minPrice IS NULL OR e.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR e.price <= :maxPrice) AND " +
           "(:startDate IS NULL OR e.date >= :startDate) AND " +
           "(:endDate IS NULL OR e.date <= :endDate)")
    List<Event> searchAndFilterEvents(
            @Param("search") String search,
            @Param("category") String category,
            @Param("location") String location,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate,
            Sort sort
    );

    boolean existsByTitle(String title);
}
