package com.example.springapp.service;

import com.example.springapp.model.Intent;
import com.example.springapp.repository.IntentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class IntentService {
    private final IntentRepository intentRepo;

    public IntentService(IntentRepository intentRepo) {
        this.intentRepo = intentRepo;
    }

    public List<Intent> getAllIntents() {
        return intentRepo.findAll();
    }

    public Optional<Intent> getIntentById(Long id) {
        return intentRepo.findById(id);
    }

    public Intent createIntent(Intent intent) {
        return intentRepo.save(intent);
    }

    public Intent updateIntent(Long id, Intent updatedIntent) {
        return intentRepo.findById(id).map(intent -> {
            intent.setName(updatedIntent.getName());
            intent.setDescription(updatedIntent.getDescription());
            return intentRepo.save(intent);
        }).orElseGet(() -> {
            updatedIntent.setId(id);
            return intentRepo.save(updatedIntent);
        });
    }

    public void deleteIntent(Long id) {
        intentRepo.deleteById(id);
    }
}
