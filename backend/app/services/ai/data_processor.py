# app/services/data_processor.py
from pydantic import ValidationError
from typing import Dict, Tuple, Any, Type
import json
import logging
from .llm_utils import create_chain, extract_json_from_text
from ...pydantic_models.ai_models import ProjectPlanModel, MilestoneModel, TaskModel, SubtaskModel

logger = logging.getLogger(__name__)

"""
This file contains data processing functions that validate and repair
structured data from AI outputs. It works with Pydantic models to ensure
data quality and implements fallback mechanisms when validation fails.

These functions make the AI service more robust by handling unexpected
outputs and providing graceful degradation paths.
"""

async def validate_with_model(data: Dict, model_class: Type, max_retries: int = 3) -> Tuple[Dict, bool, str]:
    """
    Validates data against a Pydantic model with multiple retry attempts.
    
    This function tries to validate the data and, if validation fails, attempts
    to repair it before trying again. This makes the system more resilient to
    minor LLM output variations.
    
    Args:
        data: The data dictionary to validate
        model_class: The Pydantic model class to validate against
        max_retries: Number of repair attempts before falling back
    
    Returns:
        Tuple of (validated_data, success_flag, error_message)
    """
    for attempt in range(max_retries):
        try:
            # Try to validate with the model
            validated_model = model_class(**data)
            return validated_model.dict(), True, ""
        except ValidationError as e:
            error_message = str(e)
            logger.warning(f"Validation error (attempt {attempt+1}/{max_retries}): {error_message}")
            
            if attempt < max_retries - 1:
                # Try to repair the data before next attempt
                data = await repair_data_structure(data, error_message, model_class)
            else:
                # All retries failed
                return apply_default_values(data, model_class), False, error_message


async def repair_data_structure(invalid_data: Dict, error_message: str, model_class: Type) -> Dict:
    """
    Uses LLM to repair invalid data structures based on validation errors.
    
    This function sends the validation error, invalid data, and expected schema
    to the LLM to attempt an intelligent repair of the structure.
    
    Args:
        invalid_data: The data that failed validation
        error_message: The validation error message
        model_class: The Pydantic model class that defines the expected structure
    
    Returns:
        Repaired data dictionary (best effort)
    """
    model_schema = model_class.schema_json(indent=2)
    invalid_data_str = json.dumps(invalid_data, indent=2)
    
    prompt_template = """
    You are a data structure repair expert. Fix the following invalid data structure based on the validation error:
    
    VALIDATION ERROR:
    {error_message}
    
    INVALID DATA:
    {invalid_data}
    
    EXPECTED SCHEMA:
    {model_schema}
    
    Return ONLY the fixed JSON with no additional text. Ensure it follows the schema exactly.
    Make thoughtful fixes based on the validation error.
    """
    
    chain = create_chain(prompt_template, repair_mode=True)
    result = await chain.ainvoke({
        "error_message": error_message,
        "invalid_data": invalid_data_str,
        "model_schema": model_schema
    })
    
    response_text = result.get("text", "")
    
    # Extract repaired JSON
    repaired_data, success = await extract_json_from_text(
        response_text, 
        expected_start_char="{", 
        expected_end_char="}"
    )
    
    if success and isinstance(repaired_data, dict):
        return repaired_data
    
    # If repair failed, return the original with minimal fixes
    return manually_fix_common_issues(invalid_data, error_message, model_class)


