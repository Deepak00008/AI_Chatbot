package com.example.springapp.dto;

public class LoginResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String category;
    private String avatar;
    private String token;

    // Constructors
    public LoginResponse() {}

    public LoginResponse(Long id, String username, String email, String role, String category, String avatar, String token) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.category = category;
        this.avatar = avatar;
        this.token = token;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
