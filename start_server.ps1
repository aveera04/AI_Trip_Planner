# AI Travel Planner - Server Start Script
# This script starts both the backend and frontend servers

Write-Host "🌍 AI Travel Planner - Starting Servers..." -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Function to check if a command exists
function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

if (!(Test-Command "python")) {
    Write-Host "❌ Python not found. Please install Python 3.10 or higher." -ForegroundColor Red
    exit 1
}

# Check if virtual environment exists
if (!(Test-Path ".venv")) {
    Write-Host "❌ Virtual environment not found. Please run setup first." -ForegroundColor Red
    Write-Host "Run: python -m venv .venv" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "❌ .env file not found. Please copy .env.example to .env and configure your API keys." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed!" -ForegroundColor Green

# Start backend server
Write-Host "`n🚀 Starting Backend Server (Port 8000)..." -ForegroundColor Cyan
Write-Host "Activating virtual environment..." -ForegroundColor Yellow

try {
    # Activate virtual environment and start backend server
    Write-Host "✅ Backend server starting..." -ForegroundColor Green
    Write-Host "Backend URL: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
    
    # Display status
    Write-Host "`n" + "=" * 50 -ForegroundColor Cyan
    Write-Host "🎉 AI Travel Planner Backend is starting!" -ForegroundColor Green
    Write-Host "=" * 50 -ForegroundColor Cyan
    Write-Host "Backend API: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host "Health Check: http://localhost:8000/health" -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor Cyan
    
    Write-Host "`n📖 Usage Instructions:" -ForegroundColor Yellow
    Write-Host "1. Open http://localhost:8000/docs in your browser for API documentation" -ForegroundColor White
    Write-Host "2. Start the frontend server separately with: cd frontend && npm run dev" -ForegroundColor White
    Write-Host "3. Press Ctrl+C to stop the server" -ForegroundColor White
    
    # Activate virtual environment and start server
    & .\.venv\Scripts\Activate.ps1
    python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0
    
} catch {
    Write-Host "❌ Error starting server: $_" -ForegroundColor Red
} finally {
    Write-Host "`n🧹 Server stopped." -ForegroundColor Yellow
    Write-Host "Thank you for using AI Travel Planner! 🌍✈️" -ForegroundColor Cyan
}
