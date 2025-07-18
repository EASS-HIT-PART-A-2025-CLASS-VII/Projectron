from typing import Any, Dict, List, TypedDict, Optional
from contextvars import ContextVar
from app.core.config import get_settings
from app.pydantic_models.ai_plan_models import APIEndpoints, ClarificationQuestions, DataModels, DetailedImplementationPlan, HighLevelPlan, TechnicalArchitecture, UIComponents
from app.pydantic_models.project_http_models import PlanGenerationInput
from app.services.ai.ai_utils import compact_json, create_llm, create_gemini_llm
from app.services.ai.prompts.plan_prompts import (
    CLARIFICATION_QUESTIONS_PROMPT,
    HIGH_LEVEL_PLAN_PROMPT,
    TECHNICAL_ARCHITECTURE_PROMPT,
    API_ENDPOINTS_PROMPT,
    DATA_MODELS_PROMPT,
    UI_COMPONENTS_PROMPT,
    DETAILED_IMPLEMENTATION_PLAN_PROMPT,
)
from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import InMemorySaver

from app.utils.timing import timed

settings = get_settings()

# Timeout configuration
STEP_TIMEOUT_SECONDS = 110

# Context variable for progress tracking (thread-safe and isolated per request)
_progress_context: ContextVar[Optional[Any]] = ContextVar('progress_context', default=None)

def set_current_progress(progress):
    """Set the current progress tracker for this request context"""
    _progress_context.set(progress)

def update_progress(step: str, step_number: int, status: str = 'processing'):
    """Update progress if available in current context"""
    progress = _progress_context.get()
    if progress:
        progress.update_progress(step, step_number, status)

class PlanState(TypedDict):
    name: str
    description: str
    status: str
    clarification_qa: Dict[str, str]
    tech_stack: List[str]
    experience_level: str
    total_hours: int
    team_size: int
    high_level_plan: HighLevelPlan
    technical_architecture: TechnicalArchitecture
    api_endpoints: APIEndpoints
    data_models: DataModels
    ui_components: UIComponents
    implementation_plan:DetailedImplementationPlan
    # Remove progress from state to avoid serialization issues

llm_4o_mini = create_llm(temperature=0.1, json_mode=True, model="gpt-4o-mini", timeout=STEP_TIMEOUT_SECONDS, max_retries=2)
llm_41_mini = create_llm(temperature=0.1, json_mode=True, model="gpt-4.1-mini", timeout=STEP_TIMEOUT_SECONDS, max_retries=2)
llm_41_nano = create_llm(temperature=0.1, json_mode=True, model="gpt-4.1-nano", timeout=STEP_TIMEOUT_SECONDS, max_retries=3)
llm_gemini = create_gemini_llm(temperature=0.1, timeout=STEP_TIMEOUT_SECONDS, max_retries=2)


async def generate_clarifying_questions(project_info: PlanGenerationInput) -> Dict[str, str]:
    """
    Generate clarification questions based on the project description.
    """
    prompt = CLARIFICATION_QUESTIONS_PROMPT.format(
        name=project_info.name,
        project_description=project_info.description,
        tech_stack=project_info.tech_stack,
        experience_level=project_info.experience_level,
        total_hours=project_info.total_hours,
        team_size=project_info.team_size
    )
    
    result = await llm_41_nano.with_structured_output(ClarificationQuestions).ainvoke(prompt)
    return result.model_dump()

