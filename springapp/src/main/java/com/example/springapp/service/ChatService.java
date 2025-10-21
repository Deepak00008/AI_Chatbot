package com.example.springapp.service;

import com.example.springapp.model.Intent;
import com.example.springapp.repository.IntentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class ChatService {
    
    private final IntentRepository intentRepository;
    private final GeminiService geminiService;
    private final ExternalAPIService externalAPIService;
    
    // Patterns for real-time API categories
    private static final Pattern WEATHER_PATTERN = Pattern.compile(
        ".*\\b(weather|temperature|rain|sunny|cloudy|forecast|climate)\\b.*", 
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern NEWS_PATTERN = Pattern.compile(
        ".*\\b(news|headlines|latest|breaking|current events|today's news)\\b.*", 
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern FINANCE_PATTERN = Pattern.compile(
        ".*\\b(price|stock|bitcoin|crypto|currency|dollar|euro|finance|market|trading)\\b.*", 
        Pattern.CASE_INSENSITIVE
    );
    
    public ChatService(IntentRepository intentRepository, 
                      GeminiService geminiService, 
                      ExternalAPIService externalAPIService) {
        this.intentRepository = intentRepository;
        this.geminiService = geminiService;
        this.externalAPIService = externalAPIService;
    }
    
    public String processMessage(String message, String sessionId) {
        if (message == null || message.trim().isEmpty()) {
            return "Please enter a message.";
        }
        
        // Step 1: Check if user's query matches any intent in DB
        String intentResponse = checkIntentMatch(message);
        if (intentResponse != null) {
            return intentResponse;
        }
        
        // Step 2: Check if query type matches real-time category
        String realTimeResponse = checkRealTimeCategory(message);
        if (realTimeResponse != null) {
            return realTimeResponse;
        }
        
        // Step 3: Send to Gemini API for intelligent response
        try {
            return geminiService.getResponse(message);
        } catch (Exception e) {
            return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
        }
    }
    
    private String checkIntentMatch(String message) {
        // Extract keywords from the message
        String[] words = message.toLowerCase().split("\\s+");
        
        for (String word : words) {
            try {
                Optional<Intent> intent = intentRepository.findByKeyword(word);
                if (intent.isPresent()) {
                    return intent.get().getResponse();
                }
            } catch (Exception e) {
                // Continue to next word
            }
        }
        
        // Also check for partial matches in the full message
        List<Intent> allIntents = intentRepository.findAll();
        for (Intent intent : allIntents) {
            if (intent.getKeyword() != null && !intent.getKeyword().trim().isEmpty() && 
                message.toLowerCase().contains(intent.getKeyword().toLowerCase())) {
                return intent.getResponse();
            }
        }
        
        return null;
    }
    
    private String checkRealTimeCategory(String message) {
        try {
            if (WEATHER_PATTERN.matcher(message).matches()) {
                return externalAPIService.getWeatherInfo(message);
            } else if (NEWS_PATTERN.matcher(message).matches()) {
                return externalAPIService.getNewsInfo(message);
            } else if (FINANCE_PATTERN.matcher(message).matches()) {
                return externalAPIService.getFinanceInfo(message);
            }
        } catch (Exception e) {
            // Log error but don't fail the entire request
            System.err.println("Error calling external API: " + e.getMessage());
        }
        
        return null;
    }
}
