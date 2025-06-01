from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from services.llm import process_query
from utils.validators import validate_query
from datetime import datetime

router = APIRouter(
    prefix="/qna",
    tags=["Q&A"]
)

class QueryRequest(BaseModel):
    query: str
    model: str = "gpt-3.5-turbo"
    
class QueryResponse(BaseModel):
    question: str
    answer: str
    model: str
    timestamp: datetime
    
class ErrorResponse(BaseModel):
    error: str
    status_code: int
    
class HistoryItem(BaseModel):
    question: str
    answer: str
    model: str
    timestamp: datetime
    
class HistoryResponse(BaseModel):
    history: List[HistoryItem]

@router.post("/ask", response_model=QueryResponse)
async def ask_question(query_request: QueryRequest):
    """
    Endpoint to process a user question and return an AI-generated response.
    Validates the input query before processing.
    """
    try:
        # Validate input
        if not validate_query(query_request.query):
            raise HTTPException(status_code=400, detail="Invalid query format")
            
        # Process query with LLM
        response = await process_query(query_request.query, query_request.model)
        
        return {
            "question": query_request.query,
            "answer": response,
            "model": query_request.model,
            "timestamp": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@router.get("/history", response_model=HistoryResponse)
async def get_history():
    """
    Endpoint to retrieve chat history (in production, this would retrieve from a database).
    Currently returns empty history.
    """
    # In a real implementation, this would retrieve from a database
    return {"history": []}