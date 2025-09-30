package com.example.springapp.config;

import com.example.springapp.service.AuthenticationService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private final AuthenticationService authenticationService;
    
    public DataInitializer(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }
    
    @Override
    public void run(String... args) throws Exception {
        // Create admin user on startup if it doesn't exist
        try {
            authenticationService.createAdminUser();
            System.out.println("✅ Admin user created/verified successfully");
        } catch (Exception e) {
            System.out.println("⚠️ Admin user already exists or error occurred: " + e.getMessage());
        }
    }
}
