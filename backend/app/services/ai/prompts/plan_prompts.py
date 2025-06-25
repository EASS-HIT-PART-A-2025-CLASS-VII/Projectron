"""
Prompts for the AI-powered project planning service with LangGraph state awareness.
These prompts guide the AI to generate different components of a project plan.
"""

# Prompt for generating clarification questions
CLARIFICATION_QUESTIONS_PROMPT = """
You are an experienced software architect and project manager. 
Your task is to generate simple clarification questions for a software project.

# Project Information
Project Name: {name}
Project Description: {project_description}
Experience Level: {experience_level}
Team Size: {team_size}
Preferred Tech Stack: {tech_stack}
Project Time Budget: {total_hours} hours total

# Instructions
This is the first step in our project planning process. Generate 4-6 easy-to-answer questions that will help with planning this software project. The questions should be:
- Simple and straightforward
- Answerable in 1-2 sentences
- Mostly technical (about 75%) with some product/idea questions
- Relevant to the specific project described

Focus on questions about:
- Core technical requirements
- Key data needs
- Essential integrations
- Basic user needs
- Main technical challenges
- Development priorities

Given the team size of {team_size}, experience level of {experience_level}, and time budget of {total_hours} hours, keep questions practical and focused on what's actually needed to build the project.

# Output Format
Provide the questions as a JSON array of strings.

# Examples of Good Questions:
- "Will users need to log in? If yes, what authentication method would you prefer?"
- "What are the 2-3 most important pieces of data this application needs to store?"
- "Are there any third-party APIs or services this needs to connect with?"
- "Will this need to work offline, or is it always online?"
- "Which feature should be developed first?"
- "Do you need a mobile app, web app, or both?"
"""

# Prompt for generating high-level project plan
HIGH_LEVEL_PLAN_PROMPT = """
You are an experienced product manager and software strategist.
Your task is to create a high-level project plan for a software development project.

# Project Information
Project Name: {project_name}
Project Description: {project_description}
Experience Level: {experience_level}
Team Size: {team_size}
Preferred Tech Stack: {tech_stack}

# Clarification Questions and Answers
{clarification_qa}

# Project Time Budget
{total_hours} hours total

# Instructions
Create a high-level project plan that includes:
1. Project name - USE THE EXACT PROJECT NAME PROVIDED: "{project_name}" (do not create a new name)
2. Project Description - 3 - 4 sentences summarizing the project, don't take the client original description, but summarize it in your own words
3. Project vision - what this project aims to achieve
4. Business objectives - specific, measurable goals
5. Target users - who will use this application and why
6. Core features - key functionality at a high level
7. Project scope - what's in and what's out
8. Success criteria - how to determine if the project is successful
9. Constraints - time, budget, technical, or other limitations
10. Assumptions - what we're assuming to be true
11. Risks - potential obstacles to success
12. Tech stack - USE THE PROVIDED TECH STACK as a foundation, adding any necessary technologies (if needed) to complete the architecture. Do not remove any of the provided technologies: {tech_stack}

IMPORTANT: Assume the developers are highly capable and can accomplish more than the stated time budget suggests. For a {total_hours} hour project, plan for what could be accomplished in approximately {extended_hours} hours by an efficient team. Focus on creating an ambitious but achievable plan.

Consider the team's experience level ({experience_level}) and team size ({team_size}) when determining scope and complexity.
"""

# Prompt for generating technical architecture
TECHNICAL_ARCHITECTURE_PROMPT = """
You are an experienced software architect with expertise in system design.
Your task is to create a detailed technical architecture for a software project.

# Project Information
Project Name: {project_name}
Project Description: {project_description}
Experience Level: {experience_level}
Team Size: {team_size}
Tech Stack: {tech_stack}
Project Time Budget: {total_hours} hours total

# High-Level Plan Key Information
Vision: {vision}
Business Objectives: {business_objectives}
Core Features: {core_features}
Project Scope: {scope}
Constraints: {constraints}

# Instructions
Create a detailed technical architecture document that includes:
1. Architecture overview - a concise summary of the overall system design
2. Architecture diagram description - a textual description of how components interact
3. System components - all major software components with their responsibilities
4. Communication patterns - how components communicate with each other
5. Key architecture patterns used (e.g., microservices, event-driven, etc.)
6. Infrastructure requirements (hosting, CI/CD, etc.)

Ensure the architecture addresses the business objectives, core features, and constraints defined in the high-level plan.

IMPORTANT: Design an ambitious yet achievable architecture. Assume the developers are highly capable and can accomplish more than the stated time budget suggests. Design for what could be accomplished in approximately {extended_hours} hours by an efficient team.
"""

