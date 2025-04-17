from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_router import api_router
from app.core.config import get_settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.utils.mongo_encoder import MongoJSONEncoder

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI Project Planner API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
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

# Events for MongoDB connection
@app.on_event("startup")
async def startup_db_client():
    connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "Welcome to AI Project Planner API"}