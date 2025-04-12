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


# --------------------------------------------------------------------------------------------------- #


# Template for generating diagram

# backend/app/services/ai/prompt_templates.py

CLASS_DIAGRAM_JSON_TEMPLATE = """
You are an expert software architect and UML class diagram specialist with extensive experience across all types of software systems.

Project Description:
{project_plan}

{existing_context}

User Request:
{change_request}

Create a comprehensive JSON representation of a UML class diagram that fully captures the software architecture described in the project plan. The JSON must adhere exactly to this schema:

{{
  "classes": [
    {{
      "name": string,
      "attributes": [
         {{ "visibility": string, "type": string, "name": string }}
      ],
      "methods": [
         {{ "visibility": string, "name": string, "parameters": [ {{ "name": string, "type": string }} ], "return_type": string }}
      ]
    }}
  ],
  "relationships": [
    {{
      "source": string,
      "target": string,
      "type": "inheritance" | "composition" | "aggregation" | "association" | "bidirectional",
      "cardinality": {{ "source": string, "target": string }}  // for example: {{ "source": "1", "target": "many" }}
    }}
  ]
}}

Follow these instructions precisely:
1. Output ONLY the JSON object without any markdown formatting or explanations.
2. Use double quotes for all string literals.
3. Do not include any extra keys beyond those defined in the schema.

MANDATORY DETAILED ANALYSIS PROCESS:
1. First, extract EVERY SINGLE named component, feature, and subsystem explicitly mentioned in the project plan.
2. For each platform, technology, or external integration mentioned, create dedicated classes to represent them.
3. For each phase or milestone in the project, ensure all mentioned features have corresponding classes.
4. For each functional area (e.g., authentication, data visualization, API integration), create a complete set of classes covering:
   - Model/Entity classes that represent data structures
   - Controller/Service classes that implement business logic
   - Repository/DAO classes for data persistence
   - UI/View components where applicable
   - Factory/Builder classes where complex objects are needed
5. Identify all cross-cutting concerns (security, logging, configuration) and create appropriate classes.
6. For each class identified, meticulously define:
   - All attributes necessary for the class's functionality
   - All methods needed to implement the described behaviors
   - Appropriate visibility modifiers for encapsulation
7. Establish logical relationships between classes:
   - Inheritance for "is-a" relationships
   - Composition for "contains-a" strong relationships
   - Aggregation for "has-a" weaker relationships
   - Association for "uses-a" relationships
   - Correct cardinality based on business rules (1-to-1, 1-to-many, many-to-many)
8. Implement architectural patterns evident from the requirements:
   - MVC/MVVM for UI-heavy applications
   - Repository pattern for data access
   - Factory/Strategy patterns where appropriate
   - Observer pattern for event handling
9. Ensure multi-platform requirements have dedicated classes (e.g., iOS/Android specifics).
10. Create adapter classes for each external integration point.

CRITICAL VERIFICATION CHECKLIST (You MUST satisfy ALL these criteria):
- Every feature mentioned in the project plan has corresponding classes
- Every milestone's deliverables are represented in the class structure
- All platforms mentioned have dedicated architecture components
- All external integrations have specific adapter/service classes
- Proper layering exists (presentation, business logic, data access)
- Authentication and security concerns are properly modeled
- Data flows are represented with appropriate relationships
- Reporting/visualization features have dedicated components
- Testing infrastructure is represented if mentioned in the plan
- Cross-cutting concerns have appropriate classes
- Relationships use correct cardinality and type

Example:
{{
  "classes": [
    {{
      "name": "User",
      "attributes": [
        {{ "visibility": "+", "type": "String", "name": "userId" }},
        {{ "visibility": "-", "type": "String", "name": "password" }},
        {{ "visibility": "+", "type": "String", "name": "email" }},
        {{ "visibility": "+", "type": "String", "name": "role" }}
      ],
      "methods": [
        {{ "visibility": "+", "name": "authenticate", "parameters": [ {{ "name": "password", "type": "String" }} ], "return_type": "Boolean" }},
        {{ "visibility": "+", "name": "hasPermission", "parameters": [ {{ "name": "permission", "type": "String" }} ], "return_type": "Boolean" }}
      ]
    }}
  ],
  "relationships": [
    {{
      "source": "User",
      "target": "Role",
      "type": "association",
      "cardinality": {{ "source": "many", "target": "1" }}
    }}
  ]
}}
"""


