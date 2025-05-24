# app/pydantic_models/context_models.py
from pydantic import BaseModel, Field
from typing import Optional

class ContextGenerationRequest(BaseModel):
    project_id: str = Field(..., description="Project ID")

class UpdateContextNotesRequest(BaseModel):
    context_notes: str = Field(..., description="Additional context notes from user")

class DevelopmentContext(BaseModel):
    """Single comprehensive development context for AI coding assistants"""
    context_message: str = Field(..., description="Complete development context including all project details and implementation guidance")

class ContextGenerationResponse(BaseModel):
    success: bool
    context_message: Optional[str] = None
    error: Optional[str] = None