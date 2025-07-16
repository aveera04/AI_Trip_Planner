# 🚀 Deployment Guide

This guide covers different deployment options for the AI Travel Planner application.

## 🏗️ Deployment Options

### 1. Local Development
- **Use Case**: Development and testing
- **Requirements**: Python 3.10+, Node.js 18+
- **Setup**: See [SETUP.md](SETUP.md)

### 2. Docker Deployment
- **Use Case**: Containerized deployment
- **Requirements**: Docker, Docker Compose
- **Benefits**: Environment consistency, easy scaling

### 3. Cloud Deployment
- **Use Case**: Production deployment
- **Platforms**: AWS, Google Cloud, Azure, Heroku
- **Benefits**: Scalability, reliability, managed services

## 🐳 Docker Deployment

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - GROQ_API_KEY=${GROQ_API_KEY}
      - WEATHER_API_KEY=${WEATHER_API_KEY}
      - GOOGLE_PLACES_API_KEY=${GOOGLE_PLACES_API_KEY}
      - TAVILY_API_KEY=${TAVILY_API_KEY}
    volumes:
      - ./logger/logs:/app/logger/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_BASE_URL=http://backend:8000
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

### Running with Docker
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Using AWS ECS (Elastic Container Service)
1. **Push to ECR**:
```bash
# Build and tag
docker build -t ai-travel-planner-backend .
docker tag ai-travel-planner-backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ai-travel-planner-backend:latest

# Push to ECR
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ai-travel-planner-backend:latest
```

2. **ECS Task Definition**:
```json
{
  "family": "ai-travel-planner-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "taskRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskRole",
  "executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "ai-travel-planner-backend",
      "image": "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ai-travel-planner-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "GROQ_API_KEY",
          "value": "${GROQ_API_KEY}"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ai-travel-planner-backend",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Using AWS Lambda + API Gateway
```python
# lambda_handler.py
from mangum import Mangum
from main import app

handler = Mangum(app, lifespan="off")
```

### Google Cloud Platform

#### Using Cloud Run
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/${PROJECT_ID}/ai-travel-planner-backend

# Deploy to Cloud Run
gcloud run deploy ai-travel-planner-backend \
    --image gcr.io/${PROJECT_ID}/ai-travel-planner-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars="GROQ_API_KEY=${GROQ_API_KEY}"
```

### Heroku Deployment

#### Backend (Heroku)
1. **Create Heroku app**:
```bash
heroku create ai-travel-planner-backend
```

2. **Add buildpack**:
```bash
heroku buildpacks:set heroku/python
```

3. **Set environment variables**:
```bash
heroku config:set GROQ_API_KEY=your_key_here
heroku config:set WEATHER_API_KEY=your_key_here
```

4. **Deploy**:
```bash
git push heroku main
```

#### Frontend (Netlify/Vercel)
1. **Build command**: `npm run build`
2. **Output directory**: `dist`
3. **Environment variables**: Set `VITE_API_BASE_URL`

## 🔒 Production Configuration

### Environment Variables
```bash
# Production backend
export ENVIRONMENT=production
export DEBUG=false
export LOG_LEVEL=INFO
export CORS_ORIGINS=https://yourdomain.com
export DATABASE_URL=postgresql://user:pass@host/db

# SSL/TLS
export SSL_CERT_PATH=/path/to/cert.pem
export SSL_KEY_PATH=/path/to/key.pem
```

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Set proper CORS origins
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Add authentication/authorization
- [ ] Use secure headers
- [ ] Validate all inputs
- [ ] Regular security updates

### Performance Optimization
```python
# Production settings
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# Rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/query")
@limiter.limit("10/minute")
async def query_travel_agent(request: Request, query: QueryRequest):
    # Implementation
```

## 📊 Monitoring and Logging

### Application Monitoring
```python
# Add monitoring
import time
from starlette.middleware.base import BaseHTTPMiddleware

class MonitoringMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log metrics
        logger.info(f"Request processed in {process_time:.3f}s")
        
        return response

app.add_middleware(MonitoringMiddleware)
```

### Health Checks
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }
```

### Log Aggregation
- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Cloud Solutions**: AWS CloudWatch, Google Cloud Logging
- **Third-party**: Datadog, New Relic

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deployment commands
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database connection pooling
- Redis for caching
- Queue system for background tasks

### Vertical Scaling
- CPU and memory optimization
- Database query optimization
- Caching strategies
- CDN for static assets

## 🛠️ Maintenance

### Regular Tasks
- [ ] Update dependencies
- [ ] Review and rotate API keys
- [ ] Monitor logs for errors
- [ ] Backup critical data
- [ ] Performance monitoring
- [ ] Security updates

### Monitoring Checklist
- [ ] Application uptime
- [ ] Response times
- [ ] Error rates
- [ ] Database performance
- [ ] API rate limits
- [ ] SSL certificate expiry

---

Happy deploying! 🚀