@timed 
async def generate_plan(clarification_qa: Dict[str, str], project_info: PlanGenerationInput, user_id: str, progress: Optional[Any] = None) -> Dict[str, Any]:
    """
    Generate a complete project plan based on the description and answers to clarification questions.
    """
    # Set global progress tracker
    set_current_progress(progress)
    
    # Create the graph
    graph = create_graph()
    clarification_qa_str = "\n".join([
        f"Q: {q}\nA: {a}" for q, a in clarification_qa.items()
        ])
    
    config = {
        "configurable": {
        "thread_id": user_id
        }
    }
    # Set the initial state (without progress to avoid serialization issues)
    state = {
        "name": project_info.name,
        "description": project_info.description,
        "status": "draft",
        "clarification_qa": clarification_qa_str,
        "tech_stack": project_info.tech_stack,
        "experience_level": project_info.experience_level,
        "total_hours": project_info.total_hours,
        "team_size": project_info.team_size,
        "high_level_plan": {},
        "technical_architecture": {},
        "api_endpoints": {},
        "data_models": {},
        "ui_components": {},
        "implementation_plan": {}
    }
    
    # Run the graph
    result = await graph.ainvoke(state, config=config)
    
    # Clear context progress tracker
    set_current_progress(None)

    result = {
        "name": result["name"],
        "description": result["high_level_plan"].description if hasattr(result["high_level_plan"], "description") else result["description"],
        "status": result["status"],
        "clarification_qa": result["clarification_qa"],
        "tech_stack": result["tech_stack"],
        "experience_level": result["experience_level"],
        "total_hours": result["total_hours"],
        "team_size": result["team_size"],
        "high_level_plan": result["high_level_plan"].model_dump() if hasattr(result["high_level_plan"], "model_dump") else result["high_level_plan"],
        "technical_architecture": result["technical_architecture"].model_dump() if hasattr(result["technical_architecture"], "model_dump") else result["technical_architecture"],
        "api_endpoints": result["api_endpoints"].model_dump() if hasattr(result["api_endpoints"], "model_dump") else result["api_endpoints"],
        "data_models": result["data_models"].model_dump() if hasattr(result["data_models"], "model_dump") else result["data_models"],
        "ui_components": result["ui_components"].model_dump() if hasattr(result["ui_components"], "model_dump") else result["ui_components"],
        "implementation_plan": result["implementation_plan"].model_dump() if hasattr(result["implementation_plan"], "model_dump") else result["implementation_plan"]
    }
    
    return result

def create_graph():
    """
    Create a new graph for the project.
    """
        
    checkpointer = InMemorySaver()
    graph = StateGraph(PlanState)
    
    # Define constants for node names to avoid string mismatches
    HIGH_LEVEL = "high_level_node"
    ARCHITECTURE = "architecture_node"
    ENDPOINTS = "endpoints_node"
    MODELS = "models_node"
    COMPONENTS = "components_node"
    IMPLEMENTATION = "implementation_node"
    
    # Nodes with consistent naming
    graph.add_node(HIGH_LEVEL, generate_high_level_plan)
    graph.add_node(ARCHITECTURE, generate_technical_architecture)
    graph.add_node(ENDPOINTS, generate_api_endpoints)
    graph.add_node(MODELS, generate_data_models)
    graph.add_node(COMPONENTS, generate_ui_components)
    graph.add_node(IMPLEMENTATION, generate_implementation_plan)

    # Edges using the same node name constants
    graph.add_edge(START, HIGH_LEVEL)
    graph.add_edge(HIGH_LEVEL, ARCHITECTURE)
    graph.add_edge(ARCHITECTURE, ENDPOINTS)
    graph.add_edge(ENDPOINTS, MODELS)
    graph.add_edge(MODELS, COMPONENTS)
    graph.add_edge(COMPONENTS, IMPLEMENTATION)
    graph.add_edge(IMPLEMENTATION, END)

    return graph.compile(checkpointer=checkpointer)


async def generate_high_level_plan(state: PlanState):
    """
    Generate a high-level plan for the project.
    """
    print("Generating high-level plan...")
    
    # Update progress using global tracker
    update_progress("Generating high-level plan", 2)
    
    # Calculate extended hours (1.5x) here
    extended_hours = int(state["total_hours"] * 1.5)
    
    prompt = HIGH_LEVEL_PLAN_PROMPT.format(
        project_name=state["name"],
        project_description=state["description"],
        experience_level=state["experience_level"],
        team_size=state["team_size"], 
        tech_stack=state["tech_stack"],
        total_hours=state["total_hours"],
        extended_hours=extended_hours,
        clarification_qa=state["clarification_qa"]
    )

    result = await execute_with_fallbacks(primary_llm=llm_4o_mini,
                                    fallback_llms=[llm_gemini, llm_41_nano, llm_41_mini],
                                   structured_output_type=HighLevelPlan,
                                   prompt=prompt)

    return { "high_level_plan" : result }    
    
