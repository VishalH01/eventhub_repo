package com.eventplatform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// @SpringBootTest annotation tells Spring Boot to look for a main configuration class (one with @SpringBootApplication)
// and use that to start a Spring application context for our integration test.
@SpringBootTest
class EventPlatformApplicationTests {

    // A simple test to verify that the Spring application context loads successfully without errors.
    @Test
    void contextLoads() {
    }
}
