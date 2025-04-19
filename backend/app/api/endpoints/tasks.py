from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone

from app.api.deps import get_current_user
from app.db.models.auth import User
from app.db.models.project import Project, Milestone, Task, Subtask
from app.pydantic_models.project_http_models import TaskCreate, TaskPatch
from app.utils.helpers import _clamp, _get_milestone_or_404, _get_project_or_404, _get_task_or_404
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


@router.post("/{project_id}/milestones/{milestone_id}/tasks", status_code=201)
async def create_task(
    project_id: str,
    milestone_id: str,
    payload: TaskCreate,
    user: User = Depends(get_current_user),
):
    project = _get_project_or_404(project_id, user)
    milestone = _get_milestone_or_404(milestone_id, project_id)
    
    max_order = (
        Task.objects(milestone_id=milestone_id).order_by("-order").first().order
        if Task.objects(milestone_id=milestone_id) else -1
    )
    
    target_order = _clamp(payload.order or max_order + 1, max_order + 1)

    # shift >= target (+1)  descending to avoid dup
    for t in (
        Task.objects(milestone_id=milestone_id, order__gte=target_order)
        .order_by("-order")
    ):
        t.update(inc__order=1)

    task = Task(
        project_id=project_id,
        milestone_id=milestone_id,
        order=target_order,
        **payload.model_dump(exclude={"order"}),
    ).save()

    project.update(set__updated_at=datetime.now(tz=timezone.utc))

    return serialize_mongodb_doc(task.to_mongo().to_dict())

@router.put("/{project_id}/milestones/{milestone_id}/tasks/{task_id}", response_description="Update a task")
async def update_task(project_id: str, milestone_id: str, task_id: str, patch: TaskPatch
, current_user: User = Depends(get_current_user)):
    """
    Update a task's information.
    Does not affect subtasks.
    """
    project = _get_project_or_404(project_id, current_user)
    milestone = _get_milestone_or_404(milestone_id, project_id)
    task = _get_task_or_404(task_id, milestone_id, project_id)
    
    if patch.order is not None and patch.order != task.order:
        max_order = (
            Task.objects(milestone_id=milestone_id).order_by("-order").first().order
        )
        new_order = _clamp(patch.order, max_order)

        # park at -1
        task.update(set__order=-1)

        if new_order < task.order:
            Task.objects(milestone_id=milestone_id, order__gte=new_order, order__lt=task.order) \
                .update(inc__order=1)
        else:
            Task.objects(milestone_id=milestone_id, order__gt=task.order, order__lte=new_order) \
                .update(dec__order=1)

        task.order = new_order

    # --- other fields --------------------------------------------------
    for k, v in patch.model_dump(exclude_none=True, exclude={"order"}).items():
        setattr(task, k, v)
    task.save()

    project.update(set__updated_at=datetime.now(tz=timezone.utc))

    return serialize_mongodb_doc(task.to_mongo().to_dict())


@router.delete("/{project_id}/milestones/{milestone_id}/tasks/{task_id}", response_description="Delete a task")
async def delete_task(project_id: str, milestone_id: str, task_id: str, current_user: User = Depends(get_current_user)):
    """
    Delete a task and all its subtasks.
    """
    project = _get_project_or_404(project_id, current_user)
    milestone = _get_milestone_or_404(milestone_id, project_id)
    task = _get_task_or_404(task_id, milestone_id, project_id)
        
    deleted_order = task.order
    task.delete()                                   # subtasks cascade

    # shift rows down (-1)
    Task.objects(milestone_id=milestone_id, order__gt=deleted_order) \
        .update(dec__order=1)

    project.update(set__updated_at=datetime.now(tz=timezone.utc))
    
    return {"message": "Task deleted successfully"}