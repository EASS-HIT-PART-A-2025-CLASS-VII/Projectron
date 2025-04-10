# app/services/project_ai_service.py
from typing import List, Dict, Union
import json
import logging

from app.api.endpoints.ai import ProjectInput
from app.pydantic_models.project_payload import PlanGenerationInput
from ...core.config import get_settings
from .llm_utils import create_chain, extract_json_from_text
from .data_processor import validate_with_model
from ...pydantic_models.ai_models import ProjectPlanModel
from .prompt_templates import (
    CLARIFICATION_QUESTIONS_TEMPLATE,
    DETAILED_PLAN_TEXT_TEMPLATE,
    TEXT_TO_STRUCTURED_TEMPLATE,
    REFINE_PLAN_TEMPLATE,
)

settings = get_settings()
logger = logging.getLogger(__name__)

"""
This is the core service class that handles AI-assisted project planning.
It orchestrates the interaction between the API, the language models,
and the data processing utilities to provide a robust project planning service.

The class implements the business logic for all project planning operations
while handling edge cases and ensuring reliable output even when LLM
responses are unexpected.
"""

class ProjectAIService:
    """Service for AI-assisted project planning using LangChain and GPT-4o-mini."""
    
    def __init__(self):
        """Initialize the service with settings and logging."""
        logger.info("Initializing ProjectAIService")

    async def generate_clarification_questions(
    self, 
    project_info: Union[str, ProjectInput], 
    existing_questions: List[str] = None
    ) -> List[str]:
        """
        Generate clarification questions for a project description.
        
        This helps project stakeholders identify missing information and
        refine the project scope before detailed planning begins.
        
        Args:
            project_description: Text describing the project
            existing_questions: Previously asked questions to avoid duplication
            
        Returns:
            List of clarification questions
        """
        # Prepare context for existing questions if provided
        existing_questions_context = ""
        if existing_questions and len(existing_questions) > 0:
            existing_questions_text = "\n".join([f"- {q}" for q in existing_questions])
            existing_questions_context = f"""
            Previously asked questions (avoid repeating these):
            {existing_questions_text}
            """
        if isinstance(project_info, ProjectInput):
            project_description = project_info.model_dump()
        else:
            project_description = project_info
    
        # Create and run the LLM chain
        chain = create_chain(CLARIFICATION_QUESTIONS_TEMPLATE)
        result = await chain.ainvoke({
            "project_description": project_description,
            "existing_questions_context": existing_questions_context
        })
        
        response_text = result.get("text", "").strip()
        
        # Extract and parse the response
        questions, success = await extract_json_from_text(
            response_text, 
            expected_start_char="[", 
            expected_end_char="]"
        )
        
        if success and isinstance(questions, list):
            return questions
        
        # If parsing fails, create a fallback list
        logger.warning("Failed to generate proper clarification questions, using fallback questions")
        return [
            "What architecture pattern will this project follow (microservices, monolith, serverless)?",
            "What are the primary APIs or external services this application will interact with?",
            "What are the database requirements and expected data models?",
            "What are the specific deployment and hosting requirements?",
            "What are the most complex technical challenges anticipated in this project?"
        ]
    
    async def generate_detailed_plan_text(self, project:PlanGenerationInput) -> str:
        """
        Generate a detailed project plan in text format.
        
        This is the first step in the two-step plan generation process,
        creating a comprehensive text description that will later be
        converted to structured data.
        
        Args:
            project_description: Text describing the project
            project_requirements: List of project requirements
            clarification_answers: Optional dict of Q&A from clarification phase
            
        Returns:
            Detailed project plan in text format
        """
        # Prepare clarification context if provided
        clarification_context = ""
        if project.clarifying_QA and len(project.clarifying_QA) > 0:
            clarification_text = "\n".join([f"Q: {q}\nA: {a}" for q, a in project.clarifying_QA.items()])
            clarification_context = f"""
            Additional Information from Clarification Questions:
            {clarification_text}
            """
        
        # Format requirements as bullet points
        
        # Create and run the LLM chain
        chain = create_chain(DETAILED_PLAN_TEXT_TEMPLATE)
        result = await chain.ainvoke({
            "project_description": project.model_dump(),
            "clarification_context": clarification_context
        })
        
        return result.get("text", "")
    
    async def convert_text_plan_to_structured_data(self, text_plan: str, project_name: str = None) -> Dict:
        """
        Convert a text-based project plan to structured data.
        
        This is the second step in the plan generation process, transforming
        the free-form text plan into a structured JSON format that matches
        our data models.
        
        Args:
            text_plan: The detailed text plan from previous step
            project_name: Optional project name to use
            
        Returns:
            Structured project plan data
        """
        max_retries = 3
        
        # Prepare context for project name
        if project_name:
            project_name_context = f"The project name is: {project_name}"
        else:
            project_name_context = "Extract the project name from the text plan."
        
        # Use the template for structured conversion
        prompt_template = TEXT_TO_STRUCTURED_TEMPLATE
        
        for attempt in range(max_retries):
            print("Attempt - ", attempt)
            try:
                # Create a chain with lower temperature for structured output
                chain = create_chain(prompt_template, temperature=0.1)
                
                result = await chain.ainvoke({
                    "text_plan": text_plan,
                    "project_name_context": project_name_context
                })
                
                response_text = result.get("text", "").strip()
                
                # Extract the JSON
                structured_plan, success = await extract_json_from_text(
                    response_text, 
                    expected_start_char="{", 
                    expected_end_char="}"
                )
                
                if success and isinstance(structured_plan, dict):
                    # Validate with the Pydantic model
                    validated_plan, is_valid, error_message = await validate_with_model(
                        structured_plan, 
                        ProjectPlanModel
                    )
                    
                    if is_valid:
                        return validated_plan
                    else:
                        # If it's the last attempt, return the best-effort plan with a warning flag
                        if attempt == max_retries - 1:
                            return {
                                **validated_plan,
                                "_validation_warning": error_message
                            }
                        # Otherwise, try again with a modified prompt
                        prompt_template += f"\n\nPrevious attempt had these validation errors: {error_message}\nFix these issues specifically."
                
                # If we reach here, either JSON extraction or validation failed
                logger.warning(f"Attempt {attempt+1}/{max_retries} failed to produce valid structured data")
                
                # For subsequent attempts, refine the prompt
                if attempt < max_retries - 1:
                    prompt_template += "\n\nYOUR PREVIOUS RESPONSE HAD FORMATTING OR STRUCTURAL ISSUES. ENSURE YOU RETURN A VALID JSON OBJECT WITH THE EXACT STRUCTURE REQUESTED."
            
            except Exception as e:
                logger.error(f"Error in structured data conversion (attempt {attempt+1}): {str(e)}")
                
                if attempt == max_retries - 1:
                    # Create a minimal valid plan as a fallback
                    fallback_plan = {
                        "name": project_name or "Untitled Project",
                        "description": "Project plan conversion encountered errors. Please review and update.",
                        "status": "draft",
                        "milestones": [{
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
                        }],
                        "_conversion_error": str(e)
                    }
                    return fallback_plan
        
        # If all attempts fail, create a fallback plan
        fallback_plan = {
            "name": project_name or "Untitled Project",
            "description": "Project plan conversion failed. Please create a plan manually.",
            "status": "draft",
            "milestones": [{
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
            }],
            "_conversion_error": "Failed to convert text plan to structured data after multiple attempts"
        }
        
        return fallback_plan
    
    async def generate_project_plan(self, project_info: Union[str, PlanGenerationInput]) -> Dict:
        """
        Generate a complete project plan using a two-step process.
        
        This is the main entry point for plan generation, orchestrating the
        text plan generation followed by conversion to structured data.
        
        Args:
            project_description: Text describing the project
            project_requirements: List of project requirements
            project_name: Optional project name
            clarification_answers: Optional dict of Q&A from clarification phase
            
        Returns:
            Dict containing both structured plan and text plan
        """
        # Step 1: Generate detailed text plan
        text_plan = await self.generate_detailed_plan_text(project_info)
        
        # Step 2: Convert text plan to structured data
        structured_plan = await self.convert_text_plan_to_structured_data(text_plan, project_info.title)
        
        # Return both for debugging/reference
        return {
            "structured_plan": structured_plan,
            "text_plan": text_plan
        }
    
    async def refine_project_plan(self, current_plan: Dict, feedback: str) -> Dict:
        """
        Refine an existing project plan based on feedback.
        
        This allows iterative improvement of project plans by incorporating
        stakeholder feedback and additional information.
        
        Args:
            current_plan: The existing project plan
            feedback: Textual feedback to incorporate
            
        Returns:
            Updated project plan
        """
        max_retries = 3
        
        # Convert the current plan to a string for the prompt
        current_plan_str = json.dumps(current_plan, indent=2)
        
        # Use the refine plan template
        prompt_template = REFINE_PLAN_TEMPLATE
        
        for attempt in range(max_retries):
            try:
                chain = create_chain(prompt_template)
                result = await chain.ainvoke({
                    "current_plan": current_plan_str,
                    "feedback": feedback
                })
                
                response_text = result.get("text", "")
                
                # Extract the JSON
                refined_plan, success = await extract_json_from_text(
                    response_text, 
                    expected_start_char="{", 
                    expected_end_char="}"
                )
                
                if success and isinstance(refined_plan, dict):
                    # Validate with Pydantic model
                    validated_plan, is_valid, error_message = await validate_with_model(
                        refined_plan, 
                        ProjectPlanModel
                    )
                    
                    if is_valid:
                        return validated_plan
                    elif attempt == max_retries - 1:
                        # If it's the last attempt, return the best-effort plan with a warning flag
                        return {
                            **validated_plan,
                            "_validation_warning": error_message
                        }
                    else:
                        # Update the prompt to address specific validation issues
                        prompt_template += f"\n\nThe previous response had these validation errors: {error_message}\nPlease fix these specific issues."
                else:
                    logger.warning(f"Failed to extract valid JSON from response (attempt {attempt+1})")
            except Exception as e:
                logger.error(f"Error in plan refinement (attempt {attempt+1}): {str(e)}")
                
                if attempt == max_retries - 1:
                    # If all attempts fail, try to keep as much of the original plan as possible
                    return {
                        **current_plan,
                        "_refinement_error": str(e),
                        "feedback_applied": feedback
                    }
        
        # This should only be reached if all attempts fail
        return {
            **current_plan,
            "_refinement_error": "Failed to refine plan after multiple attempts",
            "feedback_applied": feedback
        }
    