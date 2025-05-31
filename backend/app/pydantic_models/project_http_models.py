from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from bson import ObjectId
from pydantic import BaseModel, Field, field_validator


class ClarificationResponse(BaseModel):
    questions: List[str]

class ClarificationQA(BaseModel):
    """Model for clarification questions and answers with validation"""
    qa_pairs: Dict[str, str] = Field(default={}, description="Question-answer pairs")

    @field_validator('qa_pairs')
    @classmethod
    def validate_qa_pairs(cls, v):
        if not v:
            return {}
        
        validated_pairs = {}
        
        for question, answer in v.items():
            # Validate question
            if not question or not question.strip():
                continue  # Skip empty questions
            
            # Validate answer
            if not answer:
                answer = ""  # Allow empty answers
            else:
                answer = answer.strip()
                
                # Count words (split by whitespace)
                word_count = len(answer.split()) if answer else 0
                
                if word_count > 3500:
                    raise ValueError(
                        f'Answer for question "{question[:50]}..." exceeds 2000 words '
                        f'(current: {word_count} words). Please provide a shorter answer.'
                    )
            
            validated_pairs[question.strip()] = answer
        
        return validated_pairs

    def to_dict(self) -> Dict[str, str]:
        """Convert to simple dictionary for backward compatibility"""
        return self.qa_pairs


class TimeScale(str, Enum):
    SMALL = "small"    # < 40 hours
    MEDIUM = "medium"  # 40-100 hours
    LARGE = "large"    # 100-300 hours
    CUSTOM = "custom"  # User-defined

class PlanGenerationInput(BaseModel):
    name: str = Field(..., max_length=200, description="Project name (max 200 characters)")
    description: str = Field(..., max_length=7000, description="Project description")
    tech_stack: List[str] = Field(default=[], max_items=100, description="Technology stack")
    experience_level: str = "junior" # e.g., "junior", "mid", "senior"
    team_size: int = 1
    time_scale: TimeScale = TimeScale.MEDIUM  # Default to medium
    custom_hours: Optional[int] = Field(None, ge=1, le=2000)

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Project name cannot be empty')
        if len(v.strip()) < 2:
            raise ValueError('Project name must be at least 2 characters long')
        return v.strip()

    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        if not v or not v.strip():
            raise ValueError('Project description cannot be empty')
        if len(v.strip()) < 10:
            raise ValueError('Project description must be at least 10 characters long')
        return v.strip()

    @field_validator('tech_stack')
    @classmethod
    def validate_tech_stack(cls, v):
        if v is None:
            return []
        
        # Remove empty strings and duplicates while preserving order
        cleaned_stack = []
        seen = set()
        for item in v:
            if item and item.strip() and item.strip().lower() not in seen:
                cleaned_item = item.strip()
                cleaned_stack.append(cleaned_item)
                seen.add(cleaned_item.lower())
        
        return cleaned_stack

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

