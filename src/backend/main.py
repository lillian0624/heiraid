import openai
from fastapi import FastAPI, Request
from dotenv import load_dotenv
load_dotenv()  # Load environment variables at the very top

import os
print(os.environ)
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Debug: print endpoint
endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
print("Endpoint:", endpoint)

from .api import chat, search

app = FastAPI(
    title="HeirAid AI Bot Backend",
    description="API for AI Legal Assistant, Neighborhood Risk Mapping, and Interactive UI.",
    version="0.1.0"
)

# Configure CORS (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files if needed
# app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "HeirAid AI Bot Backend is running!"}

# Include API routers
app.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
app.include_router(search.router, prefix="/search", tags=["Cognitive Search"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

@app.post("/chat/completions")
async def chat_completions(request: Request):
    body = await request.json()
    print("Request body:", body)  # Debug: print the request body

    # Extract messages from the request body
    messages = body.get("messages")
    print("Messages:", messages)  # Debug: print the messages

    # Call the OpenAI API
    response = openai.ChatCompletion.create(
        model="o4-mini",
        messages=messages,
        api_key=os.getenv("OPENAI_API_KEY")
    )

    # Debug: print the entire response from OpenAI
    print("Response:", response)

    # Extract and return the assistant's reply
    print(response.choices[0].message.content)
    return {"answer": response.choices[0].message.content}