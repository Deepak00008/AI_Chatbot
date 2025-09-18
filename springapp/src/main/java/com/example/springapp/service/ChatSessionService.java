package com.example.springapp.service;

import com.example.springapp.model.ChatSession;
import com.example.springapp.model.User;
import com.example.springapp.repository.ChatSessionRepository;
import com.example.springapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatSessionService {

    private final ChatSessionRepository chatSessionRepo;
    private final UserRepository userRepo;

    public ChatSessionService(ChatSessionRepository chatSessionRepo, UserRepository userRepo) {
        this.chatSessionRepo = chatSessionRepo;
        this.userRepo = userRepo;
    }

    public List<ChatSession> getAllChatSessions() {
        return chatSessionRepo.findAll();
    }

    public Optional<ChatSession> getChatSessionById(Long id) {
        return chatSessionRepo.findById(id);
    }

    // Updated to accept userId
    public ChatSession createChatSession(Long userId, ChatSession chatSession) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        chatSession.setUser(user);
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
}
