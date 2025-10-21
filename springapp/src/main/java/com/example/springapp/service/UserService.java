package com.example.springapp.service;

import com.example.springapp.model.User;
import com.example.springapp.repository.UserRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepo;
     private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Cacheable(value = "users", key = "'all'")
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    public Page<User> getAllUsersPaginated(int page, int size) {
        return userRepo.findAll(PageRequest.of(page, size));
    }

    public Optional<User> getUserById(Long id) {
        return userRepo.findById(id);
    }

    @CacheEvict(value = "users", allEntries = true)
    public User createUser(User user) {
        // Validate password before encoding
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepo.save(user);
        // Clear cache after creating user
        return savedUser;
    }

    @CacheEvict(value = "users", allEntries = true)
    public User updateUser(Long id, User updatedUser) {
        return userRepo.findById(id).map(user -> {
            user.setUsername(updatedUser.getUsername());
            user.setEmail(updatedUser.getEmail());
            // Only update password if it's provided and not empty
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().trim().isEmpty()) {
                user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            }
            return userRepo.save(user);
        }).orElseGet(() -> {
            updatedUser.setId(id);
            // Encode password before saving new user
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().trim().isEmpty()) {
                updatedUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            }
            return userRepo.save(updatedUser);
        });
    }

    @CacheEvict(value = "users", allEntries = true)
    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }
       //Get profile
    public Optional<User> getProfile(Long id) {
        return userRepo.findById(id);
    }

    // Clear users cache manually
    @CacheEvict(value = "users", allEntries = true)
    public void clearUsersCache() {
        // This method will clear the users cache
    }

    // ✅ Profile Update
    public User updateProfile(Long id, User updatedUser) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setEmail(updatedUser.getEmail());
        user.setUsername(updatedUser.getUsername());
        return userRepo.save(user);
    }

    // ✅ Change Password
    public void changePassword(Long id, String currentPassword, String newPassword) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPassword() != null && !passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Invalid current password");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }

    // ✅ Upload Avatar
    public User uploadAvatar(Long id, MultipartFile file) throws IOException {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get("uploads/");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        user.setAvatar("/uploads/" + fileName); // store relative path or URL
        return userRepo.save(user);
    }

    // ✅ Delete Account
    @CacheEvict(value = "users", allEntries = true)
    public void deleteAccount(Long id) {
        if (!userRepo.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepo.deleteById(id);
    }
}
