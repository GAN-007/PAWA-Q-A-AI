from pydantic import BaseModel, Field, validator
import logging

logger = logging.getLogger(__name__)

class Question(BaseModel):
    text: str = Field(..., min_length=10, max_length=500, description="The user's question")

    @validator("text")
    def strip_text(cls, value):
        return value.strip()

class Answer(BaseModel):
    answer: str = Field(..., description="The LLM-generated answer")
    response_time: float = Field(..., ge=0, description="Time taken to process the request in seconds")