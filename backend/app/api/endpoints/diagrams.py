# backend/app/api/endpoints/diagrams.py
from contextlib import asynccontextmanager
import json
import asyncio
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Response
from app.core.config import get_settings
from app.db.models.auth import User
from app.db.models.project import Project
from app.services.ai.class_diagram_service import generate_or_update_diagram, generate_svg_from_json
from app.api.deps import get_current_user
from typing import Optional
from pydantic import BaseModel
from app.services.ai.ai_utils import compact_json, create_llm
from app.services.ai.sequence_diagram_service import SequenceDiagramGenerator, generate_sequence_diagram

class DiagramRequest(BaseModel):
    project_id: str
    change_request: Optional[str] = None


class SVGResponse(Response):
    media_type = "image/svg+xml"

router = APIRouter()
settings = get_settings()


@router.get("/sequence/{project_id}", response_class=SVGResponse)
async def get_sequence_diagram(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get existing sequence diagram SVG for a project
    """
    try:
        project = Project.objects(id=ObjectId(project_id)).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check if user has access to this project
        if project.owner_id.id != current_user.id and current_user.id not in [collab.id for collab in project.collaborator_ids]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        if not project.sequence_diagram_svg:
            return None
        
        return SVGResponse(content=project.sequence_diagram_svg)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving sequence diagram: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving sequence diagram: {str(e)}"
        )

@router.get("/class/{project_id}", response_class=SVGResponse)
async def get_class_diagram(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get existing class diagram SVG for a project
    """
    try:
        project = Project.objects(id=ObjectId(project_id)).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check if user has access to this project
        if project.owner_id.id != current_user.id and current_user.id not in [collab.id for collab in project.collaborator_ids]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        if not project.class_diagram_svg:
            return None
        
        return SVGResponse(content=project.class_diagram_svg)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving class diagram: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving class diagram: {str(e)}"
        )

