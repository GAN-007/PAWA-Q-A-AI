from fastapi import APIRouter, HTTPException, Header, status
from schemas import Question, Answer
from services.llm import get_llm_response
from utils.validators import validate_question
import time
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/ask", response_model=Answer, status_code=status.HTTP_200_OK)
async def ask_question(
    question: Question,
    user_agent: str = Header(default=None, alias="User-Agent")
):
    start_time = time.time()
    try:
        logger.info(f"Received question: {question.text} from User-Agent: {user_agent}")
        validate_question(question.text)
        answer_text = get_llm_response(question.text)
        if not answer_text.strip():
            raise ValueError("LLM returned an empty response")
        response_time = time.time() - start_time
        logger.info(f"Processed question in {response_time:.2f} seconds")
        return {"answer": answer_text, "response_time": response_time}
    except ValueError as ve:
        logger.warning(f"Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail={"error": "Invalid input", "message": str(ve)})
    except Exception as e:
        logger.error(f"Internal server error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Server error", "message": f"Failed to process request: {str(e)}"}
        )