# Prompt for generating API endpoints
API_ENDPOINTS_PROMPT = """
You are an experienced API designer with expertise in RESTful and GraphQL APIs.
Your task is to Create comprehensive yet concise API documentation tailored to the project's specific features and complexity. 
Design endpoints that directly support the application's core functionality and primary user workflows.

# Project Information
Project Name: {project_name}
Project Description: {project_description}
Tech Stack: {tech_stack}
Project Time Budget: {total_hours} hours total

# High-Level Plan Key Information
Core Features: {core_features}
Target Users: {target_users}
Business Objectives: {business_objectives}
Scope: {scope}

# Technical Architecture Key Information
Architecture Overview: {architecture_overview}
System Components: {system_components}
Communication Patterns: {communication_patterns}
Architecture Patterns: {architecture_patterns}

#Core Requirements
Documentation Structure
1. API Design Principles (3-5 principles)
Identify the most critical design standards that will guide this API:

Focus on principles directly relevant to this project's needs
Emphasize standards that impact user experience and developer adoption
Keep each principle to 1-2 sentences with clear rationale

2. Base URL & Authentication

Provide clean, logical base URL structure
Describe authentication mechanism concisely (1-2 sentences)
Specify auth requirements clearly (which endpoints require authentication)

3. Resource Documentation
Focus on essential resources only - those directly tied to core application features.
Complexity Scaling Guidelines
Project Budget: {total_hours} hours
Scale your API design appropriately:

Small projects (<50h): 3-4 core resources, 3-4 endpoints each
Medium projects (50-150h): 5-6 resources, 4-5 endpoints each
Large projects (>150h): 6-8 resources, 5-6 endpoints each

Documentation Format Standards
Resource Structure
For each resource, include:

Resource purpose (1 sentence)
Key endpoints (2-6 most essential operations)
Consistent endpoint format: Method, Path, Purpose, Auth requirement

Schema Guidelines

Request schemas: 3-6 essential fields only
Response schemas: 4-7 key fields only
Field descriptions: Brief but clear (avoid obvious descriptions)
Data types: Always specify (string, integer, boolean, array, etc.)

Endpoint Prioritization
Include only endpoints that support:

Core CRUD operations for primary entities
Essential business logic (not every possible operation)
Primary user workflows (the critical path users follow)
Key integrations (authentication, critical external services)

Quality Criteria

Every endpoint should serve a clear business purpose
API should feel intuitive to developers familiar with REST principles
Documentation should enable immediate implementation
Balance between comprehensive coverage and practical usability

Token Target: Keep entire response under 14,000 tokens through strategic focus on essential functionality.
"""

# Prompt for generating data models
# Prompt for generating comprehensive data models
DATA_MODELS_PROMPT = """
You are an experienced database designer and data architect.
Your task is to create detailed data models for a software project.

# Project Information
Project Name: {project_name}
Project Description: {project_description}
Tech Stack: {tech_stack}
Project Time Budget: {total_hours} hours total

# API Key Information
Resources: {resources}
Authentication: {authentication}

# Instructions

Create a COMPREHENSIVE data model that covers all logical aspects of the system. Be generous - it's better to include more entities than miss critical ones.

**Make sure to include at least 5-10 data entities as long as its relevant to the project.**
**Dont make more than 12 Datamodels**

**Think systematically about these entity categories:**
1. **Core Business Entities** - Main objects users interact with
2. **User & Identity** - Users, roles, permissions, profiles, sessions
3. **Content & Media** - Documents, files, comments, reviews, media
4. **Workflow & Process** - Tasks, workflows, notifications, events, status tracking
5. **System & Configuration** - Settings, categories, tags, logs, analytics
6. **Relationships** - Many-to-many association entities (user-project, role-permission, etc.)

**For each entity provide:**
- Name and clear description
- Properties with types, descriptions, and required status
- Include standard fields: id, created_at, updated_at, status where applicable

**For relationships define:**
- Source and target entities
- Relationship type (one-to-one, one-to-many, many-to-many)
- Clear description of the relationship

**Requirements:**
- Support all API resources and endpoints
- Enable efficient querying for common operations
- Follow database best practices for the tech stack
- Consider audit trails, user activity tracking, and system logs
- Include entities for file uploads, notifications, and user preferences

IMPORTANT: Design for what could be accomplished in approximately {extended_hours} hours. Be comprehensive and think about ALL the data the system would logically need to store and manage.
"""

