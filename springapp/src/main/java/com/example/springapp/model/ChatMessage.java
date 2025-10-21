package com.example.springapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(indexes = {
    @Index(name = "idx_chatmessage_session", columnList = "chatSession_id"),
    @Index(name = "idx_chatmessage_timestamp", columnList = "timestamp"),
    @Index(name = "idx_chatmessage_sender", columnList = "sender")
})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sender;         // "USER" or "BOT"
    private String messageContent;
    private LocalDateTime timestamp;
    
    // Timestamp fields
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Many messages belong to one chat session
    @ManyToOne
    @JoinColumn(name = "chat_session_id")
    @JsonIgnoreProperties("chatMessages") // Prevent recursion
    private ChatSession chatSession;

    // Many messages may be linked to one intent
    @ManyToOne
    @JoinColumn(name = "intent_id")
    private Intent intent;

    public ChatMessage() {}

    public ChatMessage(String sender, String messageContent, LocalDateTime timestamp, ChatSession chatSession, Intent intent) {
        this.sender = sender;
        this.messageContent = messageContent;
        this.timestamp = timestamp;
        this.chatSession = chatSession;
        this.intent = intent;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and setters for timestamp fields
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
