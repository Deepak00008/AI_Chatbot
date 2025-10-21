package com.example.springapp.service;

import com.example.springapp.model.Feedback;
import com.example.springapp.model.User;
import com.example.springapp.repository.FeedbackRepository;
import com.example.springapp.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.util.Optional;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepo;
    private final UserRepository userRepo;

    public FeedbackService(FeedbackRepository feedbackRepo, UserRepository userRepo) {
        this.feedbackRepo = feedbackRepo;
        this.userRepo = userRepo;
    }

    public Page<Feedback> getAllFeedbacks(Pageable pageable) {
        return feedbackRepo.findAll(pageable);
    }
       public Page<Feedback> getFeedbacksByUserId(Long userId, Pageable pageable) {
    return feedbackRepo.findByUserId(userId,pageable);
}

    public Optional<Feedback> getFeedbackById(Long id) {
        return feedbackRepo.findById(id);
    }
 


    public Feedback createFeedback(Long userId, Feedback feedback) {
        if (userId != null) {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
            feedback.setUser(user);
        } else {
            // Allow anonymous feedback by setting user to null
            feedback.setUser(null);
        }
        
        // Timestamps will be automatically set by @PrePersist annotation
        return feedbackRepo.save(feedback);
    }

    public Feedback updateFeedback(Long id, Feedback updatedFeedback) {
        return feedbackRepo.findById(id).map(feedback -> {
            feedback.setMessage(updatedFeedback.getMessage());
            feedback.setRating(updatedFeedback.getRating());
            // Optional: Update user reference if needed
            // updatedAt will be automatically set by @PreUpdate annotation
            return feedbackRepo.save(feedback);
        }).orElseGet(() -> {
            updatedFeedback.setId(id);
            return feedbackRepo.save(updatedFeedback);
        });
    }

    public void deleteFeedback(Long id) {
        feedbackRepo.deleteById(id);
    }
 

}
