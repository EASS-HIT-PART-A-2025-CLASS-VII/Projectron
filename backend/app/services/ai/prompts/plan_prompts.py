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
2. Project vision - what this project aims to achieve
3. Business objectives - specific, measurable goals
4. Target users - who will use this application and why
5. Core features - key functionality at a high level
6. Project scope - what's in and what's out
7. Success criteria - how to determine if the project is successful
8. Constraints - time, budget, technical, or other limitations
9. Assumptions - what we're assuming to be true
10. Risks - potential obstacles to success
11. Tech stack - USE THE PROVIDED TECH STACK as a foundation, adding any necessary technologies (if needed) to complete the architecture. Do not remove any of the provided technologies: {tech_stack}

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
API_ENDPOINTS_PROMPT = API_ENDPOINTS_PROMPT = """
You are an experienced API designer with expertise in RESTful and GraphQL APIs.
Your task is to create detailed API endpoints documentation for a software project.

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

# Instructions
Create API documentation that is BOTH comprehensive AND concise. Include:
1. 3-5 key API design principles - focus on the most important standards
2. Base URL structure - keep this brief
3. Authentication approach - concise description of the auth mechanism
4. Resources - focus on 4-8 essential resources that align with core features

# Token Management Guidelines
IMPORTANT: Keep your response under 14,000 tokens by following these guidelines:
1. For each resource, document 2-6 endpoints (prioritize the most essential ones)
2. Use a consistent, compact format for endpoint documentation
3. Keep descriptions focused and brief (2-3 sentences maximum)
4. For request/response schemas, include only essential fields (1-7 fields per schema)
5. Consolidate similar endpoints where possible
6. Omit detailed error codes except for the most critical cases

# Prioritization
Focus only on endpoints that directly support:
1. Core business functionality (directly tied to main features)
2. Primary user flows (the critical path for users)
3. Essential data management (create, read, update, delete of key resources)

Scale the API complexity appropriately for the {total_hours} hour budget:
- For small projects (<50 hours): 3-4 resources with 2-3 endpoints each
- For medium projects (50-150 hours): 4-6 resources with 3-4 endpoints each
- For large projects (>150 hours): 6-8 resources with 4-6 endpoints each
- If a resource is not logically needed in any way, do not include it
"""

# Prompt for generating data models
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
Design data models that will efficiently support the APIs and features defined. Create:
1. Entities - for each entity in the system:
   - Name and description
   - Properties with types, descriptions, and required status
2. Relationships - connections between entities:
   - Source and target entities
   - Relationship type (one-to-one, one-to-many, many-to-many)
   - Description of the relationship

Ensure your data models:
- Support all API resources and endpoints defined in the previous step
- Follow database best practices for the technologies in the tech stack
- Enable efficient querying for common operations

IMPORTANT: Create efficient, well-structured data models. Assume the developers are highly capable and can accomplish more than initially estimated. Design for what could be accomplished in approximately {extended_hours} hours.
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