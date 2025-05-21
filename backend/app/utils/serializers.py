from datetime import datetime, timedelta, timezone
from typing import Any, Dict
from app.db.models.auth import User
from app.db.models.project import Project
from bson.objectid import ObjectId
from mongoengine.errors import InvalidQueryError, DoesNotExist
from app.pydantic_models.project_http_models import PlanGenerationInput
from app.utils.mongo_encoder import serialize_mongodb_doc


async def get_structured_project(project_id: str, current_user=None):
    """
    Get a complete structured representation of a project with all its
    nested milestones, tasks, and subtasks.
    
    Args:
        project_id: The string ID of the project to retrieve
        current_user: Optional user for access control checks
        
    Returns:
        A fully structured JSON-compatible dictionary with all project details
        
    Raises:
        ValueError: For invalid project ID format
        DoesNotExist: If project not found
        PermissionError: If current_user doesn't have access to the project
    """
    try:
        # Convert string ID to ObjectId for MongoDB query
        project = Project.objects(id=project_id).first()
    except InvalidQueryError:
        raise ValueError(f"Invalid project ID format: {project_id}")
    except DoesNotExist:
        raise DoesNotExist(f"Project with ID {project_id} not found")
    
    # Check access permissions if a user was provided
    if current_user:
        owner_id_str = str(project.owner_id.id) if hasattr(project.owner_id, 'id') else str(project.owner_id)
        current_user_id_str = str(current_user.id)
        collaborator_ids_str = [str(c.id) if hasattr(c, 'id') else str(c) for c in project.collaborator_ids]
        
        if owner_id_str != current_user_id_str and current_user_id_str not in collaborator_ids_str:
            raise PermissionError("Not authorized to access this project")
    

    
    # Build the basic project structure
    project_dict = project.to_mongo().to_dict()
    project_dict['id'] = str(project.id)
    if '_id' in project_dict:
        del project_dict['_id']
    
    metrics = calculate_plan_metrics(project_dict.get("implementation_plan", {}).get("milestones", []))
    project_dict['milestone_count'] = metrics["milestone_count"]
    project_dict['task_count'] = metrics["task_count"]
    project_dict['subtask_count'] = metrics["subtask_count"]
    project_dict['completion_percentage'] = metrics["completion_percentage"]
    # Serialize all MongoDB objects to avoid JSON encoding issues
    return serialize_mongodb_doc(project_dict)


async def create_or_update_project_from_plan(project_data:Dict[Any, Any], current_user:User, existing_project_id: str = None):
    """Create a new project or update an existing project from AI-generated plan"""
    try:
        project = None
        
        if existing_project_id:
            # This is a refinement of an existing project
            project = Project.objects(id=ObjectId(existing_project_id)).first()
            if not project:
                raise Exception(f"Project with ID {existing_project_id} not found")
              
            # Update the project with new plan data
            project.name = project_data.get("name", project_data.get("name", "Untitled Project"))
            project.description = project_data.get("description", project.description)
            project.tech_stack = project_data.get("tech_stack", project.tech_stack)
            project.experience_level = project_data.get("experience_level", project.experience_level)
            project.team_size = project_data.get("team_size", project.team_size)
            project.status = project_data.get("status", project.status)
            
            # Update with enhanced plan data
            
            project.high_level_plan = project_data.get("high_level_plan", {})
            project.technical_architecture = project_data.get("technical_architecture", {})
            project.api_endpoints = project_data.get("api_endpoints", {})
            project.data_models = project_data.get("data_models", {})
            project.ui_components = project_data.get("ui_components", {})
            project.implementation_plan = project_data.get("implementation_plan", {})
            
            project.updated_at = datetime.now(tz=timezone.utc)
            project.save()
            
        else:
            # Create a new project
            project = Project(
                name=project_data.get("name", project_data.get("name", "Untitled Project")),
                description=project_data.get("description", ""),
                tech_stack=project_data.get("tech_stack", []),
                experience_level=project_data.get("experience_level", "junior"),
                team_size=project_data.get("team_size", 1),
                status=project_data.get("status", "draft"),
                owner_id=current_user.id,

                high_level_plan=project_data.get("high_level_plan", {}),
                technical_architecture=project_data.get("technical_architecture", {}),
                api_endpoints=project_data.get("api_endpoints", {}),
                data_models=project_data.get("data_models", {}),
                ui_components=project_data.get("ui_components", {}),
                implementation_plan=project_data.get("implementation_plan", {}),
                created_at=datetime.now(tz=timezone.utc),
                updated_at=datetime.now(tz=timezone.utc)
            )
            project.save()
        
        project_id = str(project.id)
        
        
        return project_id
        
    except Exception as e:
        # If anything fails during creation of a new project, clean up
        if not existing_project_id and 'project' in locals() and project:
            project.delete()
            
        # Re-raise the exception
        raise Exception(f"Failed to create/update project from plan: {str(e)}")


def calculate_plan_metrics(milestones):
    """
    Count milestones, tasks, and subtasks and calculate completion percentage.
    
    Args:
        milestones: List of milestone objects
        
    Returns:
        dict: Counts and completion percentage
    """
    # Initialize counters
    milestone_count = len(milestones)
    task_count = 0
    subtask_count = 0
    
    # Track completed items
    completed_items = 0
    total_items = milestone_count  # Start with milestones
    
    # Process all milestones
    for milestone in milestones:
        # Check if milestone is completed
        if milestone.get("status") == "completed":
            completed_items += 1
            
        # Count tasks
        tasks = milestone.get("tasks", [])
        task_count += len(tasks)
        total_items += len(tasks)
        
        # Process tasks
        for task in tasks:
            # Check if task is completed
            if task.get("status") == "completed":
                completed_items += 1
                
            # Count subtasks
            subtasks = task.get("subtasks", [])
            subtask_count += len(subtasks)
            total_items += len(subtasks)
            
            # Check completed subtasks
            for subtask in subtasks:
                if subtask.get("status") == "completed":
                    completed_items += 1
    
    # Calculate completion percentage
    completion_percentage = 0
    if total_items > 0:
        completion_percentage = (completed_items / total_items) * 100
    
    return {
        "milestone_count": milestone_count,
        "task_count": task_count,
        "subtask_count": subtask_count,
        "completion_percentage": round(completion_percentage, 2)
    }