# --------------------------------------------------------------------------------------------------- #


ACTIVITY_DIAGRAM_JSON_TEMPLATE = """
You are an expert software architect and UML activity diagram specialist with deep expertise in modeling detailed application workflows and business processes.

Project Description:
{project_plan}

{existing_context}

User Request:
{change_request}

Please create a comprehensive JSON representation of a UML activity diagram that depicts a SPECIFIC FUNCTIONAL WORKFLOW within the application (NOT project phases). The JSON must adhere exactly to this schema:

{{
  "nodes": [
    {{ "id": string, "type": "start" | "end" | "activity" | "decision" | "merge" | "fork" | "join", "label": string }}
  ],
  "flows": [
    {{
      "source": string,
      "target": string,
      "condition": string  // This value should be an empty string if not applicable.
    }}
  ]
}}

Follow these rules exactly:
1. Output ONLY the JSON object without any markdown formatting or extra text.
2. Use double quotes for all string values.
3. Do not include any keys beyond those defined in the schema.

DETAILED APPLICATION WORKFLOW REQUIREMENTS:

1. Focus on Core Application Functionality:
   - Model a specific user interaction or system process (e.g., "Reservation Creation Flow" or "Inventory Update Process")
   - Show the entire process from initiation to completion
   - Include all decision points, validations, and error handling within the workflow
   - Focus on WHAT the system does, not HOW it is developed

2. Actor Interactions:
   - Include user input points and system responses
   - Show where notifications or confirmations are sent
   - Model data entry/validation as specific activities
   - Include integration points with external systems

3. Business Rules and Logic:
   - Incorporate all validation rules as decision nodes
   - Include business logic that affects process flow
   - Model conditional paths based on system state or user inputs
   - Show data transformation activities when relevant

4. Detailed Node Labels:
   - Use precise verb-noun combinations for activities (e.g., "Validate Reservation Details" not just "Validate")
   - For decision nodes, phrase as specific questions about data or state
   - Name error handling or exceptional flow activities clearly
   - Keep labels concise but descriptive enough to understand the specific action

5. Comprehensive Error Handling:
   - Include validation failure paths
   - Show retry options where applicable
   - Model exception handling processes
   - Include rollback or compensation activities if needed

6. Data Flow Indications:
   - Indicate where data is being created, read, updated, or deleted
   - Show when data is being loaded or saved
   - Include activities for data transformations
   - Show when calculations or processing occur

7. Visual Flow Organization:
   - Arrange related activities in logical groups
   - Use merge nodes to simplify diagram when multiple paths converge
   - Use fork/join pairs for truly parallel activities
   - Ensure the diagram reads naturally from top to bottom

Example of a functional workflow (Reservation Creation Process):
{{
  "nodes": [
    {{ "id": "start", "type": "start", "label": "Start" }},
    {{ "id": "enterReservationDetails", "type": "activity", "label": "Enter Reservation Details" }},
    {{ "id": "checkAvailability", "type": "activity", "label": "Check Table Availability" }},
    {{ "id": "isAvailable", "type": "decision", "label": "Tables Available?" }},
    {{ "id": "suggestAlternative", "type": "activity", "label": "Suggest Alternative Times" }},
    {{ "id": "userAcceptsAlternative", "type": "decision", "label": "User Accepts Alternative?" }},
    {{ "id": "validateDetails", "type": "activity", "label": "Validate Customer Details" }},
    {{ "id": "detailsValid", "type": "decision", "label": "Details Valid?" }},
    {{ "id": "showValidationErrors", "type": "activity", "label": "Display Validation Errors" }},
    {{ "id": "confirmReservation", "type": "activity", "label": "Confirm Reservation" }},
    {{ "id": "saveReservation", "type": "activity", "label": "Save Reservation to Database" }},
    {{ "id": "notifyStaff", "type": "fork", "label": "Fork" }},
    {{ "id": "sendCustomerConfirmation", "type": "activity", "label": "Send Confirmation to Customer" }},
    {{ "id": "updateStaffDashboard", "type": "activity", "label": "Update Staff Dashboard" }},
    {{ "id": "notifyComplete", "type": "join", "label": "Join" }},
    {{ "id": "displayConfirmation", "type": "activity", "label": "Display Confirmation Screen" }},
    {{ "id": "end", "type": "end", "label": "End" }},
    {{ "id": "cancelPath", "type": "merge", "label": "Merge" }},
    {{ "id": "cancelReservation", "type": "activity", "label": "Cancel Reservation Process" }},
    {{ "id": "endCancel", "type": "end", "label": "End with Cancellation" }}
  ],
  "flows": [
    {{ "source": "start", "target": "enterReservationDetails", "condition": "" }},
    {{ "source": "enterReservationDetails", "target": "checkAvailability", "condition": "" }},
    {{ "source": "checkAvailability", "target": "isAvailable", "condition": "" }},
    {{ "source": "isAvailable", "target": "validateDetails", "condition": "Yes" }},
    {{ "source": "isAvailable", "target": "suggestAlternative", "condition": "No" }},
    {{ "source": "suggestAlternative", "target": "userAcceptsAlternative", "condition": "" }},
    {{ "source": "userAcceptsAlternative", "target": "validateDetails", "condition": "Yes" }},
    {{ "source": "userAcceptsAlternative", "target": "cancelPath", "condition": "No" }},
    {{ "source": "validateDetails", "target": "detailsValid", "condition": "" }},
    {{ "source": "detailsValid", "target": "confirmReservation", "condition": "Yes" }},
    {{ "source": "detailsValid", "target": "showValidationErrors", "condition": "No" }},
    {{ "source": "showValidationErrors", "target": "enterReservationDetails", "condition": "" }},
    {{ "source": "confirmReservation", "target": "saveReservation", "condition": "" }},
    {{ "source": "saveReservation", "target": "notifyStaff", "condition": "" }},
    {{ "source": "notifyStaff", "target": "sendCustomerConfirmation", "condition": "" }},
    {{ "source": "notifyStaff", "target": "updateStaffDashboard", "condition": "" }},
    {{ "source": "sendCustomerConfirmation", "target": "notifyComplete", "condition": "" }},
    {{ "source": "updateStaffDashboard", "target": "notifyComplete", "condition": "" }},
    {{ "source": "notifyComplete", "target": "displayConfirmation", "condition": "" }},
    {{ "source": "displayConfirmation", "target": "end", "condition": "" }},
    {{ "source": "cancelPath", "target": "cancelReservation", "condition": "" }},
    {{ "source": "cancelReservation", "target": "endCancel", "condition": "" }}
  ]
}}
"""

