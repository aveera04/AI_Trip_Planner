from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from agent.agentic_workflow import GraphBuilder
from starlette.responses import JSONResponse
import os
import datetime
import time
from dotenv import load_dotenv
from pydantic import BaseModel
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

logger.info("Starting AI Travel Planner System")

app = FastAPI(
    title="AI Travel Planner API",
    description="AI-powered travel planning service with advanced capabilities",
    version="1.0.0"
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log the request
    logger.info(f"Request: {request.method} {request.url.path} from {request.client.host if request.client else 'unknown'}")
    
    response = await call_next(request)
    
    # Log response time
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
    
    return response

# CORS configuration - allow multiple origins for development and production
allowed_origins = [
    "http://localhost:3000", 
    "http://localhost:8080", 
    "http://localhost:8081",
    "https://mytraveladvisor2025.vercel.app",  # Production Vercel domain
    "https://ai-trip-planner-f17p.onrender.com",  # Allow backend self-calls
]

# Add environment variable for additional origins
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

# Log the allowed origins for debugging
logger.info(f"CORS allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)
class QueryRequest(BaseModel):
    question: str

# Health check endpoint
@app.get("/health")
async def health_check():
    logger.info("Health check requested")
    return {
        "status": "healthy",
        "service": "AI Travel Planner",
        "timestamp": datetime.datetime.now().isoformat(),
        "version": "1.0.0"
    }

# API information endpoint
@app.get("/api/info")
async def api_info():
    logger.info("API info requested")
    return {
        "name": "AI Travel Planner API",
        "version": "1.0.0",
        "description": "AI-powered travel planning service",
        "endpoints": {
            "/health": "Health check",
            "/api/info": "API information",
            "/query": "Generate travel plans"
        },
        "frontend_url": os.getenv("FRONTEND_URL", "http://localhost:8081")
    }

# Debug endpoint to check CORS configuration
@app.get("/debug/cors")
async def debug_cors():
    logger.info("CORS debug requested")
    return {
        "allowed_origins": allowed_origins,
        "frontend_url_env": os.getenv("FRONTEND_URL"),
        "cors_configured": True,
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.post("/query")
async def query_travel_agent(query: QueryRequest):
    start_time = time.time()
    
    try:
        logger.info(f"Received query: {query.question}")
        
        # Build and execute the AI graph
        logger.debug("Building AI graph")
        graph = GraphBuilder(model_provider="groq")
        react_app = graph()

        # Generate graph visualization (optional - can be disabled in production)
        if os.getenv("GENERATE_GRAPH_VISUALIZATION", "false").lower() == "true":
            logger.debug("Generating graph visualization")
            png_graph = react_app.get_graph().draw_mermaid_png()
            with open("my_graph.png", "wb") as f:
                f.write(png_graph)
            logger.debug(f"Graph saved as 'my_graph.png' in {os.getcwd()}")

        # Process the query
        logger.debug("Processing query with AI agent")
        messages = {"messages": [query.question]}
        output = react_app.invoke(messages)

        # Extract the response
        if isinstance(output, dict) and "messages" in output:
            final_output = output["messages"][-1].content
        else:
            final_output = str(output)
        
        processing_time = time.time() - start_time
        logger.info(f"Query processed successfully in {processing_time:.2f}s")
        
        # Return standardized response
        return {
            "answer": final_output,
            "timestamp": datetime.datetime.now().isoformat(),
            "status": "success",
            "query": query.question,
            "processing_time": processing_time
        }
        
    except Exception as e:
        error_message = str(e)
        processing_time = time.time() - start_time
        
        logger.error(f"Error processing query: {error_message}", exc_info=True)
        
        return JSONResponse(
            status_code=500, 
            content={
                "error": error_message,
                "timestamp": datetime.datetime.now().isoformat(),
                "status": "error",
                "query": query.question if 'query' in locals() else None,
                "processing_time": processing_time
            }
        )

if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting AI Travel Planner server")
    
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000)
    except KeyboardInterrupt:
        logger.info("Server shutdown requested")
    except Exception as e:
        logger.error(f"Server error: {str(e)}", exc_info=True)
    finally:
        logger.info("Server shutting down")