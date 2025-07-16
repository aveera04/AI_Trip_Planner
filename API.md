# 📡 API Documentation

Complete API documentation for the AI Travel Planner backend service.

## 🌐 Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://your-domain.com`

## 🔑 Authentication
Currently, the API doesn't require authentication. Future versions may implement API key authentication.

## 📋 API Endpoints

### Health Check
Check the health and status of the API service.

**Endpoint**: `GET /health`

**Response**: `200 OK`
```json
{
  "status": "healthy",
  "service": "AI Travel Planner",
  "timestamp": "2024-01-15T10:30:00.123456",
  "version": "1.0.0"
}
```

**Example**:
```bash
curl -X GET http://localhost:8000/health
```

---

### API Information
Get information about the API, including available endpoints and versions.

**Endpoint**: `GET /api/info`

**Response**: `200 OK`
```json
{
  "name": "AI Travel Planner API",
  "version": "1.0.0",
  "description": "AI-powered travel planning service",
  "endpoints": {
    "/health": "Health check",
    "/api/info": "API information",
    "/query": "Generate travel plans"
  },
  "frontend_url": "http://localhost:8081"
}
```

**Example**:
```bash
curl -X GET http://localhost:8000/api/info
```

---

### Travel Query
Generate a personalized travel plan based on user input.

**Endpoint**: `POST /query`

**Request Body**:
```json
{
  "question": "string"
}
```

**Parameters**:
- `question` (string, required): The travel planning question or request

**Response**: `200 OK`
```json
{
  "answer": "string",
  "timestamp": "2024-01-15T10:30:00.123456",
  "status": "success",
  "query": "string",
  "processing_time": 2.345
}
```

**Error Response**: `500 Internal Server Error`
```json
{
  "error": "string",
  "timestamp": "2024-01-15T10:30:00.123456",
  "status": "error",
  "query": "string",
  "processing_time": 1.234
}
```

**Example**:
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Plan a 5-day trip to Paris with a budget of $2000"
  }'
```

**Example Response**:
```json
{
  "answer": "# 🗼 5-Day Paris Adventure - $2000 Budget\n\n## Day 1: Arrival & Montmartre\n- **Morning**: Arrive in Paris, check into hotel\n- **Afternoon**: Explore Montmartre, visit Sacré-Cœur\n- **Evening**: Dinner at local bistro\n- **Cost**: $200\n\n## Day 2: Classic Paris\n- **Morning**: Louvre Museum\n- **Afternoon**: Walk along Seine, visit Notre-Dame area\n- **Evening**: Sunset at Pont des Arts\n- **Cost**: $150\n\n...",
  "timestamp": "2024-01-15T10:30:00.123456",
  "status": "success",
  "query": "Plan a 5-day trip to Paris with a budget of $2000",
  "processing_time": 3.456
}
```

## 🎯 Query Examples

### Basic Trip Planning
```json
{
  "question": "Plan a weekend trip to New York City"
}
```

### Budget-Specific Planning
```json
{
  "question": "I want to visit Japan for 10 days with a $3000 budget"
}
```

### Activity-Focused Planning
```json
{
  "question": "Plan a food and culture tour of Italy for 2 weeks"
}
```

### Family Travel Planning
```json
{
  "question": "Plan a family-friendly 7-day vacation to Disney World with 2 adults and 3 kids"
}
```

### Business Travel Planning
```json
{
  "question": "I need to plan a 3-day business trip to London with meetings downtown"
}
```

### Adventure Travel Planning
```json
{
  "question": "Plan an adventure hiking trip to the Swiss Alps for 8 days"
}
```

## 🔧 Advanced Features

### Weather Integration
The API automatically includes weather information for destinations:
```json
{
  "question": "What's the weather like in Bali next week and what should I pack?"
}
```

### Currency Conversion
Automatic currency conversion for international travel:
```json
{
  "question": "How much would a 5-day trip to London cost in USD?"
}
```

### Place Search
Detailed place information and recommendations:
```json
{
  "question": "Find the best restaurants near the Colosseum in Rome"
}
```

### Expense Calculation
Detailed budget breakdowns:
```json
{
  "question": "Calculate the total cost for a couple's honeymoon in Maldives for 7 days"
}
```

## 📊 Response Format Details

### Success Response Structure
```json
{
  "answer": "Markdown-formatted travel plan",
  "timestamp": "ISO 8601 timestamp",
  "status": "success",
  "query": "Original user query",
  "processing_time": "Time in seconds (float)"
}
```

### Error Response Structure
```json
{
  "error": "Error message",
  "timestamp": "ISO 8601 timestamp",
  "status": "error",
  "query": "Original user query (if available)",
  "processing_time": "Time in seconds (float)"
}
```

## 🚫 Error Codes

### HTTP Status Codes
- `200 OK`: Request successful
- `400 Bad Request`: Invalid request format
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

### Common Error Scenarios

#### Invalid Request Format
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"invalid": "request"}'
```

