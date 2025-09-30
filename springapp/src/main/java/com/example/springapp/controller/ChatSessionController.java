package com.example.springapp.controller;

import com.example.springapp.model.ChatSession;
import com.example.springapp.service.ChatSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/chatsessions")
public class ChatSessionController {
    private final ChatSessionService chatSessionService;

    public ChatSessionController(ChatSessionService chatSessionService) {
        this.chatSessionService = chatSessionService;
    }

    @GetMapping
    public Page<ChatSession> getAllChatSessions(Pageable pageable) {
        return chatSessionService.getAllChatSessions(pageable);
    }
     @GetMapping("/user/{userId}")
    public Page<ChatSession> getChatSessionsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        return chatSessionService.getChatSessionsByUserId(userId, page, size);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatSession> getChatSessionById(@PathVariable Long id) {
        return chatSessionService.getChatSessionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

   @PostMapping("/user/{userId}")
    public ChatSession createChatSession(@PathVariable Long userId, @RequestBody ChatSession chatSession) {
        return chatSessionService.createChatSession(userId, chatSession);
    }

    @PutMapping("/{id}")
    public ChatSession updateChatSession(@PathVariable Long id, @RequestBody ChatSession chatSession) {
        return chatSessionService.updateChatSession(id, chatSession);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChatSession(@PathVariable Long id) {
        chatSessionService.deleteChatSession(id);
        return ResponseEntity.noContent().build();
    }
}
