package com.example.springapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(indexes = {
    @Index(name = "idx_chatsession_user", columnList = "user_id"),
    @Index(name = "idx_chatsession_started", columnList = "startedAt"),
    @Index(name = "idx_chatsession_ended", columnList = "endedAt")
})
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionName;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    
    // Timestamp fields
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Many ChatSessions belong to One User
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // One ChatSession can have many ChatMessages
    @OneToMany(mappedBy = "chatSession", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // prevents infinite recursion
    private List<ChatMessage> chatMessages;

    public ChatSession() {}

    public ChatSession(String sessionName, LocalDateTime startedAt, LocalDateTime endedAt, User user) {
        this.sessionName = sessionName;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.user = user;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Only update endedAt if it's being set to a non-null value
        // This allows for session end tracking
    }

    // Getters and setters for timestamp fields
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
