package com.example.springapp.controller;

import com.example.springapp.model.Feedback;
import com.example.springapp.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {
    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping
    public Page<Feedback> getAllFeedbacks(
        @PageableDefault(page = 0, size = 5, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) 
        {
        return feedbackService.getAllFeedbacks(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable Long id) {
        return feedbackService.getFeedbackById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
public Page<Feedback> getFeedbacksByUser(
    @PathVariable Long userId,
    @PageableDefault(page = 0, size = 5, sort = "id", direction = Sort.Direction.DESC) Pageable pageable)
     {
    return feedbackService.getFeedbacksByUserId(userId, pageable);
}

    @PostMapping
    public Feedback createFeedback(@RequestBody Feedback feedback) {
        // Extract userId from the feedback object
        Long userId = feedback.getUser() != null ? feedback.getUser().getId() : null;
        if (userId == null) {
            // Allow anonymous feedback by setting userId to null
            return feedbackService.createFeedback(null, feedback);
        }
        return feedbackService.createFeedback(userId, feedback);
    }

    @PutMapping("/{id}")
    public Feedback updateFeedback(@PathVariable Long id, @RequestBody Feedback feedback) {
        return feedbackService.updateFeedback(id, feedback);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}
