import openai
import os
from dotenv import load_dotenv
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, max=10))
async def process_query(query: str, model: str = "gpt-3.5-turbo") -> str:
    """
    Process a user query with the LLM, with retry handling for reliability.
    Crafts an effective prompt for the LLM to elicit well-structured responses.
    """
    try:
        # Create effective prompt engineering
        system_prompt = """You are a highly knowledgeable assistant that provides well-structured, 
        detailed answers to user queries. Format your responses with clear sections, bullet points, 
        and relevant details while maintaining readability."""
        
        response = await openai.ChatCompletion.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query}
            ],
            temperature=0.7,
            max_tokens=1000,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        return response.choices[0].message.content.strip()
        
    except openai.error.OpenAIError as e:
        raise Exception(f"LLM Service Error: {str(e)}")
    except Exception as e:
        raise Exception(f"Processing Error: {str(e)}")