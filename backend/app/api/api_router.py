from fastapi import APIRouter

from app.api.endpoints import auth, projects, milestones, tasks, subtasks, ai

api_router = APIRouter()

# Auth routes
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Project routes
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])

# Milestone routes
api_router.include_router(milestones.router, prefix="/projects", tags=["milestones"])

# Task routes
api_router.include_router(tasks.router, prefix="/projects", tags=["tasks"])

# Subtask routes
api_router.include_router(subtasks.router, prefix="/projects", tags=["subtasks"])

# AI routes
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])