package com.example.springapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.HashMap;
import java.util.Map;

@Service
public class GeminiService {
    
    @Value("${gemini.api.key:}")
    private String geminiApiKey;
    
    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent}")
    private String geminiApiUrl;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public GeminiService() {
        // Configure RestTemplate with timeout settings
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000); // 10 seconds connection timeout
        factory.setReadTimeout(30000);    // 30 seconds read timeout
        
        this.restTemplate = new RestTemplate(factory);
        this.objectMapper = new ObjectMapper();
    }
    
    public String getResponse(String message) throws Exception {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return "I'm sorry, but the AI service is not configured. Please contact the administrator.";
        }
        
        try {
            // Prepare the request payload
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            
            part.put("text", "You are a helpful AI assistant. Please provide a helpful and accurate response to the following question: " + message);
            content.put("parts", new Object[]{part});
            requestBody.put("contents", new Object[]{content});
            
            // Set up headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Create the request entity
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            // Make the API call
            String url = geminiApiUrl + "?key=" + geminiApiKey;
            ResponseEntity<String> response = restTemplate.exchange(
                url, 
                HttpMethod.POST, 
                requestEntity, 
                String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return parseGeminiResponse(response.getBody());
            } else {
                throw new Exception("Gemini API returned status: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            throw new Exception("Error calling Gemini API: " + e.getMessage());
        }
    }
    
    private String parseGeminiResponse(String responseBody) throws Exception {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            JsonNode candidates = rootNode.path("candidates");
            
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode content = firstCandidate.path("content");
                JsonNode parts = content.path("parts");
                
                if (parts.isArray() && parts.size() > 0) {
                    JsonNode firstPart = parts.get(0);
                    String text = firstPart.path("text").asText();
                    return text.trim();
                }
            }
            
            return "I'm sorry, I couldn't generate a proper response. Please try rephrasing your question.";
            
        } catch (Exception e) {
            throw new Exception("Error parsing Gemini response: " + e.getMessage());
        }
    }
}