def manually_fix_common_issues(data: Dict, error_message: str, model_class: Type) -> Dict:
    """
    Applies hardcoded fixes for common validation issues.
    
    This function provides a last line of defense for data repair by applying
    deterministic fixes to common issues like missing fields, incorrect types, etc.
    
    Args:
        data: The data dictionary to fix
        error_message: The validation error message for targeted fixes
        model_class: The model class for type-specific fixes
    
    Returns:
        Fixed data dictionary
    """
    
    fixed_data = dict(data)  # Create a copy to modify
    
    # Handle missing required fields
    if "field required" in error_message.lower():
        if model_class == ProjectPlanModel:
            if "name" not in fixed_data or not fixed_data["name"]:
                fixed_data["name"] = "Untitled Project"
            if "description" not in fixed_data or not fixed_data["description"]:
                fixed_data["description"] = "Project details to be determined."
            if "milestones" not in fixed_data or not fixed_data["milestones"]:
                fixed_data["milestones"] = [{
                    "name": "Project Setup",
                    "description": "Initial project planning and setup",
                    "status": "not_started",
                    "tasks": [{
                        "name": "Project Initialization",
                        "description": "Set up project structure and environment",
                        "status": "not_started",
                        "priority": "medium",
                        "estimated_hours": 8,
                        "dependencies": [],
                        "subtasks": []
                    }]
                }]
        
        elif model_class == MilestoneModel:
            if "name" not in fixed_data or not fixed_data["name"]:
                fixed_data["name"] = "Untitled Milestone"
            if "description" not in fixed_data or not fixed_data["description"]:
                fixed_data["description"] = "Milestone details to be determined."
            if "tasks" not in fixed_data or not fixed_data["tasks"]:
                fixed_data["tasks"] = [{
                    "name": "Task 1",
                    "description": "Task details to be determined",
                    "status": "not_started",
                    "priority": "medium",
                    "estimated_hours": 4,
                    "dependencies": [],
                    "subtasks": []
                }]
        
        elif model_class == TaskModel:
            if "name" not in fixed_data or not fixed_data["name"]:
                fixed_data["name"] = "Untitled Task"
            if "description" not in fixed_data or not fixed_data["description"]:
                fixed_data["description"] = "Task details to be determined."
            if "estimated_hours" not in fixed_data:
                fixed_data["estimated_hours"] = 4
    
    # Handle type conversion issues
    if "value is not a valid integer" in error_message:
        if "estimated_hours" in fixed_data and not isinstance(fixed_data["estimated_hours"], int):
            try:
                fixed_data["estimated_hours"] = int(float(fixed_data["estimated_hours"]))
            except (ValueError, TypeError):
                fixed_data["estimated_hours"] = 4
    
    # Handle nested structures
    if model_class == ProjectPlanModel and "milestones" in fixed_data:
        for i, milestone in enumerate(fixed_data["milestones"]):
            if not isinstance(milestone, dict):
                fixed_data["milestones"][i] = {
                    "name": "Untitled Milestone",
                    "description": "Milestone details to be determined.",
                    "status": "not_started",
                    "tasks": [{
                        "name": "Task 1",
                        "description": "Task details to be determined",
                        "status": "not_started",
                        "priority": "medium",
                        "estimated_hours": 4,
                        "dependencies": [],
                        "subtasks": []
                    }]
                }
            elif "tasks" not in milestone or not milestone["tasks"]:
                fixed_data["milestones"][i]["tasks"] = [{
                    "name": "Task 1",
                    "description": "Task details to be determined",
                    "status": "not_started",
                    "priority": "medium",
                    "estimated_hours": 4,
                    "dependencies": [],
                    "subtasks": []
                }]
    
    return fixed_data


def apply_default_values(data: Dict, model_class: Type) -> Dict:
    """
    Creates a minimum viable object by applying default values.
    
    This is used as a last resort when validation and repair attempts fail.
    It tries to preserve as much of the original data as possible while
    ensuring the result meets minimum structural requirements.
    
    Args:
        data: The original data dictionary
        model_class: The model class defining the structure
    
    Returns:
        A minimally valid version of the data
    """    
    # Create a minimum viable object based on the model
    if model_class == ProjectPlanModel:
        minimum_viable = {
            "name": data.get("name", "Untitled Project"),
            "description": data.get("description", "Auto-generated project plan"),
            "status": "draft",
            "milestones": []
        }
        
        # Try to salvage any valid milestones
        if "milestones" in data and isinstance(data["milestones"], list):
            for milestone in data["milestones"]:
                if isinstance(milestone, dict) and "name" in milestone:
                    valid_milestone = {
                        "name": milestone.get("name", "Untitled Milestone"),
                        "description": milestone.get("description", "Milestone details"),
                        "status": "not_started",
                        "tasks": []
                    }
                    
                    # Try to salvage tasks
                    if "tasks" in milestone and isinstance(milestone["tasks"], list):
                        for task in milestone["tasks"]:
                            if isinstance(task, dict) and "name" in task:
                                valid_task = {
                                    "name": task.get("name", "Untitled Task"),
                                    "description": task.get("description", "Task details"),
                                    "status": "not_started",
                                    "priority": "medium",
                                    "estimated_hours": task.get("estimated_hours", 4) if isinstance(task.get("estimated_hours"), int) else 4,
                                    "dependencies": [],
                                    "subtasks": []
                                }
                                valid_milestone["tasks"].append(valid_task)
                    
                    # Ensure at least one task
                    if not valid_milestone["tasks"]:
                        valid_milestone["tasks"] = [{
                            "name": "Task 1",
                            "description": "Auto-generated task",
                            "status": "not_started",
                            "priority": "medium",
                            "estimated_hours": 4,
                            "dependencies": [],
                            "subtasks": []
                        }]
                    
                    minimum_viable["milestones"].append(valid_milestone)
        
        # Ensure at least one milestone
        if not minimum_viable["milestones"]:
            minimum_viable["milestones"] = [{
                "name": "Project Setup",
                "description": "Initial project setup and planning",
                "status": "not_started",
                "tasks": [{
                    "name": "Project Initialization",
                    "description": "Create project structure and setup environment",
                    "status": "not_started",
                    "priority": "medium",
                    "estimated_hours": 8,
                    "dependencies": [],
                    "subtasks": []
                }]
            }]
        
        return minimum_viable
    
    # For other models, return the data as is (with potential validation errors)
    return data