# Prompt for generating UI components
UI_COMPONENTS_PROMPT = """
You are an experienced UI/UX designer and frontend developer.
Your task is to create a UI components breakdown for a software project.

# Project Information
Project Name: {project_name}
Project Description: {project_description}
Tech Stack: {tech_stack}
Project Time Budget: {total_hours} hours total

# High-Level Plan Key Information
Core Features: {core_features}
Target Users: {target_users}

# Technical Key Information
Frontend Components: {frontend_components}

# API Resources
API Resources: {api_resources}

# Data Entities
Data Entities: {data_entities}

# Instructions
Create a comprehensive UI components breakdown that includes:
1. Screens/pages - for each screen in the application:
   - Name and description
   - Route/URL path
   - Target user types
   - Components contained on the screen
2. Components - for each UI component:
   - Name and type (form, table, chart, etc.)
   - Description and functionality
   - API endpoints it interacts with
   - Data displayed or manipulated

Design UI components that:
- Effectively present the functionality defined in the APIs and data models
- Meet the needs of the target users
- Support all core features
- Follow a consistent design language

IMPORTANT: This is a high-priority section. Create thorough screen and component definitions that align with the API endpoints and data models. Design for what could be accomplished in approximately {extended_hours} hours by an efficient team.
"""

# Prompt for generating detailed implementation plan
DETAILED_IMPLEMENTATION_PLAN_PROMPT = """
You are an experienced project manager with expertise in software development.
Your task is to create a detailed implementation plan with milestones, tasks, and subtasks.

# Project Information
Project Name: {project_name}
Project Description: {project_description}
Tech Stack: {tech_stack}
Project Time Budget: {total_hours} hours total

# Technical Components
System Components: {system_components}
API Resources: {api_resources}
Data Entities: {data_entities}
UI Screens: {ui_screens}

# Instructions
Create a detailed implementation plan that includes:
1. Logical milestones representing phases of development
2. Detailed tasks for each milestone
3. Granular subtasks for each task
4. Dependencies between tasks
5. Estimated effort for each task
6. Task priorities
7. Due date offsets (in days from project start)

The plan should cover all aspects of implementation including:
- Development environment setup
- Infrastructure configuration
- Database setup
- API development
- UI implementation
- Integration
- Testing
- Deployment
- Documentation

CRITICAL: The TOTAL estimated hours across all tasks MUST sum up to approximately {total_hours} hours (±5%). However, plan the work as if an efficient team could accomplish 50% more in the same timeframe. This means designing more ambitious tasks while keeping the total hour count at {total_hours}.

Prioritize tasks in this order:
1. Core infrastructure and foundational components
2. API endpoints that enable key functionality
3. Essential UI components and screens
4. Data model implementation
5. Integration between components
6. Testing and quality assurance
7. Enhanced features and refinements
8. Documentation and deployment
"""

# Repair prompt template for fixing validation errors
REPAIR_PROMPT = """
You are an expert JSON repair specialist. Your task is to fix validation errors in a JSON response to match the expected Pydantic model structure.
You previously generated a JSON response that didn't match the expected structure. 
Please fix the following validation errors and provide a corrected response.

# Validation Errors
{errors}

# Expected JSON Structure
{expected_structure}

# Your Previous Response
{previous_response}

# Project Time Budget Context
This is part of a project plan with a total time budget of {total_hours} hours.

# Instructions
Please fix all validation errors and return a valid JSON response that matches the expected structure.
Make sure all required fields are present and have the correct types.
Ensure the response contains all the details from your previous response, just formatted correctly.

If there are any estimated_hours fields that exceed their maximum allowed value, reduce them while keeping the relative effort distribution sensible. The total hours across all tasks should sum up to approximately {total_hours} hours.

# Output Format
Provide a corrected JSON response that matches the expected structure.
"""