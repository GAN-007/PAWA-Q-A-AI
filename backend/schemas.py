from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class QueryRequest(BaseModel):
    """
    Schema for incoming query requests.
    """
    query: str
    model: str = "gpt-3.5-turbo"
    
class QueryResponse(BaseModel):
    """
    Schema for query response.
    """
    question: str
    answer: str
    model: str
    timestamp: datetime
    
class ErrorResponse(BaseModel):
    """
    Schema for error responses.
    """
    error: str
    status_code: int
    
class HistoryResponse(BaseModel):
    """
    Schema for history response.
    """
    history: List[QueryResponse]