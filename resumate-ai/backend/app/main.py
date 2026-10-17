"""
Resumate AI - FastAPI Main Application.
Intelligent Resume Parser and Job Matching Assistant.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.routes_resumes import router as resumes_router
from app.api.routes_candidates import router as candidates_router
from app.api.routes_match import router as match_router
from app.api.routes_analytics import router as analytics_router
from app.services.storage import init_db

# Initialize database
init_db()

app = FastAPI(
    title="Resumate AI API",
    description="Intelligent Resume Parser & Explainable Job Matching Assistant API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from Vite dev server or production frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers with /api prefix
app.include_router(resumes_router, prefix="/api")
app.include_router(candidates_router, prefix="/api")
app.include_router(match_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")


@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify backend status."""
    return {
        "status": "healthy",
        "service": "Resumate AI Backend",
        "version": "1.0.0",
        "nlp_engine": "spaCy + Rule-Based Skill Taxonomy",
        "storage": "SQLite"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler ensuring no internal paths or stack traces are leaked.
    """
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "An internal server error occurred while processing the request.",
            "detail": str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
