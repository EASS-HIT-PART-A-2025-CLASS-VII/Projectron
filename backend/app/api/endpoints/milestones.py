from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.api.deps import get_current_user
from app.db.models.auth import User
from app.db.models.project import Project, Milestone, Task, Subtask
from app.utils import serialize_mongodb_doc

class MilestoneCreate(BaseModel):
    name: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    order: Optional[int] = 0
    status: Optional[str] = "not_started"
    metadata: Optional[dict] = {}

class MilestoneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    order: Optional[int] = None
    status: Optional[str] = "not_started"
    metadata: Optional[dict] = {}

class MilestoneResponse(BaseModel):
    id: str
    project_id: str
    name: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    order: int
    status: str
    task_count: int = 0
    completed_task_count: int = 0
    completion_percentage: float = 0.0

    class Config:
        orm_mode = True




router = APIRouter()

@router.get("/{project_id}/milestones", response_description="List all milestones for a project")
async def list_milestones(project_id: str, current_user: User = Depends(get_current_user)):
    """
    Retrieve all milestones for the specified project.
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
    
    # Get all milestones for this project
    milestones = Milestone.objects(project_id=project.id).order_by('order')
    
    # Convert milestones to dictionaries without nested data
    result = []
    for milestone in milestones:
        milestone_dict = milestone.to_mongo().to_dict()
        milestone_dict['id'] = str(milestone.id)       
        
        result.append(milestone_dict)
    
    return serialize_mongodb_doc(result)

@router.post("/{project_id}/milestones", response_description="Create a new milestone", status_code=status.HTTP_201_CREATED)
async def create_milestone(project_id: str, milestone_data: dict, current_user: User = Depends(get_current_user)):
    """
    Create a new milestone for a project.
    No nested tasks are created here.
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
    
    # Determine the highest current order value
    existing_milestones = Milestone.objects(project_id=project.id)
    max_order = 0
    if existing_milestones:
        max_order = max(milestone.order for milestone in existing_milestones) + 1
    
    # Create the milestone
    milestone = Milestone(
        project_id=project.id,
        order=milestone_data.get('order', max_order),
        **milestone_data
    )
    milestone.save()
    
    # Update project's updated_at field
    project.updated_at = datetime.now()
    project.save()
    
    # Return the newly created milestone
    milestone_dict = milestone.to_mongo().to_dict()
    
    return serialize_mongodb_doc(milestone_dict)

@router.put("/{project_id}/milestones/{milestone_id}", response_description="Update a milestone")
async def update_milestone(project_id: str, milestone_id: str, milestone_data: dict, current_user: User = Depends(get_current_user)):
    """
    Update a milestone's information.
    Does not affect tasks or subtasks.
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
    
    try:
        milestone = Milestone.objects.get(id=milestone_id, project_id=project.id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Milestone with ID {milestone_id} not found in project {project_id}"
        )
    
    # Update milestone fields
    for key, value in milestone_data.items():
        if key != 'id' and key != 'project_id':
            setattr(milestone, key, value)
    
    milestone.save()
    
    # Update project's updated_at field
    project.updated_at = datetime.now()
    project.save()
    
    # Return the updated milestone
    milestone_dict = milestone.to_mongo().to_dict()
    
    return serialize_mongodb_doc(milestone_dict)

@router.delete("/{project_id}/milestones/{milestone_id}", response_description="Delete a milestone")
async def delete_milestone(project_id: str, milestone_id: str, current_user: User = Depends(get_current_user)):
    """
    Delete a milestone and all its nested tasks and subtasks.
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
    
    try:
        milestone = Milestone.objects.get(id=milestone_id, project_id=project.id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Milestone with ID {milestone_id} not found in project {project_id}"
        )
    
    # Get all tasks for this milestone
    tasks = Task.objects(milestone_id=milestone.id)
    
    # For each task, delete subtasks
    for task in tasks:
        # Delete subtasks
        Subtask.objects(task_id=task.id).delete()
    
    # Delete tasks
    Task.objects(milestone_id=milestone.id).delete()
    
    # Delete the milestone
    milestone.delete()
    
    # Update project's updated_at field
    project.updated_at = datetime.now()
    project.save()
    
    return {"message": "Milestone deleted successfully"}