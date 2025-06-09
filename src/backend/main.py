# src/backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from .api import chat, search 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.staticfiles import StaticFiles

# Load environment variables
load_dotenv()

# Initialize FastAPI app add swagger docs
app = FastAPI(
    title="HeirAid AI Bot Backend",
    description="API for AI Legal Assistant, Neighborhood Risk Mapping, and Interactive UI.",
    version="0.1.0"
)

# Add Swagger docs
app.include_router(
    get_swagger_ui_html,
    path="/docs",
    tags=["Swagger Docs"],
    title="HeirAid AI Bot Backend API",
    description="API for AI Legal Assistant, Neighborhood Risk Mapping, and Interactive UI.",
)

# Configure CORS (adjust origins, methods, headers for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development. CHANGE THIS FOR PRODUCTION!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "HeirAid AI Bot Backend is running!"}

# Include API routers
app.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
app.include_router(search.router, prefix="/search", tags=["Cognitive Search"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)