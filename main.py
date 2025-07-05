from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agent.agentic_workflow import GraphBuilder
from utils.save_to_document import save_document
from starlette.responses import JSONResponse
import os
import datetime
from dotenv import load_dotenv
from pydantic import BaseModel
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # set specific origins in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class QueryRequest(BaseModel):
    question: str

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Travel Planner",
        "timestamp": datetime.datetime.now().isoformat(),
        "version": "1.0.0"
    }

# API information endpoint
@app.get("/api/info")
async def api_info():
    return {
        "name": "AI Travel Planner API",
        "version": "1.0.0",
        "description": "AI-powered travel planning service",
        "endpoints": {
            "/health": "Health check",
            "/api/info": "API information",
            "/query": "Generate travel plans"
        },
        "frontend_url": "http://localhost:8080"
    }

@app.post("/query")
async def query_travel_agent(query: QueryRequest):
    try:
        print(f"Received query: {query.question}")
        
        # Build and execute the AI graph
        graph = GraphBuilder(model_provider="groq")
        react_app = graph()

        # Generate graph visualization
        png_graph = react_app.get_graph().draw_mermaid_png()
        with open("my_graph.png", "wb") as f:
            f.write(png_graph)
        print(f"Graph saved as 'my_graph.png' in {os.getcwd()}")

        # Process the query
        messages = {"messages": [query.question]}
        output = react_app.invoke(messages)

        # Extract the response
        if isinstance(output, dict) and "messages" in output:
            final_output = output["messages"][-1].content
        else:
            final_output = str(output)
        
        # Return standardized response
        return {
            "answer": final_output,
            "timestamp": datetime.datetime.now().isoformat(),
            "status": "success",
            "query": query.question
        }
        
    except Exception as e:
        error_message = str(e)
        print(f"Error processing query: {error_message}")
        
        return JSONResponse(
            status_code=500, 
            content={
                "error": error_message,
                "timestamp": datetime.datetime.now().isoformat(),
                "status": "error",
                "query": query.question if 'query' in locals() else None
            }
        )