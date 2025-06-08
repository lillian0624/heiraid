# src/backend/api/chat.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ..services.cognitive_search_service import CognitiveSearchService
from ..services.openai_service import OpenAIService
from ..services.auth_service import get_current_user_context # For RBAC
import os

router = APIRouter()

# Initialize services (could be done via FastAPI dependency injection)
cognitive_search_service = CognitiveSearchService(
    endpoint=os.environ.get("COGNITIVE_SEARCH_ENDPOINT"),
    index_name=os.environ.get("COGNITIVE_SEARCH_INDEX_NAME")
)
openai_service = OpenAIService(
    openai_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
    openai_api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
    deployment_name=os.environ.get("AZURE_OPENAI_CHAT_DEPLOYMENT_NAME")
)

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat_with_ai(
    request_body: ChatRequest,
    user_context: dict = Depends(get_current_user_context) # Get authenticated user context
):
    user_message = request_body.message

    # 1. Search for relevant documents in Cognitive Search with RBAC filter
    relevant_docs = cognitive_search_service.search_documents(user_message, user_context, top=5)

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