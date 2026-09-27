import os
from dotenv import load_dotenv

class Config:
    def __init__(self):
        load_dotenv()
        
        # Ollama configuration
        self.OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        
        # Cloud API keys
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
        
        # Security
        self.JWT_SECRET = os.getenv("JWT_SECRET", "neuralnexus_secret_key")
        
        # Database
        self.MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        
        # Optional Laya/Jev-compatible System-One decision plane.
        self.SYSTEM_ONE_MODE = os.getenv("PAWA_SYSTEM_ONE_MODE", "off")
        self.SYSTEM_ONE_BASE_URL = os.getenv("PAWA_SYSTEM_ONE_BASE_URL", "")
        self.SYSTEM_ONE_API_KEY = os.getenv("PAWA_SYSTEM_ONE_API_KEY", "")
        self.SYSTEM_ONE_TIMEOUT_SECONDS = float(os.getenv("PAWA_SYSTEM_ONE_TIMEOUT_SECONDS", "1.5"))

        # Application
        self.DEBUG = os.getenv("DEBUG", "True").lower() == "true"
        self.PORT = int(os.getenv("PORT", "8000"))

config = Config()