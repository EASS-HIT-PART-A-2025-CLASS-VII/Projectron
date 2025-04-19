
from fastapi import HTTPException
from app.db.models.auth import User
from app.db.models.project import Project, Milestone, Task


def _clamp(n: int, hi: int) -> int:
    return 0 if n < 0 else (hi if n > hi else n)

def _get_project_or_404(pid: str, user: User):
    proj = Project.objects(id=pid).first() or _404("Project")
    if proj.owner_id.id != user.id:
        print(f"User {user.id} is not the owner of project {pid}")
        raise HTTPException(403, "Not authorised")
    return proj

def _get_milestone_or_404(mid: str, pid: str):
    return Milestone.objects(id=mid, project_id=pid).first() or _404("Milestone")

def _get_task_or_404(tid: str, mid: str, pid: str):
    return Task.objects(id=tid, milestone_id=mid, project_id=pid).first() or _404("Task")

def _404(msg): 
    print(f"Could not find {msg}")
    raise HTTPException(404, f"{msg} not found")