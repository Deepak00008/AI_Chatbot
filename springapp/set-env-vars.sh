#!/bin/bash
# Bash script to set up environment variables for AI Chatbot Application

echo "Setting up environment variables for AI Chatbot Application..."
echo ""

# Set API Keys as Environment Variables
export GEMINI_API_KEY="AIzaSyBC1ucJNZkXwzZRDysnB390V1wLS0qmAj0"
export OPENWEATHER_API_KEY="332ea5b0af0402b8d7685fb0f0c6e4c5"
export NEWS_API_KEY="7cee087d240c4bf1a5d9518d1cd8856b"

echo "Environment variables set successfully!"
echo ""
echo "Current API Keys:"
echo "GEMINI_API_KEY = $GEMINI_API_KEY"
echo "OPENWEATHER_API_KEY = $OPENWEATHER_API_KEY"
echo "NEWS_API_KEY = $NEWS_API_KEY"
echo ""
echo "Note: These environment variables are only valid for this terminal session."
echo "To make them permanent, add them to your ~/.bashrc or ~/.zshrc file."
echo ""
echo "Starting Spring Boot application..."
echo ""

# Start the Spring Boot application
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8083"
