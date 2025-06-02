import re
import logging

logger = logging.getLogger(__name__)

def validate_question(question: str) -> None:
    """Validate the question input with detailed checks."""
    if not question or not question.strip():
        logger.warning("Empty question received")
        raise ValueError("Question cannot be empty or whitespace only")
    
    question_length = len(question.strip())
    if question_length < 10:
        logger.warning(f"Question too short: {question_length} characters")
        raise ValueError(f"Question must be at least 10 characters long, got {question_length}")
    
    if question_length > 500:
        logger.warning(f"Question too long: {question_length} characters")
        raise ValueError(f"Question must not exceed 500 characters, got {question_length}")
    
    # Check for excessive repetition
    if re.search(r"(.)\1{5,}", question):
        logger.warning("Question contains excessive character repetition")
        raise ValueError("Question contains too much repetition")
    
    # Basic profanity filter (expandable)
    profanity = ["damn", "hell", "crap"]
    if any(word in question.lower() for word in profanity):
        logger.warning("Question contains inappropriate language")
        raise ValueError("Question contains inappropriate language")