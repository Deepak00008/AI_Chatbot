# Environment Variables Setup Guide

This guide explains how to set up environment variables for the AI Chatbot Application to securely manage API keys.

## 🔐 Why Use Environment Variables?

- **Security**: API keys are not exposed in source code
- **Flexibility**: Easy to change keys without modifying code
- **Best Practice**: Industry standard for managing sensitive data

## 🚀 Quick Start

### Option 1: Use the provided scripts (Recommended)

**For Windows Command Prompt:**
```cmd
set-env-vars.bat
```

**For Windows PowerShell:**
```powershell
.\set-env-vars.ps1
```

**For Linux/Mac:**
```bash
./set-env-vars.sh
```

### Option 2: Manual Setup

#### Windows Command Prompt:
```cmd
set GEMINI_API_KEY=your_actual_gemini_key
set OPENWEATHER_API_KEY=your_actual_openweather_key
set NEWS_API_KEY=your_actual_news_key
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8083"
```

#### Windows PowerShell:
```powershell
$env:GEMINI_API_KEY="your_actual_gemini_key"
$env:OPENWEATHER_API_KEY="your_actual_openweather_key"
$env:NEWS_API_KEY="your_actual_news_key"
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8083"
```

#### Linux/Mac:
```bash
export GEMINI_API_KEY="your_actual_gemini_key"
export OPENWEATHER_API_KEY="your_actual_openweather_key"
export NEWS_API_KEY="your_actual_news_key"
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8083"
```

## 🔑 Getting API Keys

### 1. Gemini AI API Key
- Go to [Google AI Studio](https://aistudio.google.com/)
- Sign in with your Google account
- Click "Get API Key"
- Create a new API key
- Copy the key

### 2. OpenWeather API Key
- Go to [OpenWeatherMap](https://openweathermap.org/api)
- Sign up for a free account
- Go to "API Keys" section
- Copy your API key

### 3. News API Key
- Go to [NewsAPI.org](https://newsapi.org/)
- Sign up for a free account
- Go to "API Keys" section
- Copy your API key

## 🔧 How It Works

The application.properties file now uses this syntax:
```properties
gemini.api.key=${GEMINI_API_KEY:default_value}
```

This means:
- If `GEMINI_API_KEY` environment variable exists, use its value
- If not, use the `default_value` (fallback)

## 🛡️ Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables in production**
3. **Rotate API keys regularly**
4. **Use different keys for development and production**

## 🐛 Troubleshooting

### Environment variables not working?
1. Make sure you're setting them in the same terminal session
2. Check if the variable names match exactly
3. Restart your application after setting variables

### Application not starting?
1. Check if all required environment variables are set
2. Verify API keys are valid
3. Check the application logs for errors

## 📝 Next Steps

1. Set up your environment variables using one of the methods above
2. Test the application to ensure it's working
3. Consider setting up permanent environment variables for your system
4. Update your deployment scripts to include environment variable setup
