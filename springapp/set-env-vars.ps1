# PowerShell script to set up environment variables for AI Chatbot Application
Write-Host "Setting up environment variables for AI Chatbot Application..." -ForegroundColor Green
Write-Host ""

# Set API Keys as Environment Variables
$env:GEMINI_API_KEY = "AIzaSyBC1ucJNZkXwzZRDysnB390V1wLS0qmAj0"
$env:OPENWEATHER_API_KEY = "332ea5b0af0402b8d7685fb0f0c6e4c5"
$env:NEWS_API_KEY = "7cee087d240c4bf1a5d9518d1cd8856b"

Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Current API Keys:" -ForegroundColor Yellow
Write-Host "GEMINI_API_KEY = $env:GEMINI_API_KEY"
Write-Host "OPENWEATHER_API_KEY = $env:OPENWEATHER_API_KEY"
Write-Host "NEWS_API_KEY = $env:NEWS_API_KEY"
Write-Host ""
Write-Host "Note: These environment variables are only valid for this PowerShell session." -ForegroundColor Cyan
Write-Host "To make them permanent, add them to your system environment variables." -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Spring Boot application..." -ForegroundColor Green
Write-Host ""

# Start the Spring Boot application
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8083"
