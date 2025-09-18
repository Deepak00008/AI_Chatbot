package com.example.springapp.service;

import com.example.springapp.model.ChatMessage;
import com.example.springapp.model.ChatSession;
import com.example.springapp.model.Intent;
import com.example.springapp.repository.ChatMessageRepository;
import com.example.springapp.repository.ChatSessionRepository;
import com.example.springapp.repository.IntentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepo;
    private final ChatSessionRepository chatSessionRepo;
    private final IntentRepository intentRepo;

    public ChatMessageService(ChatMessageRepository chatMessageRepo, ChatSessionRepository chatSessionRepo, IntentRepository intentRepo) {
        this.chatMessageRepo = chatMessageRepo;
        this.chatSessionRepo = chatSessionRepo;
        this.intentRepo = intentRepo;
    }

    public List<ChatMessage> getAllChatMessages() {
        return chatMessageRepo.findAll();
    }

    public Optional<ChatMessage> getChatMessageById(Long id) {
        return chatMessageRepo.findById(id);
    }

    // Create a ChatMessage by associating sessionId and intentId
    public ChatMessage createChatMessage(Long sessionId, Long intentId, ChatMessage chatMessage) {
        ChatSession session = chatSessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("ChatSession not found with ID: " + sessionId));

        Intent intent = intentRepo.findById(intentId)
                .orElse(null); // Intent can be null if not provided

        chatMessage.setChatSession(session);
        chatMessage.setIntent(intent);

        return chatMessageRepo.save(chatMessage);
    }

    public ChatMessage updateChatMessage(Long id, ChatMessage updatedMessage) {
        return chatMessageRepo.findById(id).map(message -> {
            message.setSender(updatedMessage.getSender());
            message.setMessageContent(updatedMessage.getMessageContent());
            message.setTimestamp(updatedMessage.getTimestamp());
            // Update session and intent if provided
            if (updatedMessage.getChatSession() != null) {
                message.setChatSession(updatedMessage.getChatSession());
            }
            if (updatedMessage.getIntent() != null) {
                message.setIntent(updatedMessage.getIntent());
            }
            return chatMessageRepo.save(message);
        }).orElseGet(() -> {
            updatedMessage.setId(id);
            return chatMessageRepo.save(updatedMessage);
        });
    }

    public void deleteChatMessage(Long id) {
        chatMessageRepo.deleteById(id);
    }
}
