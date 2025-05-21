from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field

class ClarificationQuestions(BaseModel):
    questions: List[str]
    
# High-Level Plan Models
class Risk(BaseModel):
    description: str
    impact: str
    mitigation: str
    
    class Config:
        extra = "forbid"

class TargetUser(BaseModel):
    type: str
    needs: List[str]
    pain_points: List[str]
    
    class Config:
        extra = "forbid"

class Scope(BaseModel):
    in_scope: List[str]
    out_of_scope: List[str]
    
    class Config:
        extra = "forbid"

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
    status: str
    
    class Config:
        extra = "forbid"

# Technical Architecture Models
class SystemComponent(BaseModel):
    name: str
    type: str
    description: str
    technologies: List[str]
    responsibilities: List[str]
    
    class Config:
        extra = "forbid"

class CommunicationPattern(BaseModel):
    source: str
    target: str
    protocol: str
    pattern: str
    description: str
    
    class Config:
        extra = "forbid"

class ArchitecturePattern(BaseModel):
    name: str
    description: str
    
    class Config:
        extra = "forbid"

class Infrastructure(BaseModel):
    hosting: str
    services: List[str]
    ci_cd: str
    
    class Config:
        extra = "forbid"

class TechnicalArchitecture(BaseModel):
    architecture_overview: str
    architecture_diagram_description: str
    system_components: List[SystemComponent]
    communication_patterns: List[CommunicationPattern]
    architecture_patterns: List[ArchitecturePattern]
    infrastructure: Infrastructure
    
    class Config:
        extra = "forbid"

# API Endpoints Models
class QueryParam(BaseModel):
    name: str
    type: str
    required: bool
    description: str
    
    class Config:
        extra = "forbid"

class JSONSchemaObject(BaseModel):
    """Holds an arbitrary JSON schema definition."""
    class Config:
        extra = "forbid"

class RequestBody(BaseModel):
    type: str
    schema_data: JSONSchemaObject


class Request(BaseModel):
    query_params: Optional[List[QueryParam]] = Field(default_factory=list)
    body: Optional[RequestBody]
    
    class Config:
        extra = "forbid"

class ResponseError(BaseModel):
    status: int
    description: str
    
    class Config:
        extra = "forbid"


class ResponseSuccess(BaseModel):
    status: int
    content_type: str
    schema_data: JSONSchemaObject     


class Response(BaseModel):
    success: ResponseSuccess
    errors: List[ResponseError]
    
    class Config:
        extra = "forbid"

class Endpoint(BaseModel):
    name: str
    method: str
    path: str
    description: str
    authentication_required: bool
    request: Request
    response: Response
    
    class Config:
        extra = "forbid"

class Resource(BaseModel):
    name: str
    description: str
    endpoints: List[Endpoint]
    
    class Config:
        extra = "forbid"

class Authentication(BaseModel):
    type: str
    description: str
    
    class Config:
        extra = "forbid"

class APIEndpoints(BaseModel):
    api_design_principles: List[str]
    base_url: str
    authentication: Authentication
    resources: List[Resource]
    
    class Config:
        extra = "forbid"

# Data Models Models
class Property(BaseModel):
    name: str
    type: str
    description: str
    required: bool
    
    class Config:
        extra = "forbid"

class Entity(BaseModel):
    name: str
    description: str
    properties: List[Property]
    
    class Config:
        extra = "forbid"

class Relationship(BaseModel):
    source_entity: str
    target_entity: str
    type: str
    description: str
    
    class Config:
        extra = "forbid"

class DataModels(BaseModel):
    entities: List[Entity]
    relationships: List[Relationship]
    
    class Config:
        extra = "forbid"

# UI Components Models
class Component(BaseModel):
    name: str
    type: str
    description: str
    functionality: str
    api_endpoints: List[str]
    data_displayed: List[str]
    
    class Config:
        extra = "forbid"

class Screen(BaseModel):
    name: str
    description: str
    route: str
    user_types: List[str]
    components: List[Component]
    
    class Config:
        extra = "forbid"

class UIComponents(BaseModel):
    screens: List[Screen]
    
    class Config:
        extra = "forbid"

# Detailed Implementation Plan Models
class Subtask(BaseModel):
    name: str
    status: str
    description: str
    
    class Config:
        extra = "forbid"

class Task(BaseModel):
    name: str
    description: str
    status: str
    priority: str
    estimated_hours: int
    dependencies: List[str] = Field(default_factory=list)
    components_affected: List[str] = Field(default_factory=list)
    apis_affected: List[str] = Field(default_factory=list)
    subtasks: List[Subtask]
    
    class Config:
        extra = "forbid"

class Milestone(BaseModel):
    name: str
    description: str
    status: str
    due_date_offset: int
    tasks: List[Task]
    
    class Config:
        extra = "forbid"

class DetailedImplementationPlan(BaseModel):
    milestones: List[Milestone]
    
    class Config:
        extra = "forbid"

# Comprehensive Project Plan Model
class ComprehensiveProjectPlan(BaseModel):
    name: str
    description: str
    status: str
    tech_stack: List[str]
    experience_level: str
    high_level_plan: Dict[str, Any]
    technical_architecture: Dict[str, Any]
    api_endpoints: Dict[str, Any]
    data_models: Dict[str, Any]
    ui_components: Dict[str, Any]
    implementation_plan: Dict[str, Any]
    
    class Config:
        extra = "forbid"