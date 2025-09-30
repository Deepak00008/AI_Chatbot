package com.example.springapp.controller;

import com.example.springapp.service.IntentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    
    private final IntentService intentService;
    
    public ChatController(IntentService intentService) {
        this.intentService = intentService;
    }
    
    @PostMapping
    public ResponseEntity<Map<String, String>> processMessage(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String sessionId = request.get("sessionId");
        
        if (message == null || message.trim().isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("reply", "Please enter a message.");
            return ResponseEntity.ok(response);
        }
        
        // Simple keyword-based response using Intent service
        String response = getResponseForMessage(message);
        
        Map<String, String> chatResponse = new HashMap<>();
        chatResponse.put("reply", response);
        chatResponse.put("sessionId", sessionId);
        
        return ResponseEntity.ok(chatResponse);
    }
    
    private String getResponseForMessage(String message) {
        // Extract keywords from the message
        String[] words = message.toLowerCase().split("\\s+");
        
        for (String word : words) {
            try {
                Optional<String> response = intentService.getResponseByKeyword(word);
                if (response.isPresent()) {
                    return response.get();
                }
            } catch (Exception e) {
                // Continue to next word
            }
        }
        
        // Default responses based on common patterns
        if (message.toLowerCase().contains("hello") || message.toLowerCase().contains("hi")) {
            return "Hello! How can I help you today?";
        } else if (message.toLowerCase().contains("help")) {
            return "I'm here to help! You can ask me questions about various topics. What would you like to know?";
        } else if (message.toLowerCase().contains("thank")) {
            return "You're welcome! Is there anything else I can help you with?";
        } else if (message.toLowerCase().contains("bye") || message.toLowerCase().contains("goodbye")) {
            return "Goodbye! Have a great day!";
        } else {
            return "I understand you're asking about: \"" + message + "\". Could you please provide more details so I can help you better?";
        }
    }
}