@router.get("/activity/{project_id}", response_class=SVGResponse)
async def get_activity_diagram(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get existing activity diagram SVG for a project
    """
    try:
        project = Project.objects(id=ObjectId(project_id)).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check if user has access to this project
        if project.owner_id.id != current_user.id and current_user.id not in [collab.id for collab in project.collaborator_ids]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        if not project.activity_diagram_svg:
            raise HTTPException(status_code=404, detail="No activity diagram found for this project")
        
        return SVGResponse(content=project.activity_diagram_svg)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving activity diagram: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving activity diagram: {str(e)}"
        )

# EXISTING ENDPOINTS (ENHANCED WITH BETTER ERROR HANDLING)

@router.get("/status")
async def diagram_service_status():
    """
    Get the status of the diagram generation service
    """
    try:
        from app.services.ai.sequence_diagram_service import get_global_generator
        
        global_generator = get_global_generator()
        
        if global_generator._is_circuit_open():
            return {
                "status": "unavailable",
                "reason": "circuit_breaker_open",
                "message": "Service temporarily unavailable due to repeated failures. Will retry automatically.",
                "failures": global_generator._circuit_breaker_failures,
                "reset_time": global_generator._circuit_breaker_reset_time
            }
        elif global_generator._initialized:
            return {
                "status": "available",
                "reason": "initialized",
                "message": "Diagram generation service is ready"
            }
        else:
            return {
                "status": "initializing",
                "reason": "not_initialized",
                "message": "Service will initialize on first diagram request"
            }
    except Exception as e:
        return {
            "status": "error",
            "reason": "exception",
            "message": f"Error checking service status: {str(e)}"
        }

@router.post("/sequence/create", response_class=SVGResponse)
async def create_sequence_diagram(
    request: DiagramRequest,
    current_user= Depends(get_current_user)
):
    """
    Generate a sequence diagram based on a project plan using sequencediagram.org
    Enhanced with comprehensive error handling and timeouts.
    """
    try:
        project = Project.objects(id=ObjectId(request.project_id)).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Create the LLM with the configured settings
        llm = create_llm(temperature=settings.DIAGRAM_TEMPERATURE, model='gpt-4.1-mini', timeout=140)
        
        # Generate the sequence diagram with timeout
        plan = project.description + "\n" + compact_json(project.technical_architecture)
        
        try:
            # Add overall timeout for the entire operation
            result = await asyncio.wait_for(
                generate_sequence_diagram(
                    project_plan=plan, 
                    llm=llm, 
                    use_json_intermediate=True,
                    use_local_chrome=False,
                    selenium_url=settings.SELENIUM_URL,
                ),
                timeout=300  # 5 minute total timeout
            )
        except asyncio.TimeoutError:
            raise HTTPException(
                status_code=504,
                detail="Diagram generation timed out. The diagram service may be temporarily unavailable. Please try again in a few minutes."
            )
        except Exception as e:
            error_msg = str(e)
            if "temporarily unavailable" in error_msg or "circuit breaker" in error_msg.lower():
                raise HTTPException(
                    status_code=503,
                    detail="Diagram service is temporarily unavailable due to technical issues. Please try again in a few minutes."
                )
            elif "timeout" in error_msg.lower():
                raise HTTPException(
                    status_code=504,
                    detail="Diagram generation timed out. Please try again with a simpler project description."
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate sequence diagram: {error_msg}"
                )
        
        if not result.get("success"):
            error_detail = result.get('error', 'Unknown error')
            if "timeout" in error_detail.lower():
                raise HTTPException(
                    status_code=504,
                    detail="Diagram generation timed out. Please try again with a simpler project description."
                )
            elif "temporarily unavailable" in error_detail or "circuit breaker" in error_detail.lower():
                raise HTTPException(
                    status_code=503,
                    detail="Diagram service is temporarily unavailable. Please try again in a few minutes."
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate sequence diagram: {error_detail}"
                )
        
        svg_content = result.get("svg")
        
        # Save to database
        project.sequence_diagram_source_code = result.get("diagram_source")
        project.sequence_diagram_svg = svg_content
        project.save() 
        
        return SVGResponse(content=svg_content)
    
    except HTTPException:
        raise
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
    Update a sequence diagram based on a project plan using sequencediagram.org
    Enhanced with comprehensive error handling and timeouts.
    """
    try:
        project = Project.objects(id=ObjectId(request.project_id)).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Create the LLM with the configured settings
        llm = create_llm(temperature=settings.DIAGRAM_TEMPERATURE)
        
        plan = project.description + "\n" + compact_json(project.technical_architecture)
        
        try:
            # Add overall timeout for the entire operation
            result = await asyncio.wait_for(
                generate_sequence_diagram(
                    project_plan=plan, 
                    existing_json=project.sequence_diagram_source_code,
                    llm=llm, 
                    use_json_intermediate=True,
                    use_local_chrome=False,
                    selenium_url=settings.SELENIUM_URL,
                ),
                timeout=300  # 5 minute total timeout
            )
        except asyncio.TimeoutError:
            raise HTTPException(
                status_code=504,
                detail="Diagram generation timed out. The diagram service may be temporarily unavailable. Please try again in a few minutes."
            )
        except Exception as e:
            error_msg = str(e)
            if "temporarily unavailable" in error_msg or "circuit breaker" in error_msg.lower():
                raise HTTPException(
                    status_code=503,
                    detail="Diagram service is temporarily unavailable due to technical issues. Please try again in a few minutes."
                )
            elif "timeout" in error_msg.lower():
                raise HTTPException(
                    status_code=504,
                    detail="Diagram generation timed out. Please try again with a simpler project description."
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate sequence diagram: {error_msg}"
                )
        
        if not result.get("success"):
            error_detail = result.get('error', 'Unknown error')
            if "timeout" in error_detail.lower():
                raise HTTPException(
                    status_code=504,
                    detail="Diagram generation timed out. Please try again with a simpler project description."
                )
            elif "temporarily unavailable" in error_detail or "circuit breaker" in error_detail.lower():
                raise HTTPException(
                    status_code=503,
                    detail="Diagram service is temporarily unavailable. Please try again in a few minutes."
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate sequence diagram: {error_detail}"
                )
        
        svg_content = result.get("svg")

        # Save to database
        project.sequence_diagram_source_code = result.get("diagram_source")
        project.sequence_diagram_svg = svg_content
        project.save() 
        
        return SVGResponse(content=svg_content)
    
    except HTTPException:
        raise
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