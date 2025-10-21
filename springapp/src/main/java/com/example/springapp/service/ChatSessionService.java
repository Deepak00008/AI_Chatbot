package com.example.springapp.service;

import com.example.springapp.model.ChatSession;
import com.example.springapp.model.User;
import com.example.springapp.repository.ChatSessionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import com.example.springapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ChatSessionService {

    private final ChatSessionRepository chatSessionRepo;
    private final UserRepository userRepo;

    public ChatSessionService(ChatSessionRepository chatSessionRepo, UserRepository userRepo) {
        this.chatSessionRepo = chatSessionRepo;
        this.userRepo = userRepo;
    }

    public Page<ChatSession> getAllChatSessions(Pageable pageable) {
        return chatSessionRepo.findAll(pageable);
    }

    public Page<ChatSession> getAllChatSessions(int page, int size) {
        return chatSessionRepo.findAll(PageRequest.of(page, size));
    }

    public Optional<ChatSession> getChatSessionById(Long id) {
        return chatSessionRepo.findById(id);
    }
    public Page<ChatSession> getChatSessionsByUserId(Long userId, int page, int size) {
        return chatSessionRepo.findByUserId(userId, PageRequest.of(page, size));
    }

    // Updated to accept userId
    public ChatSession createChatSession(Long userId, ChatSession chatSession) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        // Set the user - timestamps will be automatically set by @PrePersist annotation
        chatSession.setUser(user);
        
        System.out.println("Creating chat session for user ID: " + userId);
        System.out.println("Session name: " + chatSession.getSessionName());
        System.out.println("Started at: " + chatSession.getStartedAt());
        
        return chatSessionRepo.save(chatSession);
    }

    public ChatSession updateChatSession(Long id, ChatSession updatedSession) {
        return chatSessionRepo.findById(id).map(session -> {
            session.setSessionName(updatedSession.getSessionName());
            session.setStartedAt(updatedSession.getStartedAt());
            session.setEndedAt(updatedSession.getEndedAt());
            // Update user if needed
            if (updatedSession.getUser() != null) {
                session.setUser(updatedSession.getUser());
            }
            return chatSessionRepo.save(session);
        }).orElseGet(() -> {
            updatedSession.setId(id);
            return chatSessionRepo.save(updatedSession);
        });
    }

    public void deleteChatSession(Long id) {
        chatSessionRepo.deleteById(id);
    }

    // Method to end a chat session
    public ChatSession endChatSession(Long id) {
        return chatSessionRepo.findById(id).map(session -> {
            if (session.getEndedAt() == null) {
                session.setEndedAt(LocalDateTime.now());
                return chatSessionRepo.save(session);
            }
            return session; // Already ended
        }).orElseThrow(() -> new RuntimeException("ChatSession not found with ID: " + id));
    }

    // Clear all chat sessions (for testing)
    public void clearAllChatSessions() {
        chatSessionRepo.deleteAll();
        System.out.println("All chat sessions cleared");
    }
    
    // Find session by session name
    public Optional<ChatSession> findBySessionName(String sessionName) {
        return chatSessionRepo.findBySessionName(sessionName);
    }
    
    // Create chat session (overloaded method for compatibility)
    public ChatSession createChatSession(ChatSession chatSession) {
        if (chatSession.getUser() == null) {
            throw new RuntimeException("User must be set for chat session");
        }
        return chatSessionRepo.save(chatSession);
    }
    
    // Get user by ID
    public User getUserById(Long userId) {
        return userRepo.findById(userId).orElse(null);
    }
}
