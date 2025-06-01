from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.qna import router as qna_router
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="PAWA Q&A AI",
    description="Interactive Q&A system with LLM integration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(qna_router, prefix="/api")

@app.get("/health")
async def health_check():
    """Health check endpoint to verify if the service is running"""
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)