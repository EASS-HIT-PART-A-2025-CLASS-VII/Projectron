from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any
from app.pydantic_models.project_http_models import ClarificationResponse, PlanGeneratioResponse, PlanGenerationInput, PlanRefinementInput
from app.db.models.project import Project
from app.services.ai.project_ai_service import ProjectAIService
from app.db.models.auth import User
from app.api.deps import get_current_user
from app.utils.serializers import create_or_update_project_from_plan

router = APIRouter()
ai_service = ProjectAIService()


@router.post("/clarify", response_model=ClarificationResponse)
async def generate_clarification_questions(
    input_data: PlanGenerationInput,
    current_user: User = Depends(get_current_user)
):
    """Generate clarification questions for a project description"""
    try:
        questions = await ai_service.generate_clarification_questions(project_info=input_data)
        return questions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate clarification questions: {str(e)}"
        )

@router.post("/generate-plan", response_model=PlanGeneratioResponse)
async def generate_project_plan(
    input_data: PlanGenerationInput,
    clarification_qa: Dict[str, str] = {},
    current_user: User = Depends(get_current_user)
):
    """Generate a complete project plan based on description and answers to clarification questions"""
    try:
        plan = await ai_service.generate_project_plan(project_info=input_data, clarification_qa=clarification_qa)
        project_id = await create_or_update_project_from_plan(project_data=plan.get("structured_plan", {}), input_data=input_data.model_dump() ,current_user=current_user)
        return {"structured_plan": plan.get("structured_plan"), "project_id": project_id}
    
    except Exception as e:
        print("Error in generate_project_plan:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate project plan: {str(e)}"
        )

@router.post("/refine-plan", response_model=Dict[str, Any])
async def refine_project_plan(
    input_data: PlanRefinementInput,
    current_user: User = Depends(get_current_user)
):
    """Refine an existing project plan based on feedback"""
    try:
        # Validate project ID and get project
        project = Project.objects(id=input_data.project_id).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {input_data.project_id} not found"
            )
        
        # Ensure user has access to this project
        if str(project.owner_id.id) != str(current_user.id):
            # Check if user is a collaborator
            is_collaborator = False
            if hasattr(project, 'collaborator_ids'):
                is_collaborator = any(str(collab.id) == str(current_user.id) for collab in project.collaborator_ids)
            
            if not is_collaborator:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to modify this project"
                )
        
        # Construct the current plan from the project's fields
        current_plan = {
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "tech_stack": project.tech_stack,
            "experience_level": project.experience_level,
            "team_size": project.team_size,
            "high_level_plan": project.high_level_plan,
            "technical_architecture": project.technical_architecture,
            "api_endpoints": project.api_endpoints,
            "data_models": project.data_models,
            "ui_components": project.ui_components,
            "implementation_plan": project.implementation_plan.get("milestones", []),
        }

        # Generate refined plan
        refined_plan = await ai_service.refine_project_plan(
            current_plan=current_plan,
            feedback=input_data.feedback
        )
        
        # Generate a new textual plan
        textual_plan = await ai_service._generate_text_plan(refined_plan)
        
        # Update project with refined plan
        await create_or_update_project_from_plan(refined_plan, textual_plan, current_user, existing_project_id=str(project.id))
        
        return refined_plan
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refine project plan: {str(e)}"
        )
