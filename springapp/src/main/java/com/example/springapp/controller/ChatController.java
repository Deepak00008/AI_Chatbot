package com.example.springapp.controller;

import com.example.springapp.service.ChatService;
import com.example.springapp.service.ChatMessageService;
import com.example.springapp.service.ChatSessionService;
import com.example.springapp.model.ChatMessage;
import com.example.springapp.model.ChatSession;
import com.example.springapp.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    
    private final ChatService chatService;
    private final ChatMessageService chatMessageService;
    private final ChatSessionService chatSessionService;
    
    public ChatController(ChatService chatService, ChatMessageService chatMessageService, ChatSessionService chatSessionService) {
        this.chatService = chatService;
        this.chatMessageService = chatMessageService;
        this.chatSessionService = chatSessionService;
    }
    
    @PostMapping
    public ResponseEntity<Map<String, String>> processMessage(@RequestBody Map<String, Object> request) {
        System.out.println("=== CHAT REQUEST RECEIVED ===");
        System.out.println("Request: " + request);
        
        String message = (String) request.get("message");
        String sessionId = (String) request.get("sessionId");
        Object userIdObj = request.get("userId");
        
        System.out.println("Message: " + message);
        System.out.println("SessionId: " + sessionId);
        System.out.println("UserId: " + userIdObj);
        
        if (message == null || message.trim().isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("reply", "Please enter a message.");
            return ResponseEntity.ok(response);
        }
        
        // Use the intelligent ChatService for processing
        System.out.println("Processing message through ChatService...");
        String response = chatService.processMessage(message, sessionId);
        System.out.println("ChatService response: " + response);
        
        // Save both user message and bot response to database
        try {
            Long userId = 1L; // Default to user 1
            if (userIdObj != null) {
                if (userIdObj instanceof Number) {
                    userId = ((Number) userIdObj).longValue();
                } else if (userIdObj instanceof String) {
                    userId = Long.parseLong((String) userIdObj);
                }
            }
            
            // Find or create session
            ChatSession session = findOrCreateSession(sessionId, userId);
            
            // Save user message
            ChatMessage userMessage = new ChatMessage();
            userMessage.setSender("USER");
            userMessage.setMessageContent(message);
            // Timestamp will be set by @PrePersist annotation
            
            System.out.println("Saving user message: " + message);
            System.out.println("Session ID: " + session.getId());
            
            ChatMessage savedUserMessage = chatMessageService.createChatMessage(session.getId(), userId, userMessage);
            System.out.println("User message saved with ID: " + savedUserMessage.getId());
            
            // Save bot response
            ChatMessage botMessage = new ChatMessage();
            botMessage.setSender("BOT");
            botMessage.setMessageContent(response);
            // Timestamp will be set by @PrePersist annotation
            
            System.out.println("Saving bot message: " + response);
            ChatMessage savedBotMessage = chatMessageService.createChatMessage(session.getId(), userId, botMessage);
            System.out.println("Bot message saved with ID: " + savedBotMessage.getId());
            
        } catch (Exception e) {
            System.err.println("Error saving messages to database: " + e.getMessage());
            e.printStackTrace();
            // Continue with response even if saving fails
        }
        
        Map<String, String> chatResponse = new HashMap<>();
        chatResponse.put("reply", response);
        chatResponse.put("sessionId", sessionId);
        
        return ResponseEntity.ok(chatResponse);
    }
    
    private ChatSession findOrCreateSession(String sessionId, Long userId) {
        // Try to find existing session by sessionName
        if (sessionId != null) {
            try {
                return chatSessionService.findBySessionName(sessionId)
                    .orElseGet(() -> createNewSession(sessionId, userId));
            } catch (Exception e) {
                return createNewSession(sessionId, userId);
            }
        }
        return createNewSession("New Session", userId);
    }
    
    private ChatSession createNewSession(String sessionName, Long userId) {
        // Get the user object first
        User user = chatSessionService.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        
        ChatSession session = new ChatSession();
        session.setSessionName(sessionName);
        // startedAt will be set by @PrePersist annotation
        session.setUser(user);
        
        // Save the session to get an ID
        ChatSession savedSession = chatSessionService.createChatSession(session);
        System.out.println("Created new session with ID: " + savedSession.getId());
        return savedSession;
    }
}
