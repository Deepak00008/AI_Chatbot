package com.example.springapp.service;

import com.example.springapp.model.Intent;
import com.example.springapp.repository.IntentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

    public Page<Intent> getAllIntentsPaginated(int page, int size) {
        return intentRepo.findAll(PageRequest.of(page, size));
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
            intent.setKeyword(updatedIntent.getKeyword());
            intent.setResponse(updatedIntent.getResponse());
            return intentRepo.save(intent);
        }).orElseGet(() -> {
            updatedIntent.setId(id);
            return intentRepo.save(updatedIntent);
        });
    }

    public void deleteIntent(Long id) {
        intentRepo.deleteById(id);
    }

    // New method: get response by keyword
    public Optional<String> getResponseByKeyword(String keyword) {
        return intentRepo.findByKeyword(keyword)
                         .map(Intent::getResponse);
    }
}
