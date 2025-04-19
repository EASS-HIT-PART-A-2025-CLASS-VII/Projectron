from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from bson import ObjectId
from pydantic import BaseModel, Field


class ClarificationResponse(BaseModel):
    questions: List[str]

class TimeScale(str, Enum):
    SMALL = "small"    # < 40 hours
    MEDIUM = "medium"  # 40-100 hours
    LARGE = "large"    # 100-300 hours
    CUSTOM = "custom"  # User-defined

class PlanGenerationInput(BaseModel):
    name: str
    description: str
    tech_stack: List[str] = []
    experience_level: str = "junior" # e.g., "junior", "mid", "senior"
    team_size: int = 1
    time_scale: TimeScale = TimeScale.MEDIUM  # Default to medium
    custom_hours: Optional[int] = Field(None, ge=1, le=1000)

    @property
    def total_hours(self) -> int:
        """Calculate the total hours based on time scale or custom hours"""
        hours_map = {
            TimeScale.SMALL: 40,
            TimeScale.MEDIUM: 100,
            TimeScale.LARGE: 300,
        }
        
        if self.time_scale == TimeScale.CUSTOM:
            return self.custom_hours or 100  # Fallback if somehow None
        
        return hours_map.get(self.time_scale, 100)

class PlanGeneratioResponse(BaseModel):
    structured_plan: Dict[str, Any]
    project_id: str
    
    class Config:
        json_encoders = {
            ObjectId: str
        }

class PlanRefinementInput(BaseModel):
    project_id: str
    feedback: str


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

class MilestonePatch(BaseModel):
    name:        str | None = None
    description: str | None = None
    status:      str | None = Field(None, pattern="^(not_started|in_progress|completed)$")
    due_date:    datetime | None = None
    order:       int | None = Field(None, ge=0)

class TaskSuggestionInput(BaseModel):
    milestone_name: str
    milestone_description: str
    existing_tasks: List[Dict[str, Any]] = []
    project_context: str

class TimeEstimationInput(BaseModel):
    task_name: str
    task_description: str
    project_context: str

class TaskSuggestionResponse(BaseModel):
    suggested_tasks: List[Dict[str, Any]]

class TaskCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    status: Optional[str] = Field("not_started", pattern="^(not_started|in_progress|completed)$")
    priority: Optional[str] = Field("medium", pattern="^(low|medium|high)$")
    estimated_hours: Optional[int] = 0
    components_affected: List[str] = []
    apis_affected: List[str] = []
    order: Optional[int] = None
    due_date: Optional[datetime] = None

class TaskPatch(TaskCreate):
    name: Optional[str] = None

class SubtaskCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    status: Optional[str] = Field("not_started", pattern="^(not_started|in_progress|completed)$")
    order: Optional[int] = None

class SubtaskPatch(SubtaskCreate):
    name: Optional[str] = None    # everything optional for patch