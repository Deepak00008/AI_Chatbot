package com.example.springapp.model;

import jakarta.persistence.*;

@Entity
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;
    private int rating;  // Example: 1 to 5 stars

    // Many Feedbacks belong to One User
    @ManyToOne
    @JoinColumn(name = "user_id")  // Foreign key column in Feedback table
    private User user;

    public Feedback() {}

    public Feedback(String message, int rating, User user) {
        this.message = message;
        this.rating = rating;
        this.user = user;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
