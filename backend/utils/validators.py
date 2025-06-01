import re
from datetime import datetime

def validate_query(query: str) -> bool:
    """
    Validate user query with multiple checks including minimum length
    and valid characters to prevent injection attacks.
    """
    if not query or not isinstance(query, str):
        return False
        
    # Check for minimum length
    if len(query.strip()) < 3:
        return False
        
    # Check for valid characters (prevent injection attacks)
    if re.search(r'[^\w\s.,!?\-@()/]', query):
        return False
        
    return True

def validate_model_name(model_name: str) -> bool:
    """
    Validate that the requested model is in the list of allowed models.
    """
    allowed_models = [
        "gpt-3.5-turbo",
        "gpt-4",
        "claude-2",
        "gemini-pro"
    ]
    
    return model_name in allowed_models

def validate_timestamp(timestamp: str) -> bool:
    """
    Validate that a timestamp is in ISO format.
    """
    try:
        datetime.fromisoformat(timestamp)
        return True
    except ValueError:
        return False