# --------------------------------------------------------------------------------------------------- #


SEQUENCE_DIAGRAM_DIRECT_TEMPLATE = """
You are a UML sequence diagram expert. Generate a comprehensive and detailed sequence diagram representation for the following project plan.

Project Plan:
{project_plan}

{existing_context}

{change_request}

Create a detailed sequence diagram in the format used by sequencediagram.org. The diagram should:
1. Show all key objects/actors and their interactions with ONLY ONE representation style
2. Use proper sequence diagram syntax with clear messages, precise activation boxes, and lifelines
3. Include both success and failure paths for critical operations using 'alt' fragments
4. Show proper database interactions (always show database reads/writes explicitly)
5. Include important notes, constraints, and business rules as comments
6. Group related operations into logical fragments using UML fragment notation
7. Cover ALL major workflows mentioned in the project plan
8. Use "alt" fragments to show conditional flows (success vs. failure)
9. Include detailed service-to-service interactions
10. Show proper activation and deactivation of all services throughout the entire flow

Here's the reference for sequencediagram.org syntax:
- title: Add a title with 'title [Title Text]'
- participants: Define WITHOUT quotation marks: 'actor User', 'boundary MobileApp', 'control AuthService', etc.
- messages: '[Sender] -> [Receiver]: [Message]' (solid arrow), '[Sender] --> [Receiver]: [Message]' (dashed arrow)
- activation: '+[Object]' to activate, '-[Object]' to deactivate (ALWAYS pair these properly)
- notes: 'note over [Object]: [Text]', 'note left of [Object]: [Text]', 'note right of [Object]: [Text]'
- groups: 'group [Name]' to start a group, 'end' to end it
- alternatives: 'alt [Condition]', 'else [Condition]', 'end' (use for success/failure paths)
- loops: 'loop [Condition]', 'end' (use for iterative operations)
- parallel: 'par [Description]', 'and [Description]', 'end' (use for concurrent operations)
- references: 'ref over [Objects]: [Text]' (use for complex sub-processes)

CRITICAL: To avoid duplicate participant representations, follow these strict guidelines:
1. NEVER put quotation marks around participant names: use 'actor User' NOT 'actor "User"'
2. Use CamelCase for multi-word names: 'boundary MobileApp', NOT 'boundary "Mobile App"'
3. Do NOT use "as" aliases for participant declarations
4. Do NOT declare the same participant twice
5. The correct syntax is: 'actor User', 'boundary MobileApp', 'control AuthService', etc.

Guidelines for a high-quality diagram:
1. Include error handling paths for critical operations using 'alt' fragments
2. Show explicit database operations whenever data persistence is involved
3. Use activation boxes consistently to show when services are processing
4. Group related messages into logical fragments (auth flow, reservation flow, etc.)
5. Add meaningful notes to explain complex business rules or constraints
6. Ensure all participants from the project plan are represented
7. Include detailed interactions for ALL major system components
8. Show asynchronous operations with dashed arrows (-->)
9. Include timeline references for long-running or scheduled processes

Return ONLY the sequence diagram code, enclosed in ```sequence and ``` tags.
"""

