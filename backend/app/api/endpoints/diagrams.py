# backend/app/api/endpoints/diagrams.py
from contextlib import asynccontextmanager
from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends, Response
from app.core.config import get_settings
from app.services.ai.diagram_service import generate_or_update_diagram, generate_svg_from_json
from app.api.deps import get_current_user
from typing import Any, Dict, Optional
from pydantic import BaseModel

from app.services.ai.llm_utils import create_llm
from app.services.ai.sequence_diagram_generator import SequenceDiagramGenerator, generate_sequence_diagram

class DiagramRequest(BaseModel):
    project_plan: str
    existing_json: Optional[str] = None
    change_request: str
    diagram_type: str = "class"  # Default to class diagram, can be "class", "sequence", "usecase", "activity"


class DiagramResponse(BaseModel):
    mermaid_code: str
    diagram_type: str

# Define the request model
class SequenceDiagramRequest(BaseModel):
    project_plan: str
    existing_json: Optional[str] = None
    change_request: Optional[str] = None
    diagram_type: str = "sequence"  # For consistency with your existing API
    
# Define the response model
class SequenceDiagramResponse(BaseModel):
    svg: str
    diagram_source: str
    json: Optional[Dict[str, Any]] = None

class SVGResponse(Response):
    media_type = "image/svg+xml"

router = APIRouter()
settings = get_settings()

@asynccontextmanager
async def get_selenium_connection():
    generator = SequenceDiagramGenerator(
        selenium_url=settings.SELENIUM_URL,
        diagram_site_url=settings.SEQUENCE_DIAGRAM_SITE_URL,
        timeout=settings.SELENIUM_TIMEOUT
    )
    try:
        generator.connect()
        yield generator
    finally:
        generator.disconnect()

@router.post("/generate-sequence", response_class=SVGResponse)
async def generate_sequence_diagram_endpoint(
    request: DiagramRequest,
    current_user= Depends(get_current_user)
):
    """
    Generate a sequence diagram based on a project plan using sequencediagram.org
    
    Args:
        request: The diagram generation request containing project plan and optional context
        
    Returns:
        A DiagramResponse containing the SVG and related data
    """
    try:
        # Create the LLM with the configured settings
        llm = create_llm(temperature=settings.DIAGRAM_TEMPERATURE)
        
        # Generate the sequence diagram
        result = await generate_sequence_diagram(
            project_plan=request.project_plan, 
            llm=llm, 
            use_json_intermediate=True,
            use_local_chrome=False,
            selenium_url=settings.SELENIUM_URL,
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate sequence diagram: {result.get('error', 'Unknown error')}"
            )
        svg_content = result["svg"]
        
        return SVGResponse(content=svg_content)
        # Return the successful result
        # return SequenceDiagramResponse(
        #     svg=svg_content,
        #     diagram_source=result["diagram_source"],
        #     json=result.get("json")
        # )
    
    except Exception as e:
        print(f"Error generating sequence diagram: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating sequence diagram: {str(e)}"
        )
    

@router.post("/svg", response_class=Response)
async def get_svg_diagram(
    request: DiagramRequest,
    current_user= Depends(get_current_user)
) -> Response:
    """
    Generate or update a diagram based on the project plan and change request,
    convert it to SVG, and return the SVG content directly.
    """
    try:
        # Generate the structured diagram JSON representation
        diagram_json = await generate_or_update_diagram(
            project_plan=request.project_plan,
            existing_json=request.existing_json,
            change_request=request.change_request,
            diagram_type=request.diagram_type
        )
        
        # Convert the valid JSON into an SVG using our backend function.
        svg_content = generate_svg_from_json(diagram_json, request.diagram_type)
        
        return Response(
            content=svg_content,
            media_type="image/svg+xml"
        )
    except Exception as e:
        print(f"Error generating SVG: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to render diagram: {str(e)}")