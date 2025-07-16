# AI Travel Planner Setup Guide

## 🚀 Quick Setup Script

This guide will help you set up the AI Travel Planner application quickly and efficiently.

### Prerequisites Verification

Before starting, ensure you have:
- Python 3.10 or higher
- Node.js 18 or higher
- Git installed

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/aveera04/AI_Trip_Planner_fork.git
cd AI_Trip_Planner

# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
```

### Step 2: Configure API Keys

Edit the `.env` file and add your API keys:

```env
# Required API Keys
GROQ_API_KEY=your_groq_api_key_here
WEATHER_API_KEY=your_weather_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create frontend environment file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# Return to root directory
cd ..
```

### Step 4: Test the Setup

```bash
# Test backend
python -c "from main import app; print('Backend setup successful!')"

# Test frontend
cd frontend
npm run build
cd ..
```

### Step 5: Run the Application

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Step 6: Access the Application

- Frontend: http://localhost:8081
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🔧 Troubleshooting

### Common Issues

1. **Virtual Environment Issues**
   ```bash
   # Windows
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   
   # If activation fails
   python -m venv .venv --clear
   ```

2. **Port Already in Use**
   ```bash
   # Change backend port
   python -m uvicorn main:app --reload --port 8001
   
   # Update frontend .env
   echo "VITE_API_BASE_URL=http://localhost:8001" > frontend/.env
   ```

3. **API Key Issues**
   - Verify all API keys are correctly set in `.env`
   - Check API key permissions and quotas
   - Ensure no extra spaces in API keys

4. **Frontend Build Issues**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

### Getting API Keys

1. **Groq API Key**: 
   - Visit https://console.groq.com/
   - Create account and generate API key

2. **Weather API Key**:
   - Visit https://openweathermap.org/api
   - Create account and get API key

3. **Google Places API Key**:
   - Visit https://console.cloud.google.com/
   - Enable Places API and create credentials

4. **Tavily API Key**:
   - Visit https://tavily.com/
   - Create account and get API key

## 📊 Verification

After setup, verify the installation:

```bash
# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:8081
```

## 🎯 Next Steps

1. **Explore the API**: Visit http://localhost:8000/docs
2. **Try the Frontend**: Visit http://localhost:8081
3. **Check Logs**: Use `python log_viewer.py --all`
4. **Customize**: Modify `config/config.yaml` as needed

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the main README.md
3. Create an issue on GitHub with detailed error messages

Happy traveling! 🌍✈️
