from fastapi import APIRouter

from app.api.endpoints import auth, plan, projects, diagrams

api_router = APIRouter()

# Auth routes
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Project routes
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])

# Plan routes
api_router.include_router(plan.router, prefix="/plan", tags=["plan"])

# Diagram routes
api_router.include_router(diagrams.router, prefix="/diagrams", tags=["diagrams"])
