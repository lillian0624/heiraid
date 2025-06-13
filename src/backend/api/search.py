# src/backend/api/search.py

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os

# Import the services and authentication helper
from ..services.cognitive_search_service import CognitiveSearchService
from ..services.auth_service import get_current_user_context

router = APIRouter()

# --- Pydantic Models for Request and Response ---

class SearchRequest(BaseModel):
    """
    Model for the search request body.
    """
    query: str = Field(..., min_length=1, description="The search query string.")
    top: int = Field(10, ge=1, le=50, description="Number of top results to return.")
    # You could add more parameters here if your search needs to be more complex
    # e.g., filters, facets, semantic search options, etc.

class SearchResultDocument(BaseModel):
    """
    Model for a single document returned from Cognitive Search.
    Adjust these fields to match your Cognitive Search index schema's 'select' fields.
    """
    id: str
    filename: str
    summary: str
    filepath: str
    document_type: str
    legal_category: str
    # Add other fields you want to return to the frontend
    # owner_id: Optional[str] = None # Include if you want to expose this to frontend
    # case_id: Optional[str] = None # Include if you want to expose this to frontend

class SearchResponse(BaseModel):
    """
    Model for the search API response.
    """
    results: List[SearchResultDocument]
    count: int = Field(0, description="Total number of results found (after filtering, if available from search service).")
    # You might add a 'message' field for status updates or warnings


# --- Service Initialization ---
# Initialize CognitiveSearchService.
# In a larger application, you might use FastAPI's dependency injection
# for these services to manage their lifecycle better.
try:
    COGNITIVE_SEARCH_ENDPOINT = os.environ.get("AZURE_SEARCH_ENDPOINT")
    COGNITIVE_SEARCH_INDEX_NAME = os.environ.get("AZURE_SEARCH_INDEX")

    if not COGNITIVE_SEARCH_ENDPOINT or not COGNITIVE_SEARCH_INDEX_NAME:
        raise ValueError("AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_INDEX must be set in environment variables.")

    cognitive_search_service = CognitiveSearchService(
        endpoint=COGNITIVE_SEARCH_ENDPOINT,
        index_name=COGNITIVE_SEARCH_INDEX_NAME
    )
except Exception as e:
    import logging
    logging.getLogger(__name__).error(f"Failed to initialize CognitiveSearchService: {e}")
    raise Exception(f"Failed to initialize CognitiveSearchService: {e}")


# --- API Endpoint ---

@router.post("/", response_model=SearchResponse)
async def search_documents(
    request_body: SearchRequest,
    user_context: Dict[str, Any] = {} # Authenticate user and get context
):
    """
    Performs a search against Azure Cognitive Search, applying RBAC filters
    based on the authenticated user's context.
    """
    try:
        # Perform the search using the CognitiveSearchService
        # The service internally builds the RBAC filter based on user_context
        search_results = cognitive_search_service.search_documents(
            query=request_body.query,
            user_context=user_context,
            top=request_body.top
        )

        # Convert search results to the Pydantic response model
        # Note: The search_documents method in CognitiveSearchService should return
        # dictionaries that directly map to SearchResultDocument model.
        formatted_results = [SearchResultDocument(**doc) for doc in search_results]

        return SearchResponse(results=formatted_results, count=len(formatted_results))

    except HTTPException:
        # Re-raise HTTPExceptions from underlying services
        raise
    except Exception as e:
        logger.error(f"Error in search_documents endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during search: {e}"
        )