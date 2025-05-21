from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any
from app.pydantic_models.project_http_models import ClarificationResponse, PlanGeneratioResponse, PlanGenerationInput, PlanRefinementInput
from app.db.models.project import Project
from app.services.ai.ai_plan_service import generate_clarifying_questions, generate_plan
from app.db.models.auth import User
from app.api.deps import get_current_user
from app.utils.serializers import create_or_update_project_from_plan

router = APIRouter()


@router.post("/clarify", response_model=ClarificationResponse)
async def generate_clarification_questions(
    input_data: PlanGenerationInput,
    current_user: User = Depends(get_current_user)
):
    """Generate clarification questions for a project description"""
    try:
        questions = generate_clarifying_questions(project_info=input_data)
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
        plan = await generate_plan(clarification_qa, project_info=input_data, user_id=current_user.id)
        project_id = await create_or_update_project_from_plan(project_data=plan ,current_user=current_user)
        return {"structured_plan": plan, "project_id": project_id}
    
    except Exception as e:
        print("Error in generate_project_plan:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate project plan: {str(e)}"
        )

