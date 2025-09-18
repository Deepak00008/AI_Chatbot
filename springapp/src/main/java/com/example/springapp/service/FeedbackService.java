package com.example.springapp.service;

import com.example.springapp.model.Feedback;
import com.example.springapp.model.User;
import com.example.springapp.repository.FeedbackRepository;
import com.example.springapp.repository.UserRepository;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepo;
    private final UserRepository userRepo;

    public FeedbackService(FeedbackRepository feedbackRepo, UserRepository userRepo) {
        this.feedbackRepo = feedbackRepo;
        this.userRepo = userRepo;
    }

    public List<Feedback> getAllFeedbacks() {
        return feedbackRepo.findAll();
    }
       public List<Feedback> getFeedbacksByUserId(Long userId) {
    return feedbackRepo.findByUserId(userId);
}

    public Optional<Feedback> getFeedbackById(Long id) {
        return feedbackRepo.findById(id);
    }
 


    public Feedback createFeedback(Long userId, Feedback feedback) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        feedback.setUser(user);
        return feedbackRepo.save(feedback);
    }

    public Feedback updateFeedback(Long id, Feedback updatedFeedback) {
        return feedbackRepo.findById(id).map(feedback -> {
            feedback.setMessage(updatedFeedback.getMessage());
            feedback.setRating(updatedFeedback.getRating());
            // Optional: Update user reference if needed
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
