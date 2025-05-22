from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any
from app.pydantic_models.project_http_models import ClarificationResponse, PlanGeneratioResponse, PlanGenerationInput, PlanRefinementInput
from app.db.models.project import Project
from app.services.ai.ai_plan_service import generate_clarifying_questions, generate_plan
from app.db.models.auth import User
from app.api.deps import get_current_user
from app.utils.serializers import create_or_update_project_from_plan
import uuid
from fastapi import BackgroundTasks
from app.db.models.plan_progress import PlanProgress

router = APIRouter()


@router.post("/clarify", response_model=ClarificationResponse)
async def generate_clarification_questions(
    input_data: PlanGenerationInput,
    current_user: User = Depends(get_current_user)
):
    """Generate clarification questions for a project description"""
    try:
        questions = await generate_clarifying_questions(project_info=input_data)
        return questions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate clarification questions: {str(e)}"
        )


# Add this new endpoint to your existing router
@router.get("/status/{task_id}")
async def get_plan_status(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get the status of plan generation"""
    try:
        progress = PlanProgress.objects(task_id=task_id, user_id=str(current_user.id)).first()
        
        if not progress:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        return {
            "task_id": progress.task_id,
            "status": progress.status,
            "current_step": progress.current_step,
            "step_number": progress.step_number,
            "total_steps": progress.total_steps,
            "error_message": progress.error_message,
            "project_id": progress.project_id,
            "result": progress.result if progress.status == 'completed' else None
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get status: {str(e)}"
        )

# Modify your existing generate-plan endpoint
@router.post("/generate-plan", response_model=dict)
async def generate_project_plan(
    background_tasks: BackgroundTasks,
    input_data: PlanGenerationInput,
    clarification_qa: Dict[str, str] = {},
    current_user: User = Depends(get_current_user)
):
    """Generate a complete project plan based on description and answers to clarification questions"""
    try:
        # Generate unique task ID
        task_id = str(uuid.uuid4())
        
        # Create progress tracker
        progress = PlanProgress(
            task_id=task_id,
            user_id=str(current_user.id),
            status='pending',
            current_step='starting',
            step_number=0,
            total_steps=6
        )
        progress.save()
        
        # Start background task
        background_tasks.add_task(
            generate_plan_background,
            task_id,
            clarification_qa,
            input_data,
            current_user
        )
        
        # Return task ID immediately
        return {"task_id": task_id, "status": "started"}
        
    except Exception as e:
        print("Error in generate_project_plan:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start plan generation: {str(e)}"
        )

# New background task function
async def generate_plan_background(
    task_id: str,
    clarification_qa: Dict[str, str],
    project_info: PlanGenerationInput,
    current_user: User
):
    """Background task to generate plan with progress updates"""
    progress = PlanProgress.objects(task_id=task_id).first()
    
    try:
        progress.update_progress("Initializing plan generation", 1, 'processing')
        
        # Call your existing generate_plan function with progress
        plan = await generate_plan(clarification_qa, project_info, current_user.id, progress)
        
        progress.update_progress("Creating project", 6, 'processing')
        
        # Create project
        project_id = await create_or_update_project_from_plan(project_data=plan, current_user=current_user)
        
        # Mark as completed
        progress.complete(plan, project_id)
        
    except Exception as e:
        print(f"Error in background plan generation: {str(e)}")
        progress.fail(str(e))
