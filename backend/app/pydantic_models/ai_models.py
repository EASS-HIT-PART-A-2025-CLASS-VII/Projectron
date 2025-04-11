# app/services/ai_models.py
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, model_validator

"""
This file contains the Pydantic model definitions that define the data structures
used throughout the AI service. These models serve several critical purposes:

1. Input/Output Validation: They ensure data conforms to expected formats
2. Schema Definition: They document the expected structure of project plans
3. Default Value Handling: They provide intelligent defaults for missing data
4. Type Checking: They enforce proper data types for different fields
"""

class SubtaskModel(BaseModel):
    """
    Represents a subtask within a task.
    Subtasks are the smallest unit of work in the project hierarchy.
    """
    name: str = Field(description="Name of the subtask")
    status: str = Field(default="not_started", description="Status of the subtask")


class TaskModel(BaseModel):
    """
    Represents a task within a milestone.
    Tasks are concrete units of work that can be assigned and tracked.
    """
    name: str = Field(description="Name of the task")
    description: str = Field(description="Description of what the task involves")
    status: str = Field(default="not_started", description="Status of the task")
    priority: str = Field(default="medium", description="Priority of the task (low, medium, high)")
    estimated_hours: int = Field(description="Estimated hours to complete the task")
    dependencies: Optional[List[str]] = Field(default_factory=list, description="Names of tasks this depends on")
    subtasks: List[SubtaskModel] = Field(default_factory=list, description="List of subtasks for this task")


class MilestoneModel(BaseModel):
    """
    Represents a milestone in the project plan.
    Milestones group related tasks and mark significant project phases.
    """
    name: str = Field(description="Name of the milestone")
    description: str = Field(description="Description of what the milestone represents")
    status: str = Field(default="not_started", description="Status of the milestone")
    due_date_offset: Optional[int] = Field(default=None, description="Days from project start to milestone due date")
    tasks: List[TaskModel] = Field(description="List of tasks in this milestone")


class ProjectPlanModel(BaseModel):
    """
    Represents a complete project plan.
    This is the top-level model that contains all project components.
    """
    name: str = Field(description="Name of the project")
    description: str = Field(description="Detailed description of the project")
    status: str = Field(default="draft", description="Status of the project")
    tech_stack: List[str] = Field(default_factory=list, description="Technologies used in the project")
    experience_level: str = Field(description="Experience level required for the project")
    team_size: int = Field(default=1, description="Number of team members required")
    milestones: List[MilestoneModel] = Field(description="List of project milestones")
    
