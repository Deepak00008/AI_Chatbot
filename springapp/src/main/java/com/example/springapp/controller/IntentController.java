package com.example.springapp.controller;

import com.example.springapp.model.Intent;
import com.example.springapp.service.IntentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/intents")
public class IntentController {
    private final IntentService intentService;

    public IntentController(IntentService intentService) {
        this.intentService = intentService;
    }

    @GetMapping
    public List<Intent> getAllIntents() {
        return intentService.getAllIntents();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Intent> getIntentById(@PathVariable Long id) {
        return intentService.getIntentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Intent createIntent(@RequestBody Intent intent) {
        return intentService.createIntent(intent);
    }

    @PutMapping("/{id}")
    public Intent updateIntent(@PathVariable Long id, @RequestBody Intent intent) {
        return intentService.updateIntent(id, intent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIntent(@PathVariable Long id) {
        intentService.deleteIntent(id);
        return ResponseEntity.noContent().build();
    }
}
