# app/api/endpoints/context.py
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timezone
from app.pydantic_models.context_models import (
    ContextGenerationRequest, 
    ContextGenerationResponse,
    UpdateContextNotesRequest
)
from app.db.models.project import Project
from app.db.models.auth import User
from app.api.deps import get_current_user
from app.services.ai.context_service import generate_comprehensive_context

router = APIRouter()

@router.post("/generate", response_model=ContextGenerationResponse)
async def generate_context(
    request: ContextGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate comprehensive development context for a project based on context notes"""
    try:
        # Validate project exists and user has access
        try:
            project = Project.objects.get(id=ObjectId(request.project_id))
        except:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {request.project_id} not found"
            )
        
        # Check if user has access to the project
        if project.owner_id.id != current_user.id and current_user.id not in [collab.id for collab in project.collaborator_ids]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this project"
            )
        
        # Prepare complete project data
        project_data = {
            "name": project.name,
            "description": project.description,
            "experience_level": project.experience_level,
            "team_size": project.team_size,
            "tech_stack": project.tech_stack,
            "high_level_plan": project.high_level_plan,
            "technical_architecture": project.technical_architecture,
            "api_endpoints": project.api_endpoints,
            "data_models": project.data_models,
            "ui_components": project.ui_components,
            "implementation_plan": project.implementation_plan
        }
        
        # Generate comprehensive context using context notes from project
        context_message = await generate_comprehensive_context(
            project_data=project_data,
            context_notes=project.context_notes  # Use saved context notes
        )
        
        # Save the generated context to the project
        project.last_context_message = context_message
        project.updated_at = datetime.now(tz=timezone.utc)
        project.save()
        
        return ContextGenerationResponse(
            success=True,
            context_message=context_message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate_context: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate context: {str(e)}"
        )

@router.get("/latest/{project_id}")
async def get_latest_context(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get the latest generated context for a project"""
    try:
        # Validate project exists and user has access
        try:
            project = Project.objects.get(id=ObjectId(project_id))
        except:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {project_id} not found"
            )
        
        # Check if user has access to the project
        if project.owner_id.id != current_user.id and current_user.id not in [collab.id for collab in project.collaborator_ids]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this project"
            )
        
        if not project.last_context_message:
            return None
        
        return ContextGenerationResponse(
            success=True,
            context_message=project.last_context_message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get latest context: {str(e)}"
        )

@router.put("/notes/{project_id}")
async def update_context_notes(
    project_id: str,
    request: UpdateContextNotesRequest,
    current_user: User = Depends(get_current_user)
):
    """Update context notes for a project"""
    try:
        # Validate project exists and user has access
        try:
            project = Project.objects.get(id=ObjectId(project_id))
        except:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {project_id} not found"
            )
        
        # Check if user has access to the project
        if project.owner_id.id != current_user.id and current_user.id not in [collab.id for collab in project.collaborator_ids]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this project"
            )
        
        # Update context notes
        project.context_notes = request.context_notes
        project.updated_at = datetime.now(tz=timezone.utc)
        project.save()
        
        return {"message": "Context notes updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating context notes: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update context notes: {str(e)}"
        )

@router.get("/notes/{project_id}")
async def get_context_notes(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get context notes for a project"""
    try:
        # Validate project exists and user has access
        try:
            project = Project.objects.get(id=ObjectId(project_id))
        except:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {project_id} not found"
            )
        
        # Check if user has access to the project
        if project.owner_id.id != current_user.id and current_user.id not in [collab.id for collab in project.collaborator_ids]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this project"
            )
        
        return {"context_notes": project.context_notes}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get context notes: {str(e)}"
        )