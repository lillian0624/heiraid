from fastapi import APIRouter
from pydantic import BaseModel
from .agent import get_outreach_suggestions, handle_agent_request, analyze_document, get_property_map

router = APIRouter()

class QueryRequest(BaseModel):
    query: str
    language: str = "en"

class DocumentRequest(BaseModel):
    document_url: str

@router.post("/api/query")
async def query_agent(request: QueryRequest):
    try:
        response = await handle_agent_request(request.query, request.language)
        return {"response": response}
    except Exception as e:
        return {"error": str(e)}

@router.post("/api/analyze-document")
async def analyze_doc(request: DocumentRequest):
    try:
        result = await analyze_document(request.document_url)
        return result
    except Exception as e:
        return {"error": str(e)}

@router.get("/api/property-map")
async def property_map():
    try:
        map_data = await get_property_map()
        return map_data
    except Exception as e:
        return {"error": str(e)}
    
@router.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "HeirAid API is running smoothly."}

@router.get("/api/outreach-suggestions")
async def outreach_suggestions():
    try:
        # Placeholder for actual outreach suggestions logic
        suggestions = await get_outreach_suggestions()
        if not suggestions:
            suggestions = ["No suggestions available at this time."]
        elif isinstance(suggestions, str):
            suggestions = [suggestions]
        elif not isinstance(suggestions, list):
            suggestions = ["Unexpected response format."]
        elif len(suggestions) > 5:
            suggestions = suggestions[:5]
        elif len(suggestions) < 5:
            suggestions += ["No additional suggestions available."] * (5 - len(suggestions))
        return {"suggestions": suggestions}
    except Exception as e:
        return {"error": str(e)}

@router.get("/")
async def root():
    return {"message": "Welcome to HeirAid API!"}

