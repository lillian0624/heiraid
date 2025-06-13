# src/backend/api/chat.py
from fastapi import APIRouter
from pydantic import BaseModel
from ..services.cognitive_search_service import CognitiveSearchService
from ..services.openai_service import OpenAIService
from dotenv import load_dotenv
load_dotenv()

import os
from azure.search.documents import SearchClient

class CognitiveSearchService:
    def __init__(self, endpoint=None, index_name=None, credential=None):
        # Use provided values or fall back to environment variables
        self.endpoint = endpoint or os.getenv("AZURE_SEARCH_ENDPOINT")
        self.index_name = index_name or os.getenv("AZURE_SEARCH_INDEX")
        self.credential = credential or os.getenv("AZURE_SEARCH_KEY")
        print("DEBUG: endpoint =", self.endpoint)
        self.search_client = SearchClient(
            endpoint=self.endpoint,
            index_name=self.index_name,
            credential=self.credential
        )

router = APIRouter()

# Initialize services
cognitive_search_service = CognitiveSearchService(
    endpoint=os.environ.get("AZURE_SEARCH_ENDPOINT"),
    index_name=os.environ.get("AZURE_SEARCH_INDEX"),
    credential=os.environ.get("AZURE_SEARCH_KEY")
)
openai_service = OpenAIService(
    openai_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
    openai_api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
    deployment_name=os.environ.get("AZURE_OPENAI_CHAT_DEPLOYMENT_NAME")
)

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat_with_ai(request_body: ChatRequest):
    user_message = request_body.message

    # 1. Search for relevant documents in Cognitive Search
    relevant_docs = cognitive_search_service.search_documents(user_message, top=5)

    context_str = "\n".join([doc.get('content', '') for doc in relevant_docs])
    if not context_str:
        context_str = "No specific legal documents found. Provide general legal information if applicable."

    # 2. Prepare prompt for OpenAI (RAG pattern)
    messages = [
        {"role": "system", "content": "You are HeirAid, an AI Legal Assistant. Answer questions based on the provided legal documents. If the answer is not in the documents, state that. If you are asked about sensitive private data (e.g., specific individual's tax bills, forms), you must mention that access is restricted and you cannot provide details without explicit access controls for the specific case. Ensure you respect user privacy and RBAC."},
        {"role": "user", "content": f"Context: {context_str}\n\nQuestion: {user_message}"}
    ]

    # 3. Get response from Azure OpenAI
    ai_response = openai_service.get_chat_completion(messages)

    return {"response": ai_response, "source_documents": relevant_docs}