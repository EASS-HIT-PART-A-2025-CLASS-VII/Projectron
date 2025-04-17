from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime

from app.api.deps import get_current_user
from app.db.models.auth import User
from app.db.models.project import Project, Milestone, Task, Subtask
from app.utils.mongo_encoder import serialize_mongodb_doc

router = APIRouter()

@router.get("/{project_id}/milestones/{milestone_id}/tasks/{task_id}/subtasks", response_description="List all subtasks for a task")
async def list_subtasks(project_id: str, milestone_id: str, task_id: str, current_user: User = Depends(get_current_user)):
    """
    Retrieve all subtasks for the specified task.
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
    
    try:
        task = Task.objects.get(id=task_id, milestone_id=milestone.id, project_id=project.id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found in milestone {milestone_id}"
        )
    
    # Get all subtasks for this task
    subtasks = Subtask.objects(task_id=task.id).order_by('order')
    
    # Convert subtasks to dictionaries
    result = []
    for subtask in subtasks:
        subtask_dict = subtask.to_mongo().to_dict()
        result.append(subtask_dict)
    
    return serialize_mongodb_doc(result)

@router.get("/{project_id}/milestones/{milestone_id}/tasks/{task_id}/subtasks/{subtask_id}", response_description="Get a single subtask")
async def get_subtask(project_id: str, milestone_id: str, task_id: str, subtask_id: str, current_user: User = Depends(get_current_user)):
    """
    Retrieve a specific subtask by ID.
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
    
    try:
        task = Task.objects.get(id=task_id, milestone_id=milestone.id, project_id=project.id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found in milestone {milestone_id}"
        )
    
    try:
        subtask = Subtask.objects.get(id=subtask_id, task_id=task.id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subtask with ID {subtask_id} not found in task {task_id}"
        )
    
    # Convert subtask to dictionary
    subtask_dict = subtask.to_mongo().to_dict()
    
    return serialize_mongodb_doc(subtask_dict)

@router.post("/{project_id}/milestones/{milestone_id}/tasks/{task_id}/subtasks", response_description="Create a new subtask", status_code=status.HTTP_201_CREATED)
async def create_subtask(project_id: str, milestone_id: str, task_id: str, subtask_data: dict, current_user: User = Depends(get_current_user)):
    """
    Create a new subtask for a task.
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
    
    # Determine the highest current order value
    existing_subtasks = Subtask.objects(task_id=task.id)
    max_order = 0
    if existing_subtasks:
        max_order = max(subtask.order for subtask in existing_subtasks) + 1
    
    # Create the subtask
    subtask = Subtask(
        task_id=task.id,
        order=subtask_data.get('order', max_order),
        **subtask_data
    )
    subtask.save()
    
    # Update project's updated_at field
    project.updated_at = datetime.now()
    project.save()
    
    # Return the newly created subtask
    subtask_dict = subtask.to_mongo().to_dict()
    
    return serialize_mongodb_doc(subtask_dict) 

@router.put("/{project_id}/milestones/{milestone_id}/tasks/{task_id}/subtasks/{subtask_id}", response_description="Update a subtask")
async def update_subtask(project_id: str, milestone_id: str, task_id: str, subtask_id: str, subtask_data: dict, current_user: User = Depends(get_current_user)):
    """
    Update a subtask's information.
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
    
    try:
        subtask = Subtask.objects.get(id=subtask_id, task_id=task.id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subtask with ID {subtask_id} not found in task {task_id}"
        )
    
    # Update subtask fields
    for key, value in subtask_data.items():
        if key != 'id' and key != 'task_id':
            setattr(subtask, key, value)
    
    subtask.save()
    
    # Update project's updated_at field
    project.updated_at = datetime.now()
    project.save()

    task_was_updated      = False
    milestone_was_updated = False
    # If all subtasks are completed, check if we should update task status
    if subtask.status == "completed":
        all_subtasks = Subtask.objects(task_id=task.id)
        all_completed = all(s.status == "completed" for s in all_subtasks)
        if all_completed and task.status != "completed":
            task.status = "completed"
            task.save()
            task_was_updated = True
            # Check if all tasks in milestone are completed
            all_tasks = Task.objects(milestone_id=milestone.id)
            all_tasks_completed = all(t.status == "completed" for t in all_tasks)
            if all_tasks_completed and milestone.status != "completed":
                milestone.status = "completed"
                milestone.save()
                milestone_was_updated = True
    
    # Return the updated subtask
    subtask_dict = subtask.to_mongo().to_dict()
    
    return {
    "subtask": serialize_mongodb_doc(subtask_dict),
    "affected_resources": {
        "task": {"id": str(task.id), "status": task.status} if task_was_updated else None,
        "milestone": {"id": str(milestone.id), "status": milestone.status} if milestone_was_updated else None
    }
}

@router.delete("/{project_id}/milestones/{milestone_id}/tasks/{task_id}/subtasks/{subtask_id}", response_description="Delete a subtask")
async def delete_subtask(project_id: str, milestone_id: str, task_id: str, subtask_id: str, current_user: User = Depends(get_current_user)):
    """
    Delete a subtask.
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
    
    try:
        subtask = Subtask.objects.get(id=subtask_id, task_id=task.id)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subtask with ID {subtask_id} not found in task {task_id}"
        )
    
    # Delete the subtask
    subtask.delete()
    
    # Update project's updated_at field
    project.updated_at = datetime.now()
    project.save()
    
    return {"message": "Subtask deleted successfully"}