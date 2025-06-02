import asyncio
import subprocess
import os
import json
from typing import List, Dict, Any, Optional

class OllamaModelInfo:
    def __init__(self, name: str, size: str, modified: str):
        self.name = name
        self.size = size
        self.modified = modified

class OllamaManager:
    def __init__(self):
        self.ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        
    async def check_connection(self) -> bool:
        """Check if Ollama service is running"""
        try:
            process = await asyncio.create_subprocess_exec(
                'ollama', 'list',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            return process.returncode == 0
        except:
            return False

    async def list_models(self) -> List[OllamaModelInfo]:
        """List all installed Ollama models"""
        try:
            result = subprocess.run(
                ["ollama", "list"], 
                capture_output=True, 
                text=True, 
                check=True
            )
            
            lines = result.stdout.strip().split('\n')[1:]  # Skip header
            models = []
            
            for line in lines:
                parts = line.split()
                if len(parts) >= 4:
                    name = parts[0]
                    size = parts[2]
                    modified = ' '.join(parts[3:])
                    models.append(OllamaModelInfo(name, size, modified))
                    
            return models
        except subprocess.CalledProcessError as e:
            raise Exception(f"Error listing Ollama models: {e.stderr}")

    async def install_model(self, model_name: str) -> Dict[str, Any]:
        """Install a new Ollama model"""
        try:
            process = await asyncio.create_subprocess_exec(
                'ollama', 'pull', model_name,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                raise Exception(f"Failed to install model: {stderr.decode()}")
                
            return {
                "model": model_name,
                "status": "installed",
                "output": stdout.decode()
            }
        except Exception as e:
            raise Exception(f"Error installing model: {str(e)}")

    async def remove_model(self, model_name: str) -> Dict[str, Any]:
        """Remove an Ollama model"""
        try:
            process = await asyncio.create_subprocess_exec(
                'ollama', 'rm', model_name,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                raise Exception(f"Failed to remove model: {stderr.decode()}")
                
            return {
                "model": model_name,
                "status": "removed",
                "output": stdout.decode()
            }
        except Exception as e:
            raise Exception(f"Error removing model: {str(e)}")

    async def generate_response(
        self, 
        model_name: str, 
        prompt: str,
        temperature: float = 0.7,
        stream: bool = False
    ) -> Dict[str, Any]:
        """Generate response from Ollama model"""
        if not await self.check_connection():
            raise Exception("Ollama service not available")
            
        try:
            # Create request payload
            payload = {
                "model": model_name,
                "prompt": prompt,
                "temperature": temperature,
                "stream": stream
            }
            
            # Use Ollama API directly for streaming support
            process = await asyncio.create_subprocess_exec(
                'ollama', 'run', model_name, prompt,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                raise Exception(f"Model error: {stderr.decode()}")
                
            return {
                "model": model_name,
                "response": stdout.decode(),
                "status": "success"
            }
        except Exception as e:
            raise Exception(f"Error generating response: {str(e)}")