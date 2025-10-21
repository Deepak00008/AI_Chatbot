package com.example.springapp.service;

import com.example.springapp.dto.LoginRequest;
import com.example.springapp.dto.LoginResponse;
import com.example.springapp.dto.RegisterRequest;
import com.example.springapp.model.User;
import com.example.springapp.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthenticationService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public AuthenticationService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public LoginResponse login(LoginRequest loginRequest) {
        // Check if input is email or username
        boolean isEmail = loginRequest.getUsernameOrEmail().contains("@");
        
        Optional<User> userOptional;
        if (isEmail) {
            userOptional = userRepository.findByEmail(loginRequest.getUsernameOrEmail());
        } else {
            userOptional = userRepository.findByUsername(loginRequest.getUsernameOrEmail());
        }
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid username/email or password");
        }
        
        User user = userOptional.get();
        
        // Check if user has a valid password
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new RuntimeException("User account is not properly configured. Please contact support.");
        }
        
        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username/email or password");
        }
        
        // Create login response
        return new LoginResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.getCategory(),
            user.getAvatar(),
            "dummy-token" // In a real app, generate JWT token here
        );
    }
    
    public LoginResponse register(RegisterRequest registerRequest) {
        // Check if username already exists
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
        // Check if email already exists
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setCategory(registerRequest.getCategory());
        
        // Check if this is an admin registration (special email pattern)
        if (registerRequest.getEmail().equals("admin@example.com")) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER"); // Default role
        }
        
        User savedUser = userRepository.save(user);
        
        // Create login response
        return new LoginResponse(
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getRole(),
            savedUser.getCategory(),
            savedUser.getAvatar(),
            "dummy-token" // In a real app, generate JWT token here
        );
    }
    
    // Method to create admin user (for testing/initial setup)
    public LoginResponse createAdminUser() {
        // Check if admin already exists
        if (userRepository.findByEmail("admin@example.com").isPresent()) {
            User existingAdmin = userRepository.findByEmail("admin@example.com").get();
            return new LoginResponse(
                existingAdmin.getId(),
                existingAdmin.getUsername(),
                existingAdmin.getEmail(),
                existingAdmin.getRole(),
                existingAdmin.getCategory(),
                existingAdmin.getAvatar(),
                "dummy-token"
            );
        }
        
        // Create admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@example.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setCategory("admin");
        admin.setRole("ADMIN");
        
        User savedAdmin = userRepository.save(admin);
        
        return new LoginResponse(
            savedAdmin.getId(),
            savedAdmin.getUsername(),
            savedAdmin.getEmail(),
            savedAdmin.getRole(),
            savedAdmin.getCategory(),
            savedAdmin.getAvatar(),
            "dummy-token"
        );
    }
}