# --------------------------------------------------------------------------------------------------- #


SEQUENCE_DIAGRAM_JSON_TEMPLATE = """
You are a UML sequence diagram expert. Generate a comprehensive JSON representation for a sequence diagram based on the following project plan.

Project Plan:
{project_plan}

{existing_context}

{change_request}

Create a detailed JSON object that represents a complete sequence diagram covering ALL major workflows from the project plan. The JSON should include:
1. A descriptive title for the diagram
2. A complete list of participants (actors, systems, components, databases)
3. Detailed messages showing all interactions between participants
4. Success AND failure paths for critical operations
5. Explicit database interactions whenever data persistence is involved
6. Notes explaining important business rules or constraints
7. Logical groupings of related messages and operations
8. Alternative flows showing different execution paths
9. Asynchronous operations where appropriate
10. Timeline references for scheduled or long-running processes

Follow this JSON structure exactly:
{{
  "title": "Descriptive Diagram Title",
  "participants": [
    {{
      "name": "ParticipantName",
      "type": "actor|boundary|control|entity|database|participant",
      "display_name": "DisplayName"
    }}
  ],
  "notes": [
    {{
      "position": "over|left|right",
      "participant": "ParticipantName",
      "text": "Detailed explanatory note",
      "placement": "start|end"
    }}
  ],
  "groups": [
    {{
      "type": "group|alt|loop|opt|par",
      "label": "Descriptive Group Label",
      "messages": [
        {{
          "from": "SenderName",
          "to": "ReceiverName",
          "text": "Detailed message describing the specific operation",
          "type": "solid|dashed",
          "activate": true|false,
          "deactivate": true|false
        }}
      ],
      "alternatives": [
        {{
          "label": "Alternative scenario (e.g., 'Error case')",
          "messages": [
            {{
              "from": "SenderName",
              "to": "ReceiverName",
              "text": "Error handling message",
              "type": "solid|dashed",
              "activate": true|false,
              "deactivate": true|false
            }}
          ]
        }}
      ]
    }}
  ],
  "messages": [
    {{
      "from": "SenderName",
      "to": "ReceiverName",
      "text": "Detailed message describing the specific operation",
      "type": "solid|dashed",
      "activate": true|false,
      "deactivate": true|false
    }}
  ]
}}

IMPORTANT: To avoid participant duplication issues, follow these guidelines:
1. Use a SINGLE consistent naming convention for each participant
2. Each participant should have ONE unique "name" value
3. For "display_name", use CamelCase without spaces: "MobileApp" not "Mobile App"
4. Each participant should appear exactly ONCE in the participants array
5. Do NOT include quotation marks within the name or display_name values 

Important guidelines for creating a high-quality sequence diagram JSON:
1. Include ALL major participants from the project plan
2. Show explicit database operations whenever data is being stored or retrieved
3. Use activation and deactivation flags consistently to show service processing
4. Include error handling paths for critical operations
5. Group related messages into logical sections (auth flow, reservation flow, etc.)
6. Add detailed notes to explain complex business rules or constraints
7. Ensure the diagram covers ALL major workflows mentioned in the project plan
8. Include detailed service-to-service interactions
9. Use dashed messages (type: "dashed") for asynchronous operations

Ensure your JSON is valid and properly formatted. Return ONLY the JSON object, enclosed in ```json and ``` tags.
"""