async def generate_technical_architecture(state: PlanState):
    """
    Generate the technical architecture for the project.
    """
    print("Generating technical architecture...")
    
    # Update progress using global tracker
    update_progress("Generating technical architecture", 3)
    
    # Calculate extended hours (1.5x)
    extended_hours = int(state["total_hours"] * 1.5)
    
    # Extract high-level plan information to avoid dictionary access in the template
    high_level_plan = state["high_level_plan"]
    vision = high_level_plan.vision
    business_objectives = ", ".join(high_level_plan.business_objectives)
    core_features = ", ".join(high_level_plan.core_features)
    scope_in = ", ".join(high_level_plan.scope.in_scope)
    scope_out = ", ".join(high_level_plan.scope.out_of_scope)
    scope = f"In scope: {scope_in}. Out of scope: {scope_out}"
    constraints = ", ".join(high_level_plan.constraints)
    
    prompt = TECHNICAL_ARCHITECTURE_PROMPT.format(
        project_name=state["name"],
        project_description=state["description"],
        experience_level=state["experience_level"],
        team_size=state["team_size"], 
        tech_stack=state["tech_stack"],
        total_hours=state["total_hours"],
        extended_hours=extended_hours,
        vision=vision,
        business_objectives=business_objectives,
        core_features=core_features,
        scope=scope,
        constraints=constraints
    )

    result = await execute_with_fallbacks(primary_llm=llm_4o_mini,
                                    fallback_llms=[llm_gemini, llm_41_nano, llm_41_mini],
                                   structured_output_type=TechnicalArchitecture,
                                   prompt=prompt)
    
    return { "technical_architecture" : result }
    
async def generate_api_endpoints(state: PlanState):
    """
    Generate the API endpoints for the project.
    """
    print("Generating API endpoints...")
    
    # Update progress using global tracker
    update_progress("Generating API endpoints", 4)
    
    # Calculate extended hours (1.5x)
    extended_hours = int(state["total_hours"] * 1.5)
    
    # Extract high-level plan information
    high_level_plan = state["high_level_plan"]
    try:
        core_features = ", ".join(high_level_plan.core_features)
    except (AttributeError, TypeError):
        core_features = "No core features defined"
    
    # Format target users
    target_users = []
    try:
        for user in high_level_plan.target_users:
            try:
                user_str = f"{user.type} (Needs: {', '.join(user.needs)}; Pain points: {', '.join(user.pain_points)})"
                target_users.append(user_str)
            except (AttributeError, TypeError):
                continue
    except (AttributeError, TypeError):
        pass
    target_users_str = "; ".join(target_users) if target_users else "No specific target users defined"
    
    try:
        business_objectives = ", ".join(high_level_plan.business_objectives)
    except (AttributeError, TypeError):
        business_objectives = "No business objectives defined"
    
    try:
        scope_in = ", ".join(high_level_plan.scope.in_scope)
        scope_out = ", ".join(high_level_plan.scope.out_of_scope)
        scope = f"In scope: {scope_in}. Out of scope: {scope_out}"
    except (AttributeError, TypeError):
        scope = "Scope not defined"
    
    # Extract technical architecture information
    tech_arch = state["technical_architecture"]
    try:
        architecture_overview = tech_arch.architecture_overview
    except (AttributeError, TypeError):
        architecture_overview = "No architecture overview defined"
    
    # Format system components
    system_components = []
    try:
        for comp in tech_arch.system_components:
            try:
                comp_str = f"{comp.name} ({comp.type}): {comp.description}"
                system_components.append(comp_str)
            except (AttributeError, TypeError):
                continue
    except (AttributeError, TypeError):
        pass
    system_components_str = "; ".join(system_components) if system_components else "No system components defined"
    
    # Format communication patterns
    comm_patterns = []
    try:
        for pattern in tech_arch.communication_patterns:
            try:
                pattern_str = f"{pattern.source} to {pattern.target} via {pattern.protocol} ({pattern.pattern})"
                comm_patterns.append(pattern_str)
            except (AttributeError, TypeError):
                continue
    except (AttributeError, TypeError):
        pass
    comm_patterns_str = "; ".join(comm_patterns) if comm_patterns else "No communication patterns defined"
    
    # Format architecture patterns
    arch_patterns = []
    try:
        for pattern in tech_arch.architecture_patterns:
            try:
                pattern_str = f"{pattern.name}: {pattern.description}"
                arch_patterns.append(pattern_str)
            except (AttributeError, TypeError):
                continue
    except (AttributeError, TypeError):
        pass
    arch_patterns_str = "; ".join(arch_patterns) if arch_patterns else "No architecture patterns defined"
    
    prompt = API_ENDPOINTS_PROMPT.format(
        project_name=state["name"],
        project_description=state["description"],
        tech_stack=state["tech_stack"],
        total_hours=state["total_hours"],
        extended_hours=extended_hours,
        core_features=core_features,
        target_users=target_users_str,
        business_objectives=business_objectives,
        scope=scope,
        architecture_overview=architecture_overview,
        system_components=system_components_str,
        communication_patterns=comm_patterns_str,
        architecture_patterns=arch_patterns_str
    )
    
    result = await execute_with_fallbacks(primary_llm=llm_4o_mini,
                                    fallback_llms=[llm_41_nano, llm_41_mini, llm_gemini],
                                   structured_output_type=APIEndpoints,
                                   prompt=prompt)
    
    return { "api_endpoints" : result }
    