Response:
```json
{
  "detail": [
    {
      "loc": ["body", "question"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### Empty Question
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": ""}'
```

#### API Key Issues
If external API services are unavailable:
```json
{
  "error": "Weather service temporarily unavailable",
  "timestamp": "2024-01-15T10:30:00.123456",
  "status": "error",
  "query": "Plan a trip to Paris",
  "processing_time": 1.234
}
```

## 🎨 Response Content

### Markdown Formatting
The API returns responses in Markdown format with:
- Headers (`#`, `##`, `###`)
- Lists (`-`, `*`, `1.`)
- Bold (`**text**`) and italic (`*text*`)
- Links (`[text](url)`)
- Tables
- Code blocks

### Content Structure
Typical response includes:
1. **Trip Overview**: Destination, duration, budget
2. **Day-by-Day Itinerary**: Activities, costs, timing
3. **Weather Information**: Current and forecasted weather
4. **Budget Breakdown**: Detailed cost estimates
5. **Recommendations**: Places to visit, restaurants, activities
6. **Practical Information**: Transportation, accommodation, tips

## 🔄 Rate Limiting

Current rate limiting (if implemented):
- **Development**: No rate limiting
- **Production**: 100 requests per minute per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1642248000
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
curl: (7) Failed to connect to localhost port 8000: Connection refused
```
**Solution**: Ensure the backend server is running

#### 2. Invalid JSON
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "invalid json"'
```
**Solution**: Check JSON syntax

#### 3. Timeout
Long processing times may result in timeouts.
**Solution**: Increase timeout in client or optimize query

#### 4. API Key Issues
```json
{
  "error": "API key invalid or missing",
  "status": "error"
}
```
**Solution**: Check environment variables and API key validity

### Debug Mode
Enable debug mode for detailed error information:
```bash
export LOG_LEVEL=DEBUG
python -m uvicorn main:app --reload
```

## 📈 Performance Considerations

### Response Times
- **Simple queries**: 1-3 seconds
- **Complex queries**: 3-10 seconds
- **Weather data**: +0.5-1 second
- **Currency conversion**: +0.2-0.5 seconds

### Optimization Tips
1. **Be specific**: More specific queries get faster, better responses
2. **Avoid very long queries**: Keep queries under 500 characters
3. **Use caching**: Frontend should cache responses when appropriate
4. **Retry logic**: Implement exponential backoff for retries

## 🔐 Security

### Input Validation
- Maximum query length: 2000 characters
- Sanitization of user inputs
- Prevention of injection attacks

### CORS Configuration
```python
# Allowed origins
allow_origins = [
    "http://localhost:3000",
    "http://localhost:8080", 
    "http://localhost:8081"
]
```

### Headers
```
Content-Type: application/json
Accept: application/json
```

## 🧪 Testing

### Unit Tests
```bash
# Test health endpoint
curl -X GET http://localhost:8000/health

# Test query endpoint
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Test query"}'
```

### Integration Tests
```python
import requests

def test_query_endpoint():
    response = requests.post(
        "http://localhost:8000/query",
        json={"question": "Plan a trip to Paris"}
    )
    assert response.status_code == 200
    assert "answer" in response.json()
```

## 📚 SDK Examples

### Python SDK
```python
import requests
import json

class TravelPlannerAPI:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
    
    def health_check(self):
        response = requests.get(f"{self.base_url}/health")
        return response.json()
    
    def plan_trip(self, question):
        response = requests.post(
            f"{self.base_url}/query",
            json={"question": question}
        )
        return response.json()

# Usage
api = TravelPlannerAPI()
plan = api.plan_trip("Plan a weekend trip to Barcelona")
print(plan["answer"])
```

### JavaScript SDK
```javascript
class TravelPlannerAPI {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
    }
    
    async healthCheck() {
        const response = await fetch(`${this.baseUrl}/health`);
        return response.json();
    }
    
    async planTrip(question) {
        const response = await fetch(`${this.baseUrl}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question })
        });
        return response.json();
    }
}

// Usage
const api = new TravelPlannerAPI();
const plan = await api.planTrip('Plan a weekend trip to Barcelona');
console.log(plan.answer);
```

---

## 📞 Support

For API support:
1. Check this documentation
2. Review error messages
3. Check server logs
4. Create an issue on GitHub

**Happy coding!** 🚀
