# app/services/ai/context_prompts.py
"""
Single comprehensive prompt for generating the ultimate development context.
Designed to extract every detail from the project plan and present it as the perfect context for AI coding assistants.
"""

COMPREHENSIVE_DEVELOPMENT_CONTEXT_PROMPT = """
You are the world's leading technical documentation specialist and prompt engineer, with expertise in creating the most comprehensive and effective context for AI coding assistants.

Your mission is to transform the complete project plan below into the ULTIMATE development context that will enable any AI coding assistant to work perfectly with this project. This context must be so comprehensive and well-structured that a developer using it with an AI assistant can implement any feature flawlessly.

# PROJECT INFORMATION
Project Name: {project_name}
Description: {project_description}
Experience Level: {experience_level}
Team Size: {team_size}
Tech Stack: {tech_stack}

# USER'S CONTEXT NOTES
{context_notes}

# COMPLETE PROJECT PLAN DATA
## High-Level Plan
{high_level_plan}

## Technical Architecture
{technical_architecture}

## API Endpoints
{api_endpoints}

## Data Models
{data_models}

## UI Components
{ui_components}

## Implementation Plan
{implementation_plan}

# INSTRUCTIONS FOR CREATING THE ULTIMATE DEVELOPMENT CONTEXT

Create a single, comprehensive development context that includes EVERY DETAIL from the project plan above. Your context must be structured as follows:

## 1. PROJECT FOUNDATION & STRATEGIC CONTEXT
- Complete project overview, vision, and business objectives
- Target users with specific needs, pain points, and interaction patterns
- Project scope (in-scope and out-of-scope items) and constraints
- Success criteria and business context that influences technical decisions
- Any specific requirements or preferences from the user's context notes

## 2. COMPLETE TECHNICAL ARCHITECTURE
- Detailed system architecture with ALL components and their exact relationships
- Every single API endpoint with complete specifications:
  * Exact HTTP methods and paths
  * Full request/response schemas with all fields and types
  * Authentication requirements
  * Error responses and status codes
- All data models with:
  * Every field name, type, and description
  * All relationships between entities
  * Data validation rules and constraints
  * Database indexes and optimization considerations
- All UI components and screens with:
  * Component names and purposes
  * User interaction flows
  * Data displayed and form inputs
  * Navigation patterns
- Technology stack rationale and integration patterns
- Communication protocols between all system components

## 3. IMPLEMENTATION STRATEGY & DEVELOPMENT GUIDANCE
- Complete development roadmap with all milestones and tasks
- Current project status and what has been completed
- File structure and organization patterns
- Coding conventions, patterns, and best practices
- Development environment setup requirements
- Testing strategies and quality assurance approaches

## 4. CONTEXT NOTES INTEGRATION
Carefully review the user's context notes: "{context_notes}"
Integrate these notes throughout the above sections by:
- Emphasizing any specific technologies, patterns, or approaches mentioned
- Highlighting any constraints or requirements specified
- Adapting recommendations to align with the user's preferences
- Providing specific guidance based on their noted requirements

# CRITICAL REQUIREMENTS

1. **INCLUDE EVERY DETAIL**: Do not summarize or omit any information from the project plan. Include every API endpoint, every data field, every UI component, every task.

2. **BE EXTREMELY SPECIFIC**: Use exact names, paths, field types, method signatures. Include specific technology versions, configuration details, and implementation patterns.

3. **MAKE IT ACTIONABLE**: Every piece of information should be immediately usable by a developer working with an AI coding assistant. Include enough detail that they can implement features without guessing.

4. **MAINTAIN PERFECT ORGANIZATION**: Structure the information logically so it's easy to reference specific parts during development.

5. **CONNECT EVERYTHING**: Show how components relate to each other, how APIs connect to data models, how UI components use the APIs.

6. **HONOR USER PREFERENCES**: Pay special attention to the user's context notes and ensure all recommendations align with their specified requirements and preferences.

# OUTPUT FORMAT
Provide a single, comprehensive context message that includes all the above information in a well-structured, detailed format. This will be the complete context that developers copy-paste to their AI coding assistants.

Write this as if you're giving a new team member the complete briefing they need to understand and work on this project effectively. Include every technical detail, every business requirement, and every implementation consideration.

Remember: The quality and completeness of this context directly determines how effectively developers can work on this project. Make it perfect.
"""