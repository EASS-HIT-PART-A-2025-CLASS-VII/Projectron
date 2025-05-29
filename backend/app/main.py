from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_router import api_router
from app.core.config import get_settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.services.ai.sequence_diagram_generator import get_global_generator
from app.utils.mongo_encoder import MongoJSONEncoder
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting up services...")
    
    # Connect to MongoDB
    connect_to_mongo()
    print("✅ MongoDB connected")
    
    # Initialize global diagram generator
    try:
        global_generator = get_global_generator()
        await global_generator.get_generator()  # This will initialize it
        print("✅ Global SequenceDiagramGenerator initialized and connected")
    except Exception as e:
        print(f"⚠️ Failed to initialize global diagram generator: {e}")
        print("   Diagram generation may be slower or fail")
    
    print("🎉 Startup complete!")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down services...")
    
    # Clean up global diagram generator
    try:
        global_generator = get_global_generator()
        await global_generator.cleanup()
        print("✅ Global SequenceDiagramGenerator cleaned up")
    except Exception as e:
        print(f"⚠️ Error during diagram generator cleanup: {e}")
    
    # Close MongoDB connection
    close_mongo_connection()
    print("✅ MongoDB connection closed")
    
    print("👋 Shutdown complete!")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI Project Planner API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
    servers=[
        {"url": "https://astonishing-joy-production.up.railway.app", "description": "Production server"},
        {"url": "http://localhost:8000", "description": "Development server"}
    ] if settings.ENVIRONMENT == "production" else [{"url": "http://localhost:8000"}]
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.json_encoders = MongoJSONEncoder

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    """Health check endpoint for Railway"""
    try:
        return {
            "status": "healthy",
            "service": "projectron-api",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
    
@app.get("/")
async def root():
    return {"message": "Welcome to AI Project Planner API"}

