from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime

from app.api.deps import get_current_user
from app.db.models.auth import User
from app.db.models.project import Project, Milestone, Task, Subtask
from app.utils.mongo_encoder import serialize_mongodb_doc

router = APIRouter()

@router.get("/{project_id}/milestones/{milestone_id}/tasks", response_description="List all tasks for a milestone")
async def list_tasks(project_id: str, milestone_id: str, current_user: User = Depends(get_current_user)):
    """
    Retrieve all tasks for the specified milestone.
    """
    try:
        project = Project.objects.get(id=project_id)
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
    
    try:
        milestone = Milestone.objects.get(id=milestone_id, project_id=project.id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Milestone with ID {milestone_id} not found in project {project_id}"
        )
    
    # Get all tasks for this milestone
    tasks = Task.objects(milestone_id=milestone.id).order_by('order')
    
    # Convert tasks to dictionaries without nested data
    result = []
    for task in tasks:
        task_dict = task.to_mongo().to_dict()    
        result.append(task_dict)
    
    return serialize_mongodb_doc(result)


@router.post("/{project_id}/milestones/{milestone_id}/tasks", response_description="Create a new task", status_code=status.HTTP_201_CREATED)
async def create_task(project_id: str, milestone_id: str, task_data: dict, current_user: User = Depends(get_current_user)):
    """
    Create a new task for a milestone.
    No nested subtasks are created here.
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
    
    try:
        milestone = Milestone.objects.get(id=milestone_id, project_id=project.id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Milestone with ID {milestone_id} not found in project {project_id}"
        )
    
    # Determine the highest current order value
    existing_tasks = Task.objects(milestone_id=milestone.id)
    max_order = 0
    if existing_tasks:
        max_order = max(task.order for task in existing_tasks) + 1
    
    # Create the task
    task = Task(
        project_id=project.id,
        milestone_id=milestone.id,
        order=task_data.get('order', max_order),
        **task_data
    )
    task.save()
    
    # Update project's and milestone's updated_at field
    project.updated_at = datetime.now()
    project.save()
    
    # Return the newly created task
    task_dict = task.to_mongo().to_dict()
    
    return serialize_mongodb_doc(task_dict)

@router.put("/{project_id}/milestones/{milestone_id}/tasks/{task_id}", response_description="Update a task")
async def update_task(project_id: str, milestone_id: str, task_id: str, task_data: dict, current_user: User = Depends(get_current_user)):
    """
    Update a task's information.
    Does not affect subtasks.
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
    
    try:
        milestone = Milestone.objects.get(id=milestone_id, project_id=project.id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Milestone with ID {milestone_id} not found in project {project_id}"
        )
    
    try:
        task = Task.objects.get(id=task_id, milestone_id=milestone.id, project_id=project.id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found in milestone {milestone_id}"
        )
    
    # Update task fields
    for key, value in task_data.items():
        if key != 'id' and key != 'project_id' and key != 'milestone_id':
            setattr(task, key, value)
    
    task.save()
    
    # Update project's updated_at field
    project.updated_at = datetime.now()
    project.save()
    
    milestone_was_changed = False
    # If task is marked as completed, check if we should update milestone status
    if task.status == "completed":
        all_tasks = Task.objects(milestone_id=milestone.id)
        all_completed = all(t.status == "completed" for t in all_tasks)
        if all_completed and milestone.status != "completed":
            milestone.status = "completed"
            milestone.save()
            milestone_was_changed = True
    
    # Return the updated task
    task_dict = task.to_mongo().to_dict()
    
    return {"task": serialize_mongodb_doc(task_dict), "affected_recources": {"milestone": {"id": str(milestone.id), "status": milestone.status}} if milestone_was_changed else None }

@router.delete("/{project_id}/milestones/{milestone_id}/tasks/{task_id}", response_description="Delete a task")
async def delete_task(project_id: str, milestone_id: str, task_id: str, current_user: User = Depends(get_current_user)):
    """
    Delete a task and all its subtasks.
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
    
    try:
        milestone = Milestone.objects.get(id=milestone_id, project_id=project.id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Milestone with ID {milestone_id} not found in project {project_id}"
        )
    
    try:
        task = Task.objects.get(id=task_id, milestone_id=milestone.id, project_id=project.id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found in milestone {milestone_id}"
        )
    
    # Delete subtasks
    Subtask.objects(task_id=task.id).delete()
    
    # Delete the task
    task.delete()
    
    # Update project's updated_at field
    project.updated_at = datetime.now()
    project.save()
    
    return {"message": "Task deleted successfully"}