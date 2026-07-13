package com.eventplatform;

// Importing the SpringApplication class, which is used to bootstrap and launch our Spring Boot application from Java.
import org.springframework.boot.SpringApplication;
// Importing the @SpringBootApplication annotation, which is a convenience annotation that adds:
// 1. @Configuration: Tags the class as a source of bean definitions.
// 2. @EnableAutoConfiguration: Tells Spring Boot to start adding beans based on classpath settings, other beans, and various property settings.
// 3. @ComponentScan: Tells Spring to look for other components, configurations, and services in the com.eventplatform package, allowing it to find and register controllers, repositories, etc.
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EventPlatformApplication {

    // The main method serves as the entry point for the Java Virtual Machine (JVM) to execute our application.
    public static void main(String[] args) {
        // This static method launches the Spring Boot application by loading the application context and starting the embedded web server (Tomcat).
        SpringApplication.run(EventPlatformApplication.class, args);
    }
}
