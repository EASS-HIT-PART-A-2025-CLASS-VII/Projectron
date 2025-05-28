# app/services/ai/context_generation_service.py
from typing import Any, Dict
from app.core.config import get_settings
from app.pydantic_models.context_models import DevelopmentContext
from app.services.ai.ai_utils import create_llm, compact_json
from app.services.ai.prompts.context_prompts import COMPREHENSIVE_DEVELOPMENT_CONTEXT_PROMPT
from app.utils.timing import timed

settings = get_settings()

# Initialize LLM models - GPT-4.1-mini as primary due to 1M context window
llm_41_mini = create_llm(temperature=0.1, json_mode=True, model="gpt-4.1-mini", timeout=180)
llm_4o_mini = create_llm(temperature=0.1, json_mode=True, model="gpt-4o-mini", timeout=180)
llm_41_nano = create_llm(temperature=0.1, json_mode=True, model="gpt-4.1-nano", timeout=180)

@timed
async def generate_comprehensive_context(
    project_data: Dict[str, Any], 
    context_notes: str = ""
) -> str:
    """
    Generate comprehensive development context in a single LLM call.
    Uses GPT-4.1-mini with 1M context window to process the entire project plan.
    """
    print("Generating comprehensive development context...")
    
    # Format the comprehensive prompt with all project data
    prompt = COMPREHENSIVE_DEVELOPMENT_CONTEXT_PROMPT.format(
        project_name=project_data.get("name", ""),
        project_description=project_data.get("description", ""),
        experience_level=project_data.get("experience_level", "junior"),
        team_size=project_data.get("team_size", 1),
        tech_stack=project_data.get("tech_stack", []),
        context_notes=context_notes or "No specific context notes provided",
        high_level_plan=compact_json(project_data.get("high_level_plan", {})),
        technical_architecture=compact_json(project_data.get("technical_architecture", {})),
        api_endpoints=compact_json(project_data.get("api_endpoints", {})),
        data_models=compact_json(project_data.get("data_models", {})),
        ui_components=compact_json(project_data.get("ui_components", {})),
        implementation_plan=compact_json(project_data.get("implementation_plan", {}))
    )
    
    # Generate context with single LLM call
    result = await execute_with_fallbacks(
        primary_llm=llm_41_mini,  # Primary: GPT-4.1-mini for 1M context window
        fallback_llms=[llm_4o_mini, llm_41_nano],
        structured_output_type=DevelopmentContext,
        prompt=prompt
    )
    
    print("Comprehensive context generation completed successfully")
    return result.context_message

async def execute_with_fallbacks(primary_llm, fallback_llms, structured_output_type, prompt):
    """
    Try to execute with primary LLM, fall back to others if it fails.
    """
    try:
        return await primary_llm.with_structured_output(structured_output_type).ainvoke(prompt)
    except Exception as e:
        print(f"Error with primary model (GPT-4.1-mini): {e}")
        for i, fallback_llm in enumerate(fallback_llms):
            try:
                print(f"Trying fallback model {i+1}/{len(fallback_llms)}...")
                return await fallback_llm.with_structured_output(structured_output_type).ainvoke(prompt)
            except Exception as e2:
                print(f"Error with fallback model {i+1}: {e2}")
                if i == len(fallback_llms) - 1:
                    raise
        
        raise RuntimeError("All models failed")