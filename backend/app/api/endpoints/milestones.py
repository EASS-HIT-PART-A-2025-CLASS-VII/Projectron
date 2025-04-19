from fastapi import APIRouter, Body, Depends, HTTPException, status
from datetime import datetime, timezone
from mongoengine.errors import NotUniqueError
from app.api.deps import get_current_user
from app.db.models.auth import User
from app.db.models.project import Project, Milestone
from app.pydantic_models.project_http_models import MilestonePatch, MilestoneUpdate
from app.utils.helpers import _clamp, _get_milestone_or_404, _get_project_or_404
from app.utils.mongo_encoder import serialize_mongodb_doc

router = APIRouter()


@router.get("/{project_id}/milestones", response_description="List all milestones for a project")
async def list_milestones(project_id: str, current_user: User = Depends(get_current_user)):
    """
    Retrieve all milestones for the specified project.
    """
    try:
        project = Project.objects(id=project_id).first()
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
async def create_milestone(project_id: str, milestone_data: MilestoneUpdate, current_user: User = Depends(get_current_user)):
    """
    Create a new milestone for a project.
    No nested tasks are created here.
    """
    # 1. load project + permission check -------------------------------
    project = _get_project_or_404(project_id, current_user)

    # 2. determine target order ---------------------------------------
    existing_qs = Milestone.objects(project_id=project_id)
    max_order = existing_qs.order_by("-order").first().order if existing_qs else -1

    # user may supply order or omit
    target_order = (
        milestone_data.order if milestone_data.order is not None else max_order + 1
    )

    # clamp negative / out‑of‑range values
    if target_order < 0:
        target_order = 0
    if target_order > max_order + 1:
        target_order = max_order + 1

    # 3. shift conflicting milestones (+1) -----------------------------
    # do this *before* insert, so unique index is never violated
    conflicting = (
        Milestone.objects(project_id=project_id, order__gte=target_order)
        .order_by("-order")            # highest order first
    )
    for ms in conflicting:
        ms.update(inc__order=1)        # each update is unique

    # 4. insert new milestone -----------------------------------------
    try:
        milestone = Milestone(
            project_id=project_id,
            order=target_order,
            name=milestone_data.name,
            description=milestone_data.description,
            due_date=milestone_data.due_date,
            status=milestone_data.status or "not_started",
        ).save()
    except NotUniqueError:  # extremely rare race; client can retry
        raise HTTPException(409, "Order collision, try again")

    # 5. update project timestamp -------------------------------------
    project.update(set__updated_at=datetime.now(tz=timezone.utc))

    return serialize_mongodb_doc(milestone.to_mongo().to_dict())


@router.put(
    "/{project_id}/milestones/{milestone_id}",
    response_description="Update a milestone",
)
async def update_milestone(
    project_id: str,
    milestone_id: str,
    patch: MilestonePatch = Body(...),
    current_user: User = Depends(get_current_user),
):
    # 1. fetch project & permission check -------------------------------
    project = _get_project_or_404(project_id, current_user)
    # 2. fetch milestone -------------------------------------------------
    milestone = _get_milestone_or_404(milestone_id, project_id)

    # 3. handle order move --------------------------------------------------
    if patch.order is not None and patch.order != milestone.order:
        # bounds for new order
        max_order = (
            Milestone.objects(project_id=project_id).order_by("-order").first().order
            if Milestone.objects(project_id=project_id) else -1
        )
        new_order = _clamp(patch.order, max_order)

        # --- Step 3a: free the current slot -------------------------------
        milestone.update(set__order=-1)      # -1 is outside valid range

        # --- Step 3b: shift others ---------------------------------------
        if new_order < milestone.order:
            # moving UP: bump [new_order, old-1] +1
            Milestone.objects(project_id=project_id, order__gte=new_order, order__lt=milestone.order) \
                    .update(inc__order=1)
        else:
            # moving DOWN: pull [old+1, new_order] -1
            Milestone.objects(project_id=project_id, order__gt=milestone.order, order__lte=new_order) \
                    .update(dec__order=1)

        # --- Step 3c: drop into place -------------------------------------
        milestone.order = new_order

    # 4. patch the other fields -----------------------------------------
    for field, value in patch.model_dump(exclude_none=True, exclude={"order"}).items():
        setattr(milestone, field, value)

    milestone.save()

    # 5. bump project timestamp -----------------------------------------
    project.update(set__updated_at=datetime.now(tz=timezone.utc))

    return serialize_mongodb_doc(milestone.to_mongo().to_dict())

@router.delete("/{project_id}/milestones/{milestone_id}", response_description="Delete a milestone")
async def delete_milestone(project_id: str, milestone_id: str, current_user: User = Depends(get_current_user)):
    """
    Delete a milestone and all its nested tasks and subtasks.
    """
    # 1. fetch project & permission check -------------------------------
    project = _get_project_or_404(project_id, current_user)
    # 2. fetch milestone -------------------------------------------------
    milestone = _get_milestone_or_404(milestone_id, project_id)

    deleted_order = milestone.order

    # 3. delete (cascades clean tasks & subtasks) 
    milestone.delete()                # reverse_delete_rule handles children

    # 4. shift orders above the gap  (-1) 
    Milestone.objects(project_id=project_id, order__gt=deleted_order) \
             .update(dec__order=1)

    # 5. bump project timestamp 
    project.update(set__updated_at=datetime.now(tz=timezone.utc))

    return {"message": "Milestone deleted successfully"}