# --------------------------------------------------------------------------------------------------- #


SEQUENCE_DIAGRAM_PROMPT_TEMPLATE = """
You are a UML sequence diagram expert. Generate a comprehensive sequence diagram representation in sequencediagram.org syntax based on the following JSON definition.

Diagram JSON:
{diagram_json}

Create a detailed sequence diagram in the format used by sequencediagram.org. The diagram must:
1. Show all the participants and their interactions EXACTLY as defined in the JSON
2. Use proper sequence diagram syntax with clear messages, precise activation boxes, and lifelines
3. Include all success and failure paths defined in the JSON
4. Implement all notes, conditions, and groups defined in the JSON
5. Follow standard UML sequence diagram conventions
6. Properly represent all alternative flows and scenarios
7. Show clear activation and deactivation of services throughout the entire flow
8. Use dashed arrows for asynchronous operations

Here's the reference for sequencediagram.org syntax:
- title: Add a title with 'title [Title Text]'
- participants: Define WITHOUT quotation marks: 'actor User', 'boundary MobileApp', 'control AuthService', etc.
- messages: '[Sender] -> [Receiver]: [Message]' (solid arrow), '[Sender] --> [Receiver]: [Message]' (dashed arrow)
- activation: '+[Object]' to activate, '-[Object]' to deactivate (ALWAYS pair these properly)
- notes: 'note over [Object]: [Text]', 'note left of [Object]: [Text]', 'note right of [Object]: [Text]'
- groups: 'group [Name]' to start a group, 'end' to end it
- alternatives: 'alt [Condition]', 'else [Condition]', 'end' (use for success/failure paths)
- loops: 'loop [Condition]', 'end' (use for iterative operations)
- parallel: 'par [Description]', 'and [Description]', 'end' (use for concurrent operations)
- references: 'ref over [Objects]: [Text]' (use for complex sub-processes)

CRITICAL: To avoid duplicate participant representations, follow these strict guidelines:
1. NEVER put quotation marks around participant names: use 'actor User' NOT 'actor "User"'
2. Use CamelCase for multi-word names: 'boundary MobileApp', NOT 'boundary "Mobile App"'
3. Do NOT use "as" aliases for participant declarations
4. Do NOT declare the same participant twice
5. The correct syntax is: 'actor User', 'boundary MobileApp', 'control AuthService', etc.

Critical implementation requirements:
1. SHOW ONLY ONE REPRESENTATION of each participant using proper type declarations WITHOUT quotation marks
2. Implement ALL groups and alternatives exactly as defined in the JSON
3. Use activation boxes consistently to show when services are processing
4. Implement all error handling paths defined in the JSON
5. Organize the diagram to be clear and readable
6. Include every detail specified in the JSON without omission
7. Ensure proper nesting of group and alternative fragments
8. Maintain the exact message flow defined in the JSON
9. Use dashed arrows (-->) for any asynchronous operations

Return ONLY the sequence diagram code, enclosed in ```sequence and ``` tags.
"""