async def generate_data_models(state: PlanState):
    """
    Generate the data models for the project.
    """
    print("Generating data models...")
    
    # Update progress using global tracker
    update_progress("Generating data models", 5)
    
    # Calculate extended hours (1.5x)
    extended_hours = int(state["total_hours"] * 1.5)
    
    # Extract API resources

    api_endpoints = state["api_endpoints"]
    try:
        resource_names = [r.name for r in api_endpoints.resources]
        resources_str = ", ".join(resource_names)
    except (AttributeError, TypeError):
        resources_str = "No API resources defined"
    try:    
        auth_type = api_endpoints.authentication.type
    except (AttributeError, TypeError):
        auth_type = "No authentication defined"

    prompt = DATA_MODELS_PROMPT.format(
        project_name=state["name"],
        project_description=state["description"],
        tech_stack=state["tech_stack"],
        total_hours=state["total_hours"],
        extended_hours=extended_hours,
        resources=resources_str,
        authentication=auth_type
    )
    
    result = await execute_with_fallbacks(primary_llm=llm_41_mini,
                                    fallback_llms=[llm_4o_mini, llm_41_nano, llm_gemini],
                                   structured_output_type=DataModels,
                                   prompt=prompt)
    
    return { "data_models" : result }
    
async def generate_ui_components(state: PlanState):
    """
    Generate the UI components for the project.
    """
    print("Generating UI components...")
    
    # Update progress using global tracker
    update_progress("Generating UI components", 6)
    
    # Calculate extended hours (1.5x)
    extended_hours = int(state["total_hours"] * 1.5)
    
    # Extract high-level plan information
    high_level_plan = state["high_level_plan"]
    try:
        core_features = ", ".join(high_level_plan.core_features)
    except (AttributeError, TypeError):
        core_features = "No core features defined"
    
    # Format target users
    target_users = []
    try:
        for user in high_level_plan.target_users:
            try:
                user_str = f"{user.type} (Needs: {', '.join(user.needs)}; Pain points: {', '.join(user.pain_points)})"
                target_users.append(user_str)
            except (AttributeError, TypeError):
                continue
    except (AttributeError, TypeError):
        pass
    target_users_str = "; ".join(target_users) if target_users else "No specific target users defined"
    
    # Extract frontend components from technical architecture
    tech_arch = state["technical_architecture"]
    frontend_components = []
    try:
        for comp in tech_arch.system_components:
            try:
                if any(keyword in comp.name.lower() for keyword in ["frontend", "ui", "client"]):
                    comp_str = f"{comp.name}: {comp.description} (Technologies: {', '.join(comp.technologies)})"
                    frontend_components.append(comp_str)
            except (AttributeError, TypeError):
                continue
    except (AttributeError, TypeError):
        pass
    frontend_components_str = "; ".join(frontend_components) if frontend_components else "No specific frontend components defined"
    
    # Extract API resources
    api_resources = []
    try:
        api_resources = [r.name for r in state["api_endpoints"].resources]
    except (AttributeError, TypeError):
        pass
    api_resources_str = ", ".join(api_resources) if api_resources else "No API resources defined"
    
    # Extract data entities
    data_entities = []
    try:
        data_entities = [e.name for e in state["data_models"].entities]
    except (AttributeError, TypeError):
        pass
    data_entities_str = ", ".join(data_entities) if data_entities else "No data entities defined"
    
    prompt = UI_COMPONENTS_PROMPT.format(
        project_name=state["name"],
        project_description=state["description"],
        tech_stack=state["tech_stack"],
        total_hours=state["total_hours"],
        extended_hours=extended_hours,
        core_features=core_features,
        target_users=target_users_str,
        frontend_components=frontend_components_str,
        api_resources=api_resources_str,
        data_entities=data_entities_str
    )
    
    result = await execute_with_fallbacks(primary_llm=llm_41_mini,
                                    fallback_llms=[llm_4o_mini, llm_41_nano, llm_gemini],
                                   structured_output_type=UIComponents,
                                   prompt=prompt)
    
    return { "ui_components" : result }
    
