from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone

from app.api.deps import get_current_user
from app.db.models.auth import User
from app.db.models.project import Project, Milestone, Task, Subtask
from app.pydantic_models.project_http_models import SubtaskCreate, SubtaskPatch
from app.utils.helpers import _404, _clamp, _get_milestone_or_404, _get_project_or_404, _get_task_or_404
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

@router.post(
    "/{project_id}/milestones/{milestone_id}/tasks/{task_id}/subtasks",
    status_code=201,
    response_description="Create subtask",
)
async def create_subtask(
    project_id: str,
    milestone_id: str,
    task_id: str,
    payload: SubtaskCreate,
    user: User = Depends(get_current_user),
):
    project   = _get_project_or_404(project_id, user)
    milestone = _get_milestone_or_404(milestone_id, project_id)
    task      = _get_task_or_404(task_id, milestone_id, project_id)

    max_order = (
        Subtask.objects(task_id=task_id).order_by("-order").first().order
        if Subtask.objects(task_id=task_id) else -1
    )
    target_order = _clamp(payload.order or max_order + 1, max_order + 1)

    # shift >= target (+1), descending to avoid dup
    for st in (
        Subtask.objects(task_id=task_id, order__gte=target_order).order_by("-order")
    ):
        st.update(inc__order=1)

    subtask = Subtask(
        task_id=task_id,
        order=target_order,
        **payload.model_dump(exclude={"order"}),
    ).save()

    project.update(set__updated_at=datetime.now(tz=timezone.utc))
    return serialize_mongodb_doc(subtask.to_mongo().to_dict())


@router.put(
    "/{project_id}/milestones/{milestone_id}/tasks/{task_id}/subtasks/{subtask_id}",
    response_description="Update subtask",
)
async def update_subtask(
    project_id: str,
    milestone_id: str,
    task_id: str,
    subtask_id: str,
    patch: SubtaskPatch,
    user: User = Depends(get_current_user),
):
    project   = _get_project_or_404(project_id, user)
    _         = _get_milestone_or_404(milestone_id, project_id)
    task      = _get_task_or_404(task_id, milestone_id, project_id)
    subtask   = Subtask.objects(id=subtask_id, task_id=task_id).first() or _404("Subtask")

    # --- order move ---------------------------------------------------
    if patch.order is not None and patch.order != subtask.order:
        max_order = (
            Subtask.objects(task_id=task_id).order_by("-order").first().order
        )
        new_order = _clamp(patch.order, max_order)

        # park at -1
        subtask.update(set__order=-1)

        if new_order < subtask.order:
            Subtask.objects(task_id=task_id, order__gte=new_order, order__lt=subtask.order) \
                   .update(inc__order=1)
        else:
            Subtask.objects(task_id=task_id, order__gt=subtask.order, order__lte=new_order) \
                   .update(dec__order=1)

        subtask.order = new_order

    # --- patch other fields ------------------------------------------
    for k, v in patch.model_dump(exclude_none=True, exclude={"order"}).items():
        setattr(subtask, k, v)
    subtask.save()

    project.update(set__updated_at=datetime.now(tz=timezone.utc))
    return serialize_mongodb_doc(subtask.to_mongo().to_dict())

@router.delete(
    "/{project_id}/milestones/{milestone_id}/tasks/{task_id}/subtasks/{subtask_id}",
    status_code=204,
    response_description="Delete subtask",
)
async def delete_subtask(
    project_id: str,
    milestone_id: str,
    task_id: str,
    subtask_id: str,
    user: User = Depends(get_current_user),
):
    project   = _get_project_or_404(project_id, user)
    _         = _get_milestone_or_404(milestone_id, project_id)
    task      = _get_task_or_404(task_id, milestone_id, project_id)
    subtask   = Subtask.objects(id=subtask_id, task_id=task_id).first() or _404("Subtask")

    deleted_order = subtask.order
    subtask.delete()

    Subtask.objects(task_id=task_id, order__gt=deleted_order).update(dec__order=1)
    project.update(set__updated_at=datetime.now(tz=timezone.utc))
    
    return {"message": "Subtask deleted successfully"}