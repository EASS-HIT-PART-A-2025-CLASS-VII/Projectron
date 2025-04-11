from .crud import CRUDBase
from ..db.models.auth import User
from ..db.models.project import Project, Milestone, Task, Subtask
from ..db.models.conversation import AIConversation

# Create repositories for each model
user_repo = CRUDBase(User)
project_repo = CRUDBase(Project)
milestone_repo = CRUDBase(Milestone)
task_repo = CRUDBase(Task)
subtask_repo = CRUDBase(Subtask)
conversation_repo = CRUDBase(AIConversation)