async def generate_implementation_plan(state: PlanState):
    """
    Generate the detailed implementation plan for the project.
    """
    print("Generating detailed implementation plan...")
    
    # Update progress using global tracker
    update_progress("Generating implementation plan", 7)
    
    # Calculate extended hours (1.5x)
    extended_hours = int(state["total_hours"] * 1.5)
    
    # Extract system components
    system_components = []
    try:
        tech_arch = state["technical_architecture"]
        for c in tech_arch.system_components:
            try:
                system_components.append(c.name)
            except (AttributeError, TypeError):
                continue
    except (AttributeError, TypeError):
        pass
    system_components_str = ", ".join(system_components) if system_components else "No system components defined"
    
    # Extract API resources
    api_resources = []
    try:
        for r in state["api_endpoints"].resources:
            try:
                api_resources.append(r.name)
            except (AttributeError, TypeError):
                continue
    except (AttributeError, TypeError):
        pass
    api_resources_str = ", ".join(api_resources) if api_resources else "No API resources defined"
    
    # Extract data entities
    data_entities = []
    try:
        for e in state["data_models"].entities:
            try:
                data_entities.append(e.name)
            except (AttributeError, TypeError):
                continue
    except (AttributeError, TypeError):
        pass
    data_entities_str = ", ".join(data_entities) if data_entities else "No data entities defined"
    
    # Extract UI screens
    ui_screens = []
    try:
        for s in state["ui_components"].screens:
            try:
                ui_screens.append(s.name)
            except (AttributeError, TypeError):
                continue
    except (AttributeError, TypeError):
        pass
    ui_screens_str = ", ".join(ui_screens) if ui_screens else "No UI screens defined"
    
    prompt = DETAILED_IMPLEMENTATION_PLAN_PROMPT.format(
        project_name=state["name"],
        project_description=state["description"],
        tech_stack=state["tech_stack"],
        total_hours=state["total_hours"],
        extended_hours=extended_hours,
        system_components=system_components_str,
        api_resources=api_resources_str,
        data_entities=data_entities_str,
        ui_screens=ui_screens_str
    )

    result = await execute_with_fallbacks(primary_llm=llm_41_mini,
                                    fallback_llms=[llm_4o_mini, llm_41_nano, llm_gemini],
                                   structured_output_type=DetailedImplementationPlan,
                                   prompt=prompt)
    
    return { "implementation_plan" : result }
   
async def execute_with_fallbacks(primary_llm, fallback_llms, structured_output_type, prompt):
    """
    Try to execute with primary LLM, fall back to others if it fails.
    
    Args:
        primary_llm: The primary LLM to try first
        fallback_llms: List of fallback LLMs to try in order
        structured_output_type: Pydantic model for structured output
        prompt: The formatted prompt to send
        
    Returns:
        The result from the first successful LLM
    """
    gemini_prompt = f"""{prompt}

            IMPORTANT: Respond with valid JSON format only that matches this exact schema:
            {compact_json(structured_output_type.model_json_schema())}

            Return only the JSON object, no additional text."""
    try:
        if hasattr(primary_llm, 'model') and "gemini" in str(primary_llm.model).lower():
            result = await primary_llm.with_structured_output(structured_output_type).ainvoke(prompt)
        else:
            result = await primary_llm.with_structured_output(structured_output_type).ainvoke(prompt)
        if not result:
            raise ValueError("Primary model returned empty result")
        return result
    except Exception as e:
        print(f"Error with primary model: {e}")
        for i, fallback_llm in enumerate(fallback_llms):
            try:
                print(f"Trying fallback model {i+1}/{len(fallback_llms)}...")
                # Add JSON instruction for Gemini
                if hasattr(fallback_llm, 'model') and 'gemini' in fallback_llm.model.lower():
                    return await fallback_llm.with_structured_output(structured_output_type).ainvoke(gemini_prompt)
                else:
                    return await fallback_llm.with_structured_output(structured_output_type).ainvoke(prompt)
            except Exception as e2:
                print(f"Error with fallback model {i+1}: {e2}")
                if i == len(fallback_llms) - 1:
                    # This was the last fallback, re-raise the error
                    raise
        
        # We should never reach here but just in case
        raise RuntimeError("All models failed")


