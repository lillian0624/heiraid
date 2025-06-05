from fastapi import APIRouter
from pydantic import BaseModel
from agent import handle_agent_request, analyze_document, get_property_map

router = APIRouter()

class QueryRequest(BaseModel):
    query: str
    language: str = "en"

class DocumentRequest(BaseModel):
    document_url: str

@router.post("/query")
async def query_agent(request: QueryRequest):
    try:
        response = await handle_agent_request(request.query, request.language)
        return {"response": response}
    except Exception as e:
        return {"error": str(e)}

@router.post("/analyze-document")
async def analyze_doc(request: DocumentRequest):
    try:
        result = await analyze_document(request.document_url)
        return result
    except Exception as e:
        return {"error": str(e)}

@router.get("/property-map")
async def property_map():
    try:
        map_data = await get_property_map()
        return map_data
    except Exception as e:
        return {"error": str(e)}