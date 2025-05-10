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

