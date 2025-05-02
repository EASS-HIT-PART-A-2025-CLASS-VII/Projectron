from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone
from mongoengine.queryset.visitor import Q
from app.api.deps import get_current_user
from app.db.models.auth import User
from app.db.models.project import Project, Milestone, Task, Subtask
from app.utils.mongo_encoder import serialize_mongodb_doc
from mongoengine.errors import DoesNotExist, InvalidQueryError

from app.utils.serializers import get_structured_project

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
        # Only include needed fields
        project_dict = {
            'id': str(project.id),
            'name': project.name,
            'description': project.description,
            'status': project.status,
            'created_at': project.created_at,
            'updated_at': project.updated_at,
            'owner_id': str(project.owner_id.id) if project.owner_id else None,
            'collaborator_ids': [str(collab_id) for collab_id in project.collaborator_ids] if project.collaborator_ids else []
        }
        
        # Count milestones, tasks, subtasks for summary info
        milestone_count = Milestone.objects(project_id=project.id).count()
        task_count = Task.objects(project_id=project.id).count()
        
        # Add counts to project data
        project_dict['milestone_count'] = milestone_count
        project_dict['task_count'] = task_count
        
        result.append(project_dict)
    
    return serialize_mongodb_doc(result)
    

@router.get("/{project_id}", response_description="Get a complete project with all details")
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
        project = Project.objects.get(id=project_id)
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
    
    for key, value in project_data.items():
        if key in ['id','_id', 'owner_id']:
            continue
        if hasattr(project, key):
            setattr(project, key, value)
    
    project.updated_at = datetime.now(tz=timezone.utc)

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
    
    # Delete the project
    project.delete()
    
    return {"message": "Project deleted successfully"}

