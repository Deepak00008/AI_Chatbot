package com.example.springapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sender;         // "USER" or "BOT"
    private String messageContent;
    private LocalDateTime timestamp;

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
    }
}
