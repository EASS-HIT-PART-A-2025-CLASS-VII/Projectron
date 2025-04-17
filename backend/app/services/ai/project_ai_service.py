from typing import Dict, List, Any
from langchain.chains import LLMChain
from langchain.output_parsers.json import SimpleJsonOutputParser
import json
from langchain.prompts import ChatPromptTemplate
from app.pydantic_models.project_http_models import PlanGenerationInput
from app.core.config import get_settings
from app.services.ai.ai_utils import create_llm
from app.services.ai.validations import validate_and_repair_json
from app.pydantic_models.ai_plan_models import (
    HighLevelPlan,
    TechnicalArchitecture,
    APIEndpoints,
    DataModels,
    UIComponents,
    DetailedImplementationPlan,
    ComprehensiveProjectPlan
)
from app.services.ai.plan_prompts import (
    CLARIFICATION_QUESTIONS_PROMPT,
    HIGH_LEVEL_PLAN_PROMPT,
    TECHNICAL_ARCHITECTURE_PROMPT,
    API_ENDPOINTS_PROMPT,
    DATA_MODELS_PROMPT,
    UI_COMPONENTS_PROMPT,
    DETAILED_IMPLEMENTATION_PLAN_PROMPT,
    TEXT_PLAN_PROMPT,
    REFINE_PROJECT_PLAN_PROMPT
)
import logging
from ...core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class ProjectAIService:
    """Service for AI-powered project planning features with logical progression"""
    
    def __init__(self):
        self.llm = create_llm()
        self.llm_repair_mode = create_llm(temperature=0.4)



    def create_chain(self, prompt_template: str, output_parser=None, repair_mode=False, temperature=0.2):
        """
        Creates a LangChain chain with the given prompt template and configuration.
        
        Args:
            prompt_template: The template text with variables for the prompt
            output_parser: Optional parser to structure the LLM output
            repair_mode: If True, uses the repair LLM with higher temperature
        
        Returns:
            A configured LangChain Chain ready to be invoked
        """
        # Create the template
        prompt = ChatPromptTemplate.from_template(prompt_template)
        llm = self.llm_repair_mode if repair_mode else self.llm
        # Create the LLM        
        # Debug info
        logger.debug(f"Creating chain with prompt template: {prompt_template[:50]}...")
        
        # Create and return the chain
        if output_parser:
            return LLMChain(llm=llm, prompt=prompt, output_parser=output_parser)
        return LLMChain(llm=llm, prompt=prompt)
    
    async def generate_clarification_questions(self, project_info: PlanGenerationInput) -> List[str]:
        """Generate clarification questions for a project description"""
        
        chain = self.create_chain(
            prompt_template=CLARIFICATION_QUESTIONS_PROMPT,
            output_parser=SimpleJsonOutputParser()
        )
        
        result = await chain.ainvoke({
            "project_description": json.dumps(project_info),
            "total_hours": project_info.total_hours,
        })
        
        return result.get("text", "")
    
    async def generate_project_plan(self, project_info: PlanGenerationInput, clarification_qa: Dict[str, str] = {}) -> Dict[str, Any]:
        """Generate a comprehensive project plan based on description and clarification answers"""
        
        # Step 1: Generate high-level project vision and scope
        high_level_plan = await self._generate_high_level_plan(project_info, clarification_qa)
        
        # Step 2: Generate technical architecture based on high-level plan
        technical_architecture = await self._generate_technical_architecture(project_info, high_level_plan)
        
        # Step 3: Generate API endpoints based on architecture and high-level plan
        api_endpoints = await self._generate_api_endpoints(project_info, high_level_plan, technical_architecture)
        
        # Step 4: Generate data models based on architecture, APIs, and high-level plan
        data_models = await self._generate_data_models(project_info, high_level_plan, technical_architecture, api_endpoints)
        
        # Step 5: Generate UI components based on high-level plan, APIs, and data models
        ui_components = await self._generate_ui_components(project_info, high_level_plan, api_endpoints, data_models)
        
        # Step 6: Generate detailed milestones, tasks, and subtasks based on all previous information
        detailed_plan = await self._generate_detailed_implementation_plan(
            project_info,
            high_level_plan,
            technical_architecture,
            api_endpoints,
            data_models,
            ui_components
        )
        
        # Step 7: Compile everything into a comprehensive project plan
        comprehensive_plan = await self._compile_comprehensive_plan(
            high_level_plan,
            technical_architecture,
            api_endpoints,
            data_models,
            ui_components,
            detailed_plan
        )
        
        # Additional step: Generate a textual overview of the plan
        # text_plan = await self._generate_text_plan(comprehensive_plan)
        
        return {
            "structured_plan": comprehensive_plan
        }
    
    async def _generate_high_level_plan(self, project_info: PlanGenerationInput, clarification_qa: Dict[str,str]={}) -> Dict[str, Any]:
        """Generate a high-level project plan with vision, objectives, and scope"""
        
        # Format clarification Q&A as a list for better prompt readability
        print("generating high level plan...")
        clarification_qa_str = "\n".join([
            f"Q: {q}\nA: {a}" for q, a in clarification_qa.items()
            ])
        
        chain = self.create_chain(
            prompt_template=HIGH_LEVEL_PLAN_PROMPT,
            output_parser=SimpleJsonOutputParser()
        )
        
        result = await chain.ainvoke(
            {"project_title": project_info.title,
            "project_description": project_info.description,
            "total_hours": project_info.total_hours,
            "tech_stack": project_info.tech_stack,
            "experience_level": project_info.experience_level,
            "team_size": project_info.team_size,
            "clarification_qa": clarification_qa_str}
        )
        
        print(type(result))
        print(str(result)[:40])
        # Validate and repair the response if needed
        validated_result = await validate_and_repair_json(
            response=result.get("text", ""),
            model=HighLevelPlan,
            llm_chain_creator=self.create_chain
        )
        print("finished generating high level plan")
        
        return validated_result
    
    async def _generate_technical_architecture(self, project_info: PlanGenerationInput, high_level_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed technical architecture based on the high-level plan"""
        
        print("generating technical architecture...")

        chain = self.create_chain(
            prompt_template=TECHNICAL_ARCHITECTURE_PROMPT,
            output_parser=SimpleJsonOutputParser()
        )
        
        result = await chain.ainvoke(
            {"high_level_plan_json":json.dumps(high_level_plan),
             "total_hours": project_info.total_hours,
            "project_description":project_info.description,}
        )
        
        print(type(result))
        print(str(result)[:40])
        # Validate and repair the response if needed
        validated_result = await validate_and_repair_json(
            response=result.get("text", ""),
            model=TechnicalArchitecture,
            llm_chain_creator=self.create_chain
        )
        
        print("finished generating technical architecture")
        return validated_result
    
    async def _generate_api_endpoints(
        self, 
        project_info: PlanGenerationInput, 
        high_level_plan: Dict[str, Any],
        technical_architecture: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate API endpoints documentation based on high-level plan and technical architecture"""
        
        print("generating api endpoints...")

        chain = self.create_chain(
            prompt_template=API_ENDPOINTS_PROMPT,
            output_parser=SimpleJsonOutputParser()
        )
        
        result = await chain.ainvoke(
            {"high_level_plan_json":json.dumps(high_level_plan),
             "total_hours": project_info.total_hours,
            "technical_architecture_json":json.dumps(technical_architecture)}
        )
        
        print(type(result))
        print(str(result)[:40])
        # Validate and repair the response if needed
        validated_result = await validate_and_repair_json(
            response=result.get("text", ""),
            model=APIEndpoints,
            llm_chain_creator=self.create_chain
        )
        
        print("finished generating api endpoints")

        return validated_result
    
    async def _generate_data_models(
        self, 
        project_info: PlanGenerationInput, 
        high_level_plan: Dict[str, Any],
        technical_architecture: Dict[str, Any],
        api_endpoints: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate database schema and data models based on all previous planning"""
        
        print("generating data models...")

        chain = self.create_chain(
            prompt_template=DATA_MODELS_PROMPT,
            output_parser=SimpleJsonOutputParser()
        )
        
        result = await chain.ainvoke(
            {"high_level_plan_json":json.dumps(high_level_plan),
            "technical_architecture_json":json.dumps(technical_architecture),
            "total_hours": project_info.total_hours,
            "api_endpoints_json":json.dumps(api_endpoints)}
        )
        
        print(type(result))
        print(str(result)[:40])
        # Validate and repair the response if needed
        validated_result = await validate_and_repair_json(
            response=result.get("text", ""),
            model=DataModels,
            llm_chain_creator=self.create_chain
        )
        
        print("finished generating data models")

        return validated_result
    
    async def _generate_ui_components(
        self, 
        project_info: PlanGenerationInput, 
        high_level_plan: Dict[str, Any],
        api_endpoints: Dict[str, Any],
        data_models: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate UI components breakdown based on all previous planning"""
        
        print("generating ui components...")

        chain = self.create_chain(
            prompt_template=UI_COMPONENTS_PROMPT,
            output_parser=SimpleJsonOutputParser()
        )
        
        result = await chain.ainvoke(
            {"high_level_plan_json":json.dumps(high_level_plan),
            "api_endpoints_json":json.dumps(api_endpoints),
            "total_hours": project_info.total_hours,
            "data_models_json":json.dumps(data_models)}
        )
        
        print(type(result))
        print(str(result)[:40])
        # Validate and repair the response if needed
        validated_result = await validate_and_repair_json(
            response=result.get("text", ""),
            model=UIComponents,
            llm_chain_creator=self.create_chain
        )
        
        print("finished generating ui components")

        return validated_result
    
    async def _generate_detailed_implementation_plan(
        self,
        project_info: PlanGenerationInput,
        high_level_plan: Dict[str, Any],
        technical_architecture: Dict[str, Any],
        api_endpoints: Dict[str, Any],
        data_models: Dict[str, Any],
        ui_components: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate detailed milestones, tasks, and subtasks based on all previous planning"""
        
        print("generating detailed implementation plan...")

        chain = self.create_chain(
            prompt_template=DETAILED_IMPLEMENTATION_PLAN_PROMPT,
            output_parser=SimpleJsonOutputParser()
        )
        
        result = await chain.ainvoke(
            {"high_level_plan_json":json.dumps(high_level_plan),
            "technical_architecture_json":json.dumps(technical_architecture),
            "api_endpoints_json":json.dumps(api_endpoints),
            "data_models_json":json.dumps(data_models),
            "total_hours": project_info.total_hours,
            "ui_components_json":json.dumps(ui_components)}
        )
        
        print(type(result))
        print(str(result)[:40])
        # Validate and repair the response if needed
        validated_result = await validate_and_repair_json(
            response=result.get("text", ""),
            model=DetailedImplementationPlan,
            llm_chain_creator=self.create_chain
        )
        
        print("finished generating detailed implementation plan")

        return validated_result
    
    async def _compile_comprehensive_plan(
        self,
        high_level_plan: Dict[str, Any],
        technical_architecture: Dict[str, Any],
        api_endpoints: Dict[str, Any],
        data_models: Dict[str, Any],
        ui_components: Dict[str, Any],
        detailed_plan: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Compile all components into a comprehensive project plan"""
        
        # Start with the high-level plan info
        comprehensive_plan = {
            "name": high_level_plan.get("name", "Untitled Project"),
            "description": high_level_plan.get("description", ""),
            "status": high_level_plan.get("status", "draft"),
            "tech_stack": high_level_plan.get("tech_stack", []),
            "experience_level": high_level_plan.get("experience_level", "mid"),
            "high_level_plan": {
                "vision": high_level_plan.get("vision", ""),
                "business_objectives": high_level_plan.get("business_objectives", []),
                "target_users": high_level_plan.get("target_users", []),
                "core_features": high_level_plan.get("core_features", []),
                "scope": high_level_plan.get("scope", {}),
                "success_criteria": high_level_plan.get("success_criteria", []),
                "constraints": high_level_plan.get("constraints", []),
                "assumptions": high_level_plan.get("assumptions", []),
                "risks": high_level_plan.get("risks", []),
            },
            "technical_architecture": technical_architecture,
            "api_endpoints": api_endpoints,
            "data_models": data_models,
            "ui_components": ui_components,
            "implementation_plan": detailed_plan.get("milestones", [])
        }
        
        # Validate the comprehensive plan (optional)
        # This is just to ensure the structure is valid, not to repair it
        try:
            ComprehensiveProjectPlan(**comprehensive_plan)
            print("Comprehensive plan validated successfully.✅")
        except Exception as e:
            print(f"Warning: Comprehensive plan validation failed: {str(e)}")
            
        return comprehensive_plan
    
    async def _generate_text_plan(self, comprehensive_plan: Dict[str, Any]) -> str:
        """Generate a textual overview of the project plan"""
        print("generating text plan...")

        chain = self.create_chain(
            prompt_template=TEXT_PLAN_PROMPT
        )
        
        result = await chain.ainvoke(
            {"project_json": json.dumps(comprehensive_plan)}
        )
        
        print("finished generating text plan")

        return result.get("text", "")
    
    async def refine_project_plan(self, current_plan: Dict[str, Any], feedback: str) -> Dict[str, Any]:
        """Refine an existing project plan based on feedback"""
        
        chain = self.create_chain(
            prompt_template=REFINE_PROJECT_PLAN_PROMPT,
            output_parser=SimpleJsonOutputParser()
        )
        
        result = await chain.ainvoke(
            {"current_plan_json":json.dumps(current_plan),
             "total_hours": current_plan.get("total_hours", 100),
            "feedback":feedback}
        )
        
        # No validation here as we don't know the exact structure of the refined plan
        # It should maintain the same structure as the current plan
        
        return result