# backend/app/api/endpoints/diagrams.py
from contextlib import asynccontextmanager
import json
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Response
from app.core.config import get_settings
from app.db.models.auth import User
from app.db.models.project import Project
from app.services.ai.diagram_service import generate_or_update_diagram, generate_svg_from_json
from app.api.deps import get_current_user
from typing import Optional
from pydantic import BaseModel
from app.services.ai.ai_utils import compact_json, create_llm
from app.services.ai.sequence_diagram_generator import SequenceDiagramGenerator, generate_sequence_diagram

class DiagramRequest(BaseModel):
    project_id: str
    change_request: Optional[str] = None


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

@router.post("/sequence/create", response_class=SVGResponse)
async def create_sequence_diagram(
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
        project = Project.objects(id=ObjectId(request.project_id)).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        # Create the LLM with the configured settings
        llm = create_llm(temperature=settings.DIAGRAM_TEMPERATURE, model='gpt-4.1-mini')
        
        # Generate the sequence diagram
        plan = project.description + "\n" + compact_json(project.technical_architecture)
        result = await generate_sequence_diagram(
            project_plan=plan, 
            llm=llm, 
            use_json_intermediate=True,
            use_local_chrome=False,
            selenium_url=settings.SELENIUM_URL,
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate sequence diagram: {result.get('error', 'Unknown error')}"
            )
        svg_content = result.get("svg")
        
        project.sequence_diagram_source_code = result.get("diagram_source")
        project.sequence_diagram_svg = svg_content
        project.save() 
        return SVGResponse(content=svg_content)
    
    except Exception as e:
        print(f"Error generating sequence diagram: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating sequence diagram: {str(e)}"
        )
    
@router.put("/sequence/update", response_class=SVGResponse)
async def update_sequence_diagram(
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
        project = Project.objects(id=ObjectId(request.project_id)).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        # Create the LLM with the configured settings
        llm = create_llm(temperature=settings.DIAGRAM_TEMPERATURE)
        
        plan = project.description + "\n" + compact_json(project.technical_architecture)
        # Generate the sequence diagram
        result = await generate_sequence_diagram(
            project_plan=plan, 
            existing_json=project.sequence_diagram_source_code,
            llm=llm, 
            use_json_intermediate=True,
            use_local_chrome=False,
            selenium_url=settings.SELENIUM_URL,
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate sequence diagram: {result.get('error', 'Unknown error')}"
            )
        svg_content = result.get("svg")

        project.sequence_diagram_source_code = result.get("diagram_source")
        project.sequence_diagram_svg = svg_content
        project.save() 
        
        return SVGResponse(content=svg_content)
    
    except Exception as e:
        print(f"Error generating sequence diagram: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating sequence diagram: {str(e)}"
        )
    
@router.post("/class/create", response_class=Response)
async def create_class_diagram(
    request: DiagramRequest,
    current_user: User = Depends(get_current_user)
) -> Response:
    """
    Create a new class diagram based on the project plan
    """
    try:
        project = Project.objects(id=ObjectId(request.project_id)).first()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        plan = project.description + "\n" + "Data Models" + compact_json(project.data_models) + "\n" + "System components:" + compact_json(project.technical_architecture.get("system_components"))
        # Generate the class diagram JSON representation
        diagram_json = await generate_or_update_diagram(
            project_plan=plan,
            existing_json=None,  # No existing JSON for creation
            change_request=request.change_request,
            diagram_type="class"
        )
        
        # Convert the JSON into an SVG
        svg_content = generate_svg_from_json(diagram_json, "class")
        

        project.class_diagram_json = diagram_json
        project.class_diagram_svg = svg_content
        project.save()

        return SVGResponse(content=svg_content)

    except Exception as e:
        print(f"Error creating class diagram SVG: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create diagram: {str(e)}")


@router.put("/class/update", response_class=Response)
async def update_class_diagram(
    request: DiagramRequest,
    current_user: User = Depends(get_current_user)
) -> Response:
    """
    Update an existing class diagram based on the project plan and change request
    """
    try:
        project = Project.objects(id=ObjectId(request.project_id)).first()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Generate the updated class diagram JSON representation
        plan = project.description + "\n" + compact_json(project.technical_architecture)

        diagram_json = await generate_or_update_diagram(
            project_plan=plan,
            existing_json=json.dumps(project.class_diagram_json),
            change_request=request.change_request,
            diagram_type="class"
        )
        
        # Convert the JSON into an SVG
        svg_content = generate_svg_from_json(diagram_json, "class")
        
        project.class_diagram_json = diagram_json
        project.class_diagram_svg = svg_content
        project.save()
        
        return SVGResponse(content=svg_content)
    
    except Exception as e:
        print(f"Error updating class diagram SVG: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update diagram: {str(e)}")


@router.post("/activity/create", response_class=Response)
async def create_activity_diagram(
    request: DiagramRequest,
    current_user: User = Depends(get_current_user)
) -> Response:
    """
    Create a new activity diagram based on the project plan
    """
    try:
        project = Project.objects(id=ObjectId(request.project_id)).first()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Generate the activity diagram JSON representation
        plan = project.description + "\n" + compact_json(project.technical_architecture)

        diagram_json = await generate_or_update_diagram(
            project_plan=plan,
            existing_json=None,
            change_request=request.change_request,
            diagram_type="activity"
        )
        
        # Convert the JSON into an SVG
        svg_content = generate_svg_from_json(diagram_json, "activity")
        
        project.activity_diagram_json = diagram_json
        project.activity_diagram_svg = svg_content
        project.save()

        return SVGResponse(content=svg_content)

    except Exception as e:
        print(f"Error creating activity diagram SVG: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create diagram: {str(e)}")


@router.put("/activity/update", response_class=Response)
async def update_activity_diagram(
    request: DiagramRequest,
    current_user: User = Depends(get_current_user)
) -> Response:
    """
    Update an existing activity diagram based on the project plan and change request
    """
    try:
        project = Project.objects(id=ObjectId(request.project_id)).first()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Generate the updated activity diagram JSON representation
        plan = project.description + "\n" + compact_json(project.technical_architecture)

        diagram_json = await generate_or_update_diagram(
            project_plan=plan,
            existing_json=project.activity_diagram_json,
            change_request=request.change_request,
            diagram_type="activity"
        )
        
        # Convert the JSON into an SVG
        svg_content = generate_svg_from_json(diagram_json, "activity")
        
        project.activity_diagram_json = diagram_json
        project.activity_diagram_svg = svg_content
        project.save()
        
        return SVGResponse(content=svg_content)

    except Exception as e:
        print(f"Error updating activity diagram SVG: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update diagram: {str(e)}")