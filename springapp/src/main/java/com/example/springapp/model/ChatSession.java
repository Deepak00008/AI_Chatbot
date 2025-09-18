package com.example.springapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionName;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

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
    }
}
