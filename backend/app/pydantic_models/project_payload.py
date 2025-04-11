from typing import Any, Dict, List, Optional, Union
from bson import ObjectId
from pydantic import BaseModel, Field

# Request and response models
class ProjectInput(BaseModel):
    title: str
    description: str
    tech_stack: List[str] = []
    experience_level: str = "junior"  # e.g., "junior", "mid", "senior"
    team_size: int = 1

class ClarificationResponse(BaseModel):
    questions: List[str]

class PlanGenerationInput(BaseModel):
    title: str
    description: str
    tech_stack: List[str] = []
    experience_level: str = "junior" # e.g., "junior", "mid", "senior"
    team_size: int = 1
    clarifying_QA: Dict[str, str] = Field(default_factory=dict)

class PlanGeneratioResponse(BaseModel):
    structured_plan: Dict[str, Any]
    project_text: Union[Dict[str, Any], str] = ""
    
    class Config:
        json_encoders = {
            ObjectId: str
        }

class PlanRefinementInput(BaseModel):
    project_plan: Dict[str, Any]
    feedback: str

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
