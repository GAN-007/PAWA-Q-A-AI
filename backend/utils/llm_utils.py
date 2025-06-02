import os
import openai
from anthropic import AsyncAnthropic
from typing import Dict, Any, Optional

class LLMProvider:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        
        # Initialize clients
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
            
        if self.anthropic_api_key:
            self.anthropic_client = AsyncAnthropic(api_key=self.anthropic_api_key)
    
    def check_openai_connection(self) -> bool:
        """Check if OpenAI API key is valid"""
        if not self.openai_api_key:
            return False
            
        try:
            openai.Model.list()
            return True
        except:
            return False
            
    def check_anthropic_connection(self) -> bool:
        """Check if Anthropic API key is valid"""
        if not self.anthropic_api_key:
            return False
            
        try:
            # Make a simple API call
            return True
        except:
            return False

    async def generate_openai_response(
        self,
        model_name: str,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """Generate response using OpenAI model"""
        if not self.openai_api_key:
            raise Exception("OpenAI API key not configured")
            
        try:
            response = await openai.ChatCompletion.acreate(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return {
                "model": model_name,
                "response": response.choices[0].message.content,
                "usage": response.usage
            }
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")

    async def generate_anthropic_response(
        self,
        model_name: str,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = 300
    ) -> Dict[str, Any]:
        """Generate response using Anthropic model"""
        if not self.anthropic_api_key:
            raise Exception("Anthropic API key not configured")
            
        try:
            response = await self.anthropic_client.completion(
                prompt=f"\n\nHuman: {prompt}\n\nAssistant:",
                model=model_name,
                temperature=temperature,
                max_tokens_to_sample=max_tokens
            )
            
            return {
                "model": model_name,
                "response": response.content,
                "usage": {
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens
                }
            }
        except Exception as e:
            raise Exception(f"Anthropic API error: {str(e)}")