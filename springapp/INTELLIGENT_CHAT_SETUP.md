# Intelligent Chat System Setup

This document explains how to set up and configure the intelligent chat system with intent matching, real-time API calls, and Gemini AI fallback.

## Overview

The intelligent chat system follows this flow:

1. **User asks a question** in Angular frontend
2. **Sends request** to Spring Boot backend `/api/chat`
3. **Backend processes** the message through three layers:
   - Check if user's query matches any intent in DB
   - If yes → respond with stored reply
   - Else check if query type matches real-time category (weather, news, finance)
   - If yes → call respective API
   - Else → send to Gemini API for intelligent response

## API Configuration

### 1. Gemini AI API
- Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Update `application.properties`:
```properties
gemini.api.key=your_actual_gemini_api_key_here
```

### 2. OpenWeather API
- Get your API key from [OpenWeatherMap](https://openweathermap.org/api)
- Update `application.properties`:
```properties
openweather.api.key=your_actual_openweather_api_key_here
```

### 3. News API
- Get your API key from [NewsAPI](https://newsapi.org/)
- Update `application.properties`:
```properties
news.api.key=your_actual_news_api_key_here
```

### 4. Finance API (CoinGecko)
- CoinGecko API is free and doesn't require an API key
- No configuration needed

## File Structure

```
springapp/src/main/java/com/example/springapp/
├── controller/
│   └── ChatController.java          # REST endpoint for chat requests
├── service/
│   ├── ChatService.java             # Main logic: DB → API → Gemini
│   ├── GeminiService.java           # Calls Gemini API
│   └── ExternalAPIService.java      # Calls weather/news/finance APIs
├── repository/
│   └── IntentRepository.java        # Fetch intents from DB
└── model/
    └── Intent.java                  # Intent entity
```

## How It Works

### 1. Intent Matching
- The system first checks if the user's message contains keywords that match stored intents in the database
- Uses both exact keyword matching and partial message matching
- Returns predefined responses for matched intents

### 2. Real-time API Categories
- **Weather**: Detects weather-related keywords and calls OpenWeather API
- **News**: Detects news-related keywords and fetches latest headlines
- **Finance**: Detects financial keywords and gets cryptocurrency prices

### 3. Gemini AI Fallback
- If no intent matches and no real-time category is detected, the message is sent to Gemini AI
- Gemini provides intelligent, contextual responses
- Handles any type of question or conversation

## Example Usage

### Intent-based Response
- User: "What are your business hours?"
- System: Checks database for "business hours" intent
- Response: Predefined response from database

### Weather API
- User: "What's the weather like in London?"
- System: Detects weather category, calls OpenWeather API
- Response: Current weather data for London

### News API
- User: "What's the latest news?"
- System: Detects news category, calls News API
- Response: Latest headlines

### Finance API
- User: "What's the price of Bitcoin?"
- System: Detects finance category, calls CoinGecko API
- Response: Current Bitcoin price

### Gemini AI
- User: "Explain quantum computing"
- System: No intent match, no real-time category
- Response: Intelligent explanation from Gemini AI

## Testing

1. Start the Spring Boot application
2. Send POST requests to `/api/chat` with JSON body:
```json
{
  "message": "What's the weather in Paris?",
  "sessionId": "test-session-123"
}
```

3. The system will automatically route to the appropriate service and return a response.

## Error Handling

- If external APIs are unavailable, the system gracefully falls back to Gemini AI
- If Gemini AI is unavailable, returns a helpful error message
- All API calls include proper error handling and timeouts

## Dependencies

The system uses these Spring Boot features:
- Spring Web (for REST endpoints)
- Spring Data JPA (for database operations)
- Jackson (for JSON processing)
- RestTemplate (for HTTP calls)

No additional dependencies are required beyond the standard Spring Boot starter.
