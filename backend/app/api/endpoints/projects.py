from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from mongoengine.queryset.visitor import Q
from app.api.deps import get_current_user
from app.db.models.auth import User
from app.db.models.project import Project, Milestone, Task, Subtask
from app.utils import serialize_mongodb_doc
from mongoengine.errors import DoesNotExist, InvalidQueryError

router = APIRouter()

@router.get("/", response_description="List all projects")
async def list_projects(current_user: User = Depends(get_current_user)):
    """
    Retrieve all projects for the authenticated user.
    Includes projects where user is either owner or collaborator.
    """
    # Query projects where user is owner or collaborator
    projects = Project.objects(Q(owner_id=current_user.id) | Q(collaborator_ids=current_user.id))
    
    # Convert projects to dictionaries without nested data
    result = []
    for project in projects:
        project_dict = project.to_mongo().to_dict()
        project_dict['id'] = str(project.id)
        
        # Count milestones, tasks, subtasks for summary info
        milestone_count = Milestone.objects(project_id=project.id).count()
        task_count = Task.objects(project_id=project.id).count()
        
        # Add counts to project data
        project_dict['milestone_count'] = milestone_count
        project_dict['task_count'] = task_count
        
        result.append(project_dict)
    
    return serialize_mongodb_doc(result)

@router.get("/{project_id}", response_description="Get a single project")
async def get_project(project_id: str, current_user: User = Depends(get_current_user)):
    """
    Retrieve a specific project by ID with basic info (no nested data).
    """
    try:
        object_id = ObjectId(project_id)
        project = Project.objects.get(id=object_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    # Check if user has access to the project
    if project.owner_id.id != current_user.id and current_user.id not in [str(c.id) for c in project.collaborator_ids]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this project"
        )
    
    # Convert project to dictionary
    project_dict = project.to_mongo().to_dict()
    project_dict['id'] = str(project.id)
    
    # Count milestones, tasks, subtasks for summary info
    milestone_count = Milestone.objects(project_id=project.id).count()
    task_count = Task.objects(project_id=project.id).count()
    completed_task_count = Task.objects(project_id=project.id, status="completed").count()
    
    # Add counts to project data
    project_dict['milestone_count'] = milestone_count
    project_dict['task_count'] = task_count
    project_dict['completed_task_count'] = completed_task_count
    
    if task_count > 0:
        project_dict['completion_percentage'] = round((completed_task_count / task_count) * 100, 2)
    else:
        project_dict['completion_percentage'] = 0
    
    return serialize_mongodb_doc(project_dict)

@router.get("/{project_id}/complete", response_description="Get a complete project with all details")
async def get_complete_project(project_id: str, current_user: User = Depends(get_current_user)):
    """
    Retrieve a project by ID with all nested details (milestones, tasks, subtasks).
    This provides the complete project structure for detailed views.
    """
    try:
        # Use the reusable function to get the structured project
        return await get_structured_project(project_id, current_user)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except DoesNotExist as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving project details: {str(e)}"
        )


@router.put("/{project_id}", response_description="Update a project")
async def update_project(project_id: str, project_data: dict, current_user: User = Depends(get_current_user)):
    """
    Update basic project information.
    Does not affect milestones, tasks, or subtasks.
    """
    try:
        object_id = ObjectId(project_id)
        project = Project.objects.get(id=object_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    # Check if user has access to update the project
    if project.owner_id.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this project"
        )
    
    # Update project fields
    for key, value in project_data.items():
        if key != 'id' and key != 'owner_id' and key != 'created_at':
            setattr(project, key, value)
    
    project.updated_at = datetime.now()
    project.save()
    
    # Return the updated project
    project_dict = project.to_mongo().to_dict()
    
    return serialize_mongodb_doc(project_dict)

@router.delete("/{project_id}", response_description="Delete a project")
async def delete_project(project_id: str, current_user: User = Depends(get_current_user)):
    """
    Delete a project and all its nested milestones, tasks, and subtasks.
    """
    try:
        project = Project.objects.get(id=project_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    
    # Check if user has access to delete the project
    if project.owner_id.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this project"
        )
    
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
    
    return {"message": "Project deleted successfully"}

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
        object_id = ObjectId(project_id)
        project = Project.objects.get(id=object_id)
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
    
    # Get all milestones for this project
    milestones = Milestone.objects(project_id=project.id).order_by('order')
    
    # Build complete structure
    milestones_list = []
    
    for milestone in milestones:
        milestone_dict = milestone.to_mongo().to_dict()
        milestone_dict['id'] = str(milestone.id)
        if '_id' in milestone_dict:
            del milestone_dict['_id']
        
        # Get tasks for this milestone
        tasks = Task.objects(milestone_id=milestone.id).order_by('order')
        tasks_list = []
        
        for task in tasks:
            task_dict = task.to_mongo().to_dict()
            task_dict['id'] = str(task.id)
            if '_id' in task_dict:
                del task_dict['_id']
            
            # Convert dependency IDs to strings
            if 'dependency_ids' in task_dict and task_dict['dependency_ids']:
                task_dict['dependency_ids'] = [str(dep_id) for dep_id in task_dict['dependency_ids']]
            
            # Get subtasks for this task
            subtasks = Subtask.objects(task_id=task.id).order_by('order')
            subtasks_list = []
            
            for subtask in subtasks:
                subtask_dict = subtask.to_mongo().to_dict()
                subtask_dict['id'] = str(subtask.id)
                if '_id' in subtask_dict:
                    del subtask_dict['_id']
                subtasks_list.append(subtask_dict)
            
            # Add subtasks to task
            task_dict['subtasks'] = subtasks_list
            tasks_list.append(task_dict)
        
        # Add tasks to milestone
        milestone_dict['tasks'] = tasks_list
        milestones_list.append(milestone_dict)
    
    # Add milestones to project
    project_dict['milestones'] = milestones_list
    
    # Calculate overall project statistics
    total_tasks = sum(len(milestone_dict['tasks']) for milestone_dict in milestones_list)
    completed_tasks = sum(
        sum(1 for task in milestone_dict['tasks'] if task.get('status') == 'completed')
        for milestone_dict in milestones_list
    )
    
    project_dict['task_count'] = total_tasks
    project_dict['completed_task_count'] = completed_tasks
    project_dict['milestone_count'] = len(milestones_list)
    
    if total_tasks > 0:
        project_dict['completion_percentage'] = round((completed_tasks / total_tasks) * 100, 2)
    else:
        project_dict['completion_percentage'] = 0
    
    # Serialize all MongoDB objects to avoid JSON encoding issues
    return serialize_mongodb_doc(project_dict)