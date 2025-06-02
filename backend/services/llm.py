from openai import OpenAI, OpenAIError
from dotenv import load_dotenv
import os
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

load_dotenv()
logger = logging.getLogger(__name__)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    retry=retry_if_exception_type(OpenAIError)
)
def get_llm_response(question: str) -> str:
    if not os.getenv("OPENAI_API_KEY"):
        logger.error("OpenAI API key not found in environment variables")
        raise ValueError("API key configuration missing")
    
    try:
        logger.info(f"Sending question to LLM: {question}")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert travel assistant. Provide detailed, accurate, and well-structured answers "
                        "using markdown formatting with headings (##), subheadings (###), and bullet points (-). "
                        "Focus on clarity and completeness."
                    )
                },
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=1500,
            timeout=30
        )
        answer = response.choices[0].message.content.strip()
        logger.info("LLM response received successfully")
        return answer
    except OpenAIError as oe:
        logger.error(f"OpenAI API error: {str(oe)}")
        raise Exception(f"Failed to communicate with LLM: {str(oe)}")
    except Exception as e:
        logger.error(f"Unexpected error in LLM service: {str(e)}")
        raise Exception(f"LLM processing error: {str(e)}")