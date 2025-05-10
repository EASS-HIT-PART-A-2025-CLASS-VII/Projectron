from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field

# High-Level Plan Models
class Risk(BaseModel):
    description: str
    impact: str
    mitigation: str

class TargetUser(BaseModel):
    type: str
    needs: List[str]
    pain_points: List[str]

class Scope(BaseModel):
    in_scope: List[str]
    out_of_scope: List[str]

class HighLevelPlan(BaseModel):
    name: str
    description: str
    vision: str
    business_objectives: List[str]
    target_users: List[TargetUser]
    core_features: List[str]
    scope: Scope
    success_criteria: List[str]
    constraints: List[str]
    assumptions: List[str]
    risks: List[Risk]
    tech_stack: List[str]
    status: str = "draft"

# Technical Architecture Models
class SystemComponent(BaseModel):
    name: str
    type: str
    description: str
    technologies: List[str]
    responsibilities: List[str]

class CommunicationPattern(BaseModel):
    source: str
    target: str
    protocol: str
    pattern: str
    description: str

class ArchitecturePattern(BaseModel):
    name: str
    description: str

class Infrastructure(BaseModel):
    hosting: str
    services: List[str]
    ci_cd: str

class TechnicalArchitecture(BaseModel):
    architecture_overview: str
    architecture_diagram_description: str
    system_components: List[SystemComponent]
    communication_patterns: List[CommunicationPattern]
    architecture_patterns: List[ArchitecturePattern]
    infrastructure: Infrastructure

# API Endpoints Models
class QueryParam(BaseModel):
    name: str
    type: str
    required: bool
    description: str

class RequestBody(BaseModel):
    type: str
    schema_data: Dict[str, Any]

class Request(BaseModel):
    query_params: Optional[List[QueryParam]] = Field(default_factory=list)
    body: Optional[RequestBody] = None

class ResponseError(BaseModel):
    status: int
    description: str

class ResponseSuccess(BaseModel):
    status: int
    content_type: str
    schema_data: Dict[str, Any]

class Response(BaseModel):
    success: ResponseSuccess
    errors: List[ResponseError]

class Endpoint(BaseModel):
    name: str
    method: str
    path: str
    description: str
    authentication_required: bool
    request: Request
    response: Response

class Resource(BaseModel):
    name: str
    description: str
    endpoints: List[Endpoint]

class Authentication(BaseModel):
    type: str
    description: str

class APIEndpoints(BaseModel):
    api_design_principles: List[str]
    base_url: str
    authentication: Authentication
    resources: List[Resource]

# Data Models Models
class Property(BaseModel):
    name: str
    type: str
    description: str
    required: bool

class Entity(BaseModel):
    name: str
    description: str
    properties: List[Property]

class Relationship(BaseModel):
    source_entity: str
    target_entity: str
    type: str
    description: str

class DataModels(BaseModel):
    entities: List[Entity]
    relationships: List[Relationship]

# UI Components Models
class Component(BaseModel):
    name: str
    type: str
    description: str
    functionality: str
    api_endpoints: List[str]
    data_displayed: List[str]

class Screen(BaseModel):
    name: str
    description: str
    route: str
    user_types: List[str]
    components: List[Component]

class UIComponents(BaseModel):
    screens: List[Screen]

# Detailed Implementation Plan Models
class Subtask(BaseModel):
    name: str
    status: str = "not_started"
    description: str

class Task(BaseModel):
    name: str
    description: str
    status: str = "not_started"
    priority: str
    estimated_hours: int = Field(..., ge=1, le=300)
    dependencies: List[str] = Field(default_factory=list)
    components_affected: List[str] = Field(default_factory=list)
    apis_affected: List[str] = Field(default_factory=list)
    subtasks: List[Subtask]

class Milestone(BaseModel):
    name: str
    description: str
    status: str = "not_started"
    due_date_offset: int
    tasks: List[Task]

class DetailedImplementationPlan(BaseModel):
    milestones: List[Milestone]

# Comprehensive Project Plan Model
class ComprehensiveProjectPlan(BaseModel):
    name: str
    description: str
    status: str = "draft"
    tech_stack: List[str]
    experience_level: str
    high_level_plan: Dict[str, Any]
    technical_architecture: Dict[str, Any]
    api_endpoints: Dict[str, Any]
    data_models: Dict[str, Any]
    ui_components: Dict[str, Any]
    implementation_plan: Dict[str, Any]