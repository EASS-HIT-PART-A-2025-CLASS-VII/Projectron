from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any
from app.pydantic_models.project_payload import ClarificationResponse, PlanGeneratioResponse, PlanGenerationInput, PlanRefinementInput, ProjectInput, TaskSuggestionInput, TaskSuggestionResponse, TimeEstimationInput
from app.db.models.project import Milestone, Project, Subtask, Task
from app.services.ai.project_ai_service import ProjectAIService
from app.pydantic_models.ai_models import (
    ProjectPlanModel,
)
from app.db.models.auth import User
from app.api.deps import get_current_user

router = APIRouter()
ai_service = ProjectAIService()


@router.post("/clarify", response_model=ClarificationResponse)
async def generate_clarification_questions(
    input_data: ProjectInput,
    current_user: User = Depends(get_current_user)
):
    """Generate clarification questions for a project description"""
    try:
        questions = await ai_service.generate_clarification_questions(project_info=input_data)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate clarification questions: {str(e)}"
        )

@router.post("/generate-plan", response_model=PlanGeneratioResponse)
async def generate_project_plan(
    input_data: PlanGenerationInput,
    current_user: User = Depends(get_current_user)
):
    """Generate a complete project plan based on description and answers to clarification questions"""
    try:
        plan = await ai_service.generate_project_plan(project_info=input_data)
        await create_project_from_plan(plan.get("structured_plan", {}), current_user)
        return {"structured_plan": plan.get("structured_plan"), "project_text": plan.get("text_plan", {})}
    
    except Exception as e:
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
        # Convert dict to ProjectPlanModel
        refined_plan = await ai_service.refine_project_plan(
            current_plan=input_data.project_plan,
            feedback=input_data.feedback
        )
        await create_project_from_plan(refined_plan, current_user)
        return refined_plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refine project plan: {str(e)}"
        )


async def create_project_from_plan(project_data, current_user):
    """Create project, milestones, tasks and subtasks from AI-generated plan"""
    try:
        # Extract the project data from the structured plan
        
        # Create the main project
        project = Project(
            name=project_data.get("name", "Untitled Project"),
            description=project_data.get("description", ""),
            tech_stack=project_data.get("tech_stack", []),
            experience_level=project_data.get("experience_level", "junior"),
            team_size=project_data.get("team_size", 1),
            status=project_data.get("status", "draft"),
            owner_id=current_user.id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        project.save()
        
        # Create milestones
        milestones_dict = {}  # Store milestone objects for later reference
        
        for i, milestone_data in enumerate(project_data.get("milestones", [])):
            # Calculate due date if due_date_offset is provided
            due_date = None
            if "due_date_offset" in milestone_data:
                due_date = datetime.now() + timedelta(days=milestone_data["due_date_offset"])
            
            milestone = Milestone(
                project_id=project.id,
                name=milestone_data.get("name", f"Milestone {i+1}"),
                description=milestone_data.get("description", ""),
                status=milestone_data.get("status", "not_started"),
                due_date=due_date,
                order=i
            )
            milestone.save()
            
            # Store the milestone for reference when creating tasks
            milestones_dict[milestone_data.get("name")] = milestone
            
            # Create tasks for this milestone
            tasks_dict = {}  # Store task objects for later reference
            
            for j, task_data in enumerate(milestone_data.get("tasks", [])):
                # Calculate due date if due_date_offset is provided
                task_due_date = None
                if "due_date_offset" in task_data:
                    task_due_date = datetime.now() + timedelta(days=task_data["due_date_offset"])
                elif due_date:
                    # If task has no due date but milestone does, use milestone's due date
                    task_due_date = due_date
                
                task = Task(
                    project_id=project.id,
                    milestone_id=milestone.id,
                    name=task_data.get("name", f"Task {j+1}"),
                    description=task_data.get("description", ""),
                    status=task_data.get("status", "not_started"),
                    priority=task_data.get("priority", "medium"),
                    estimated_hours=task_data.get("estimated_hours", 0),
                    due_date=task_due_date,
                    order=j
                )
                task.save()
                
                # Store the task for reference when creating subtasks or dependencies
                tasks_dict[task_data.get("name")] = task
                
                # Create subtasks
                for k, subtask_data in enumerate(task_data.get("subtasks", [])):
                    subtask = Subtask(
                        task_id=task.id,
                        name=subtask_data.get("name", f"Subtask {k+1}"),
                        status=subtask_data.get("status", "not_started"),
                        order=k
                    )
                    subtask.save()
            
            # Set up task dependencies after all tasks are created
            for j, task_data in enumerate(milestone_data.get("tasks", [])):
                if "dependencies" in task_data and task_data["dependencies"]:
                    task = tasks_dict.get(task_data.get("name"))
                    if task:
                        dependency_ids = []
                        for dep_name in task_data["dependencies"]:
                            if dep_name in tasks_dict:
                                dependency_ids.append(tasks_dict[dep_name].id)
                        
                        if dependency_ids:
                            # Update the task with dependencies
                            task.dependency_ids = dependency_ids
                            task.save()
        
        # Convert project to dictionary for response
        project_dict = project.to_mongo().to_dict()
        project_dict['id'] = str(project.id)
        
        # Count milestones and tasks for summary info
        milestone_count = Milestone.objects(project_id=project.id).count()
        task_count = Task.objects(project_id=project.id).count()
        
        # Add counts to project data
        project_dict['milestone_count'] = milestone_count
        project_dict['task_count'] = task_count
        
        if '_id' in project_dict:
            project_dict.pop('_id')
            
        return project_dict
        
    except Exception as e:
        # If anything fails, try to clean up any partially created data
        if 'project' in locals() and project:
            # Get all milestones for this project
            milestones = Milestone.objects(project_id=project.id)
            
            # For each milestone, delete tasks and subtasks
            for milestone in milestones:
                tasks = Task.objects(milestone_id=milestone.id)
                for task in tasks:
                    # Delete subtasks
                    Subtask.objects(task_id=task.id).delete()
                # Delete tasks
                Task.objects(project_id=project.id).delete()
            
            # Delete milestones
            Milestone.objects(project_id=project.id).delete()
            
            # Delete the project
            project.delete()
            
        # Re-raise the exception
        raise Exception(f"Failed to create project from plan: {str(e)}")