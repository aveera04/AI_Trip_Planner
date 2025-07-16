# 🛠️ Development Guide

This guide provides detailed information for developers who want to contribute to or extend the AI Travel Planner project.

## 🏗️ Architecture Overview

### System Architecture
```
Frontend (React) → Backend (FastAPI) → AI Models (Groq/OpenAI) → External APIs
     ↓                    ↓                      ↓                      ↓
UI Components      API Endpoints         LangChain Tools         Weather, Places,
State Management   Request Handling      Agent Workflow          Currency APIs
```

### Key Components

#### Backend Architecture
- **FastAPI Application** (`main.py`): Main server application
- **AI Agent** (`agent/agentic_workflow.py`): Core AI workflow logic
- **Tools** (`tools/`): Specialized AI tools for different functionalities
- **Utils** (`utils/`): Utility functions and helpers
- **Logger** (`logger/`): Comprehensive logging system

#### Frontend Architecture
- **React Components** (`frontend/src/components/`): UI components
- **Services** (`frontend/src/services/`): API communication layer
- **Types** (`frontend/src/types/`): TypeScript type definitions
- **Hooks** (`frontend/src/hooks/`): Custom React hooks

## 🔧 Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git
- VS Code (recommended)

### Environment Setup
```bash
# Clone repository
git clone https://github.com/aveera04/AI_Trip_Planner_fork.git
cd AI_Trip_Planner

# Setup Python environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Setup pre-commit hooks (optional)
pip install pre-commit
pre-commit install
```

### Frontend Development Setup
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

### Backend Testing
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_agent.py

# Run with verbose output
pytest -v
```

### Frontend Testing
```bash
cd frontend
npm test
npm run test:coverage
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test query endpoint
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Plan a trip to Paris"}'
```

## 📁 Code Structure

### Backend Structure
```
├── agent/
│   └── agentic_workflow.py      # Main AI agent logic
├── tools/                       # AI tools
│   ├── weather_info_tool.py     # Weather information
│   ├── place_search_tool.py     # Place search
│   ├── currency_conversion_tool.py  # Currency conversion
│   └── expense_calculator_tool.py   # Expense calculation
├── utils/                       # Utility functions
│   ├── model_loader.py          # AI model loading
│   ├── config_loader.py         # Configuration loading
│   └── ...
├── logger/                      # Logging system
├── config/                      # Configuration files
└── main.py                      # FastAPI application
```

### Frontend Structure
```
frontend/src/
├── components/
│   ├── travel/                  # Travel-specific components
│   │   ├── TravelPlannerForm.tsx
│   │   ├── HeroSection.tsx
│   │   └── ...
│   └── ui/                      # Reusable UI components
├── services/
│   └── api.ts                   # API service layer
├── types/
│   └── index.ts                 # TypeScript types
├── hooks/
│   └── useTravel.ts             # Custom hooks
└── pages/
    └── Index.tsx                # Main page
```

## 🎯 Adding New Features

### Adding a New AI Tool

1. **Create the tool utility** (`utils/new_tool.py`):
```python
class NewTool:
    def __init__(self):
        self.api_key = os.getenv("NEW_TOOL_API_KEY")
    
    def process(self, query: str) -> str:
        # Implementation
        pass
```

2. **Create the LangChain tool** (`tools/new_tool.py`):
```python
from langchain.tools import tool
from utils.new_tool import NewTool

@tool
def new_tool_function(query: str) -> str:
    """Description of what the tool does"""
    tool = NewTool()
    return tool.process(query)
```

3. **Register the tool** in `agent/agentic_workflow.py`:
```python
from tools.new_tool import new_tool_function

class GraphBuilder:
    def __init__(self):
        # Add to existing tools
        self.tools.append(new_tool_function)
