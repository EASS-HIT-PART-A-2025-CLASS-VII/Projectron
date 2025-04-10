# app/services/prompt_templates.py

"""
This file contains prompt templates used by the ProjectAIService.
Centralizing prompts makes them easier to maintain, iterate on, and reuse.

Each template is designed for a specific task in the project planning
workflow and optimized for quality responses from the LLM.
"""

# Template for generating clarification questions based on project description
CLARIFICATION_QUESTIONS_TEMPLATE = """
You are an experienced project manager. Based on the following project description, generate 5-7 important clarification questions that would help better define the project scope, requirements, and constraints.

Project Description:
{project_description}

{existing_questions_context}

Generate clear and specific questions that will help gather essential information to plan this project effectively.
Return ONLY a JSON array of strings, with each string being one question. No explanation or other text.
Example format:
["Question 1?", "Question 2?", "Question 3?"]
"""


# --------------------------------------------------------------------------------------------------- #


# Template for generating a detailed text-based project plan
DETAILED_PLAN_TEXT_TEMPLATE = """
You are an experienced technical project manager tasked with creating a comprehensive development plan for a software project. Based on the following information, create a detailed project plan:

PROJECT DESCRIPTION:
{project_description}

CLARIFICATION ANSWERS:
{clarification_context}

Create a VERY DETAILED software development project plan with the following structure:

1. Project Name and Overview
   - Include a concise name and high-level summary
   - Mention the primary technology stack that will be used
   
2. Detailed Project Description
   - Elaborate on the project's purpose, features, and functionality
   - Describe the technical approach and architecture
   - Include any important constraints or requirements

3. Milestones: Divide the project into logical phases, for each milestone include:
   - Name (specific to software development phases)
   - Description (technical details of what will be accomplished)
   - Approximate timeline (e.g., "Week 1-2", "Month 1", etc.)
   - Status (default to "not_started")
   
4. Tasks: For each task within a milestone, include:
   - Name (specific and technical)
   - Detailed description with technical specifics when relevant
   - Estimated hours (realistic for development work)
   - Priority (low, medium, high)
   - Dependencies on other tasks (technical prerequisites)
   - Status (default to "not_started")
   
5. Subtasks: Break down complex tasks into smaller, implementable subtasks

For software development projects, make sure to:
- Create milestones that reflect the software development lifecycle (requirements, design, implementation, testing, deployment)
- Include infrastructure setup tasks where appropriate
- Consider database design and data modeling when relevant
- Account for technical debt management and code quality
- Include testing at appropriate levels (unit, integration, system)
- Address deployment and DevOps considerations if applicable
- Consider security requirements throughout the plan

Provide specific technical details when they're crucial to implementation, but avoid excessive technical jargon when it doesn't add value. Estimations should be realistic for development work, accounting for complexity and potential challenges.

DO NOT use generic placeholders. Every part of the plan should contain concrete, actionable details specific to software development.
"""

# --------------------------------------------------------------------------------------------------- #


# Template for converting text plan to structured JSON
TEXT_TO_STRUCTURED_TEMPLATE = """
You need to convert the following project plan text into a structured JSON format.

TEXT PLAN:
{text_plan}

{project_name_context}

Convert this text plan into a structured JSON object that precisely follows this structure:

```json
{{
  "name": "Project Name",
  "description": "Comprehensive project description",
  "status": "draft",
  "tech_stack": ["Technology 1", "Technology 2"],
  "experience_level": "junior",
  "team_size": 1,
  "milestones": [
    {{
      "name": "Milestone 1 Name",
      "description": "Detailed milestone description",
      "status": "not_started",
      "due_date_offset": 14,
      "tasks": [
        {{
          "name": "Task 1.1 Name",
          "description": "Detailed task description",
          "status": "not_started",
          "priority": "medium",
          "estimated_hours": 8,
          "dependencies": ["Name of another task this depends on"],
          "subtasks": [
            {{
              "name": "Subtask 1.1.1 Name",
              "status": "not_started"
            }}
          ]
        }}
      ]
    }}
  ]
}}
REQUIREMENTS:

1. Produce complete, valid JSON that exactly matches the structure above
2. Ensure all fields shown in the template are included with appropriate values
3. Make "due_date_offset" represent the number of days from project start
4. Structure the project hierarchically with milestones → tasks → subtasks
5. Every milestone must contain at least one task
6. Provide integer values for "estimated_hours" and "team_size"
7. Use only "low", "medium", or "high" for priority values
8. Set "status" to "not_started" for all components unless explicitly stated otherwise
9. Infer appropriate technologies for "tech_stack" based on project context
10. Include logical task dependencies when indicated in the text

IMPORTANT:

Return ONLY valid JSON with no additional text, explanations, or markdown formatting
Extract actual values from the provided plan rather than using placeholders
Ensure all numeric fields contain numbers, not strings (no quotes around numbers)
Keep the JSON well-formed with correct commas, quotes, and brackets
"""


# --------------------------------------------------------------------------------------------------- #


# Template for refining an existing project plan
REFINE_PLAN_TEMPLATE = """
As an expert software project planner, your task is to refine the existing project plan according to specific feedback while preserving structural integrity.

CURRENT PROJECT PLAN:
{current_plan}

FEEDBACK TO ADDRESS:
{feedback}

REFINEMENT INSTRUCTIONS:
1. Carefully analyze the feedback and identify all requested changes
2. Modify the plan by:
   - Adding, removing, or updating milestones, tasks, and subtasks
   - Adjusting time estimates, dependencies, and priorities
   - Refining descriptions and technical details
   - Resequencing items when necessary for logical flow

TECHNICAL REQUIREMENTS:
- Maintain the exact same JSON structure as the input plan
- Ensure all estimated_hours are integers (not strings or floats)
- Verify every milestone contains at least one task
- Preserve all required fields from the original plan
- Ensure all dependencies reference valid task names
- Keep status values consistent ("not_started", "in_progress", "completed", etc.)

Return only the complete, valid JSON with all modifications incorporated. Include no explanatory text, comments, or formatting outside the JSON structure itself.
"""