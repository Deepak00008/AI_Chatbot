package com.example.springapp.controller;

import com.example.springapp.model.ChatMessage;
import com.example.springapp.service.ChatMessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chatmessages")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    public ChatMessageController(ChatMessageService chatMessageService) {
        this.chatMessageService = chatMessageService;
    }

    @GetMapping
    public List<ChatMessage> getAllChatMessages() {
        return chatMessageService.getAllChatMessages();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatMessage> getChatMessageById(@PathVariable Long id) {
        return chatMessageService.getChatMessageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Updated to pass sessionId and intentId
    @PostMapping("/session/{sessionId}/intent/{intentId}")
    public ChatMessage createChatMessage(
            @PathVariable Long sessionId,
            @PathVariable Long intentId,
            @RequestBody ChatMessage chatMessage) {
        return chatMessageService.createChatMessage(sessionId, intentId, chatMessage);
    }

    @PutMapping("/{id}")
    public ChatMessage updateChatMessage(@PathVariable Long id, @RequestBody ChatMessage chatMessage) {
        return chatMessageService.updateChatMessage(id, chatMessage);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChatMessage(@PathVariable Long id) {
        chatMessageService.deleteChatMessage(id);
        return ResponseEntity.noContent().build();
    }
}
