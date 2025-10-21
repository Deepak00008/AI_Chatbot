package com.example.springapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ExternalAPIService {
    
    @Value("${openweather.api.key:}")
    private String openWeatherApiKey;
    
    @Value("${news.api.key:}")
    private String newsApiKey;
    
    @Value("${finance.api.key:}")
    private String financeApiKey;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    // API URLs
    private static final String WEATHER_API_URL = "http://api.openweathermap.org/data/2.5/weather";
    private static final String NEWS_API_URL = "https://newsapi.org/v2/top-headlines";
    private static final String FINANCE_API_URL = "https://api.coingecko.com/api/v3/simple/price";
    
    public ExternalAPIService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    public String getWeatherInfo(String message) {
        if (openWeatherApiKey == null || openWeatherApiKey.isEmpty()) {
            return "Weather information is not available. Please configure the weather API key.";
        }
        
        try {
            // Extract city name from message (simple extraction)
            String city = extractCityFromMessage(message);
            if (city == null) {
                city = "London"; // Default city
            }
            
            String url = WEATHER_API_URL + "?q=" + city + "&appid=" + openWeatherApiKey + "&units=metric";
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return parseWeatherResponse(response.getBody(), city);
            } else {
                return "Sorry, I couldn't fetch weather information for " + city + ".";
            }
            
        } catch (Exception e) {
            return "Sorry, I'm having trouble getting weather information right now.";
        }
    }
    
    public String getNewsInfo(String message) {
        if (newsApiKey == null || newsApiKey.isEmpty()) {
            return "News information is not available. Please configure the news API key.";
        }
        
        try {
            String url = NEWS_API_URL + "?country=us&apiKey=" + newsApiKey + "&pageSize=5";
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return parseNewsResponse(response.getBody());
            } else {
                return "Sorry, I couldn't fetch the latest news right now.";
            }
            
        } catch (Exception e) {
            return "Sorry, I'm having trouble getting news information right now.";
        }
    }
    
    public String getFinanceInfo(String message) {
        try {
            // Extract cryptocurrency or currency from message
            String currency = extractCurrencyFromMessage(message);
            if (currency == null) {
                currency = "bitcoin";
            }
            
            String url = FINANCE_API_URL + "?ids=" + currency + "&vs_currencies=usd";
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return parseFinanceResponse(response.getBody(), currency);
            } else {
                return "Sorry, I couldn't fetch financial information for " + currency + ".";
            }
            
        } catch (Exception e) {
            return "Sorry, I'm having trouble getting financial information right now.";
        }
    }
    
    private String extractCityFromMessage(String message) {
        // Simple city extraction - look for common city patterns
        Pattern cityPattern = Pattern.compile("\\b(?:in|at|for)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)\\b", Pattern.CASE_INSENSITIVE);
        Matcher matcher = cityPattern.matcher(message);
        
        if (matcher.find()) {
            return matcher.group(1);
        }
        
        // Look for standalone city names (very basic)
        String[] commonCities = {"london", "new york", "paris", "tokyo", "sydney", "mumbai", "delhi", "bangalore"};
        String lowerMessage = message.toLowerCase();
        
        for (String city : commonCities) {
            if (lowerMessage.contains(city)) {
                return city.substring(0, 1).toUpperCase() + city.substring(1);
            }
        }
        
        return null;
    }
    
    private String extractCurrencyFromMessage(String message) {
        String lowerMessage = message.toLowerCase();
        
        if (lowerMessage.contains("bitcoin") || lowerMessage.contains("btc")) {
            return "bitcoin";
        } else if (lowerMessage.contains("ethereum") || lowerMessage.contains("eth")) {
            return "ethereum";
        } else if (lowerMessage.contains("dogecoin") || lowerMessage.contains("doge")) {
            return "dogecoin";
        } else if (lowerMessage.contains("cardano") || lowerMessage.contains("ada")) {
            return "cardano";
        }
        
        return "bitcoin"; // Default
    }
    
    private String parseWeatherResponse(String responseBody, String city) throws Exception {
        JsonNode rootNode = objectMapper.readTree(responseBody);
        
        String description = rootNode.path("weather").get(0).path("description").asText();
        double temp = rootNode.path("main").path("temp").asDouble();
        double feelsLike = rootNode.path("main").path("feels_like").asDouble();
        int humidity = rootNode.path("main").path("humidity").asInt();
        
        return String.format("Weather in %s: %s, Temperature: %.1f°C (feels like %.1f°C), Humidity: %d%%", 
                           city, description, temp, feelsLike, humidity);
    }
    
    private String parseNewsResponse(String responseBody) throws Exception {
        JsonNode rootNode = objectMapper.readTree(responseBody);
        JsonNode articles = rootNode.path("articles");
        
        StringBuilder news = new StringBuilder("Here are the latest headlines:\n\n");
        
        for (int i = 0; i < Math.min(3, articles.size()); i++) {
            JsonNode article = articles.get(i);
            String title = article.path("title").asText();
            String source = article.path("source").path("name").asText();
            
            news.append(String.format("%d. %s (Source: %s)\n", i + 1, title, source));
        }
        
        return news.toString();
    }
    
    private String parseFinanceResponse(String responseBody, String currency) throws Exception {
        JsonNode rootNode = objectMapper.readTree(responseBody);
        JsonNode currencyData = rootNode.path(currency);
        
        if (currencyData.has("usd")) {
            double price = currencyData.path("usd").asDouble();
            return String.format("Current %s price: $%.2f USD", currency, price);
        } else {
            return "Sorry, I couldn't find price information for " + currency + ".";
        }
    }
}
