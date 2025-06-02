from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from routers import qna
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PAWA Q&A AI",
    description="An advanced interactive Q&A system with LLM integration, optimized for travel queries.",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Enable CORS with detailed configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["X-Process-Time"]
)

# Include the Q&A router
app.include_router(qna.router, prefix="/api/v1", tags=["Q&A"])

# Health check endpoint
@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    logger.info("Health check requested")
    return {"status": "healthy", "version": app.version}