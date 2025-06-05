from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router
import uvicorn

app = FastAPI(
    title="HeirAid API",
    description="API documentation for HeirAid backend. Use the Swagger UI to explore endpoints.",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc" # ReDoc UI
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)