```

### Adding a New API Endpoint

1. **Add the endpoint** to `main.py`:
```python
@app.post("/new-endpoint")
async def new_endpoint(request: NewRequest):
    try:
        # Process request
        result = process_request(request)
        return {"result": result}
    except Exception as e:
        logger.error(f"Error in new endpoint: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
```

2. **Add request/response models**:
```python
class NewRequest(BaseModel):
    field1: str
    field2: int

class NewResponse(BaseModel):
    result: str
```

### Adding Frontend Components

1. **Create the component** (`frontend/src/components/NewComponent.tsx`):
```tsx
import React from 'react';

interface NewComponentProps {
  prop1: string;
  prop2: number;
}

export const NewComponent: React.FC<NewComponentProps> = ({ prop1, prop2 }) => {
  return (
    <div>
      {/* Component implementation */}
    </div>
  );
};
```

2. **Add to the main page** if needed:
```tsx
import { NewComponent } from '@/components/NewComponent';

// In your JSX
<NewComponent prop1="value" prop2={42} />
```

## 🎨 Styling Guidelines

### Frontend Styling
- Use Tailwind CSS for styling
- Follow the existing color scheme and design patterns
- Use responsive design principles
- Implement proper accessibility (WCAG guidelines)

### Component Structure
```tsx
// Good component structure
export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState<Type>(initialValue);
  
  // Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div className="container mx-auto p-4">
      {/* Component content */}
    </div>
  );
};
```

## 📝 Code Standards

### Python Code Standards
- Follow PEP 8
- Use type hints
- Write docstrings for functions and classes
- Use meaningful variable names
- Handle exceptions appropriately

```python
def process_travel_query(query: str, user_id: Optional[str] = None) -> TravelPlan:
    """Process a travel query and return a travel plan.
    
    Args:
        query: The travel query string
        user_id: Optional user identifier
        
    Returns:
        TravelPlan object with generated itinerary
        
    Raises:
        ValidationError: If query is invalid
        APIError: If external API call fails
    """
    # Implementation
```

### TypeScript Code Standards
- Use strict TypeScript configuration
- Define interfaces for all props and state
- Use meaningful component and variable names
- Handle loading and error states

```tsx
interface TravelPlannerProps {
  initialQuery?: string;
  onPlanGenerated?: (plan: TravelPlan) => void;
}

export const TravelPlanner: React.FC<TravelPlannerProps> = ({
  initialQuery = '',
  onPlanGenerated
}) => {
  // Implementation
};
```

## 🔍 Debugging

### Backend Debugging
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG

# Run with debugger
python -m pdb main.py

# Check logs
tail -f logger/logs/system.log
```

### Frontend Debugging
```bash
# Development mode with hot reload
npm run dev

# Build and check for errors
npm run build

# Check bundle size
npm run analyze
```

### API Debugging
```bash
# Check API endpoints
curl -X GET http://localhost:8000/health

# Check with verbose output
curl -v -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "test"}'
```

## 🚀 Deployment

### Development Deployment
```bash
# Backend
python -m uvicorn main:app --reload --port 8000

# Frontend
cd frontend && npm run dev
```

### Production Deployment
```bash
# Backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# Frontend
cd frontend && npm run build
# Deploy dist/ folder to static hosting
```

## 📊 Performance Optimization

### Backend Performance
- Use async/await for I/O operations
- Implement proper caching
- Optimize database queries
- Use connection pooling

### Frontend Performance
- Implement code splitting
- Use React.memo for expensive components
- Optimize bundle size
- Implement lazy loading

## 🔒 Security Considerations

### API Security
- Validate all inputs
- Use environment variables for secrets
- Implement rate limiting
- Add authentication/authorization

### Frontend Security
- Sanitize user inputs
- Use HTTPS in production
- Implement Content Security Policy
- Validate API responses

## 📈 Monitoring and Logging

### Backend Monitoring
```python
# Add monitoring to endpoints
@app.middleware("http")
async def monitor_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Request processed in {process_time:.3f}s")
    return response
```

### Log Analysis
```bash
# View logs
python log_viewer.py --all

# Monitor errors
python log_viewer.py --errors --hours 24
```

## 🤝 Contributing

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Update documentation
6. Submit a pull request

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or documented)
- [ ] Performance impact considered

## 📚 Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [LangChain Documentation](https://langchain.readthedocs.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) - API testing
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

---

Happy coding! 🚀
