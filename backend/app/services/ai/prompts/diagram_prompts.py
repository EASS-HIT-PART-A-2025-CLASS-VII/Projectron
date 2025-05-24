
# Template for generating diagram

CLASS_DIAGRAM_JSON_TEMPLATE = """
You are an expert software architect and UML class diagram specialist with extensive experience across all types of software systems.

Project Description:
{project_plan}

User Request:
{change_request}

{existing_context}


Create a focused JSON representation of a UML class diagram that captures the CORE architecture of the system described in the project plan. The diagram should be concise and highlight only the most important classes and relationships. The JSON must adhere exactly to this schema:

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
4. Limit the total number of classes to a MAXIMUM of 15-20 classes.
5. Focus only on the most important classes that represent core domain concepts or critical architectural components.

SELECTIVE ANALYSIS PROCESS:
1. Identify only the PRIMARY domain entities and core business concepts explicitly mentioned in the project plan.
2. Include only the MOST CRITICAL system components that represent architectural keystones.
3. For each selected core functional area, include ONLY:
   - Primary domain model classes that represent key business entities
   - Main service/controller classes that implement critical business logic
   - Key repository classes for important data persistence
   - Essential interfaces or abstract classes that define critical contracts
4. Exclude:
   - Utility classes
   - Helper classes
   - Implementation details
   - Excessive UI components
   - Classes that represent minor features
   - Similar classes that can be represented by a single example
5. For each class included, define ONLY:
   - The most significant attributes that define its core state
   - The most important methods that represent its key behaviors
   - Use appropriate visibility modifiers
6. Establish only the most important relationships between classes:
   - Focus on relationships that show the core structure of the system
   - Include relationships that demonstrate key architectural patterns
   - Show important dependencies between major components

CLASS SELECTION CRITERIA (You MUST follow these strictly):
- Primary domain entities that represent core business concepts
- Key service classes that implement critical business processes
- Main controller classes that coordinate system behavior
- Important repository interfaces for data access
- Critical interfaces or abstract classes that define system contracts
- Classes that represent architectural patterns essential to the system
- Classes mentioned repeatedly or emphasized in the project plan
- Classes that serve as integration points with critical external systems

DIAGRAM QUALITY CHECKLIST:
- The diagram is visually manageable (15-20 classes maximum)
- Core business entities are properly represented
- Key architectural patterns are visible
- Main system components and their relationships are clear
- Critical data flows can be understood from the diagram
- The diagram provides a useful high-level view of the system
- An observer can understand the primary purpose and structure of the system
- The most important capabilities of the system are represented

Example:
{{
  "classes": [
    {{
      "name": "User",
      "attributes": [
        {{ "visibility": "+", "type": "String", "name": "userId" }},
        {{ "visibility": "-", "type": "String", "name": "password" }},
        {{ "visibility": "+", "type": "String", "name": "email" }}
      ],
      "methods": [
        {{ "visibility": "+", "name": "authenticate", "parameters": [ {{ "name": "password", "type": "String" }} ], "return_type": "Boolean" }}
      ]
    }},
    {{
      "name": "UserService",
      "attributes": [
        {{ "visibility": "-", "type": "UserRepository", "name": "userRepository" }}
      ],
      "methods": [
        {{ "visibility": "+", "name": "registerUser", "parameters": [ {{ "name": "userData", "type": "User" }} ], "return_type": "User" }},
        {{ "visibility": "+", "name": "authenticateUser", "parameters": [ {{ "name": "credentials", "type": "Credentials" }} ], "return_type": "Boolean" }}
      ]
    }}
  ],
  "relationships": [
    {{
      "source": "UserService",
      "target": "User",
      "type": "association",
      "cardinality": {{ "source": "1", "target": "many" }}
    }}
  ]
}}
"""


# --------------------------------------------------------------------------------------------------- #


ACTIVITY_DIAGRAM_JSON_TEMPLATE = """
You are an expert software architect and UML activity diagram specialist with deep expertise in modeling detailed application workflows and business processes.

Project Description:
{project_plan}

User Request:
{change_request}

{existing_context}

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