import logging
import re
from typing import Optional, Tuple, Literal, Dict, Any
import json
import tempfile
import subprocess
import os

from langchain.schema import HumanMessage

from app.core.config import get_settings
from app.services.ai.ai_utils import compact_json, create_llm
from app.services.ai.diagram_prompts import (
    CLASS_DIAGRAM_JSON_TEMPLATE,
    ACTIVITY_DIAGRAM_JSON_TEMPLATE
)
from app.utils.timing import timed

logger = logging.getLogger(__name__)
settings = get_settings()
DiagramType = Literal["class", "activity"]

@timed
async def generate_or_update_diagram(
    project_plan: str,
    existing_json: Optional[str] = None,
    change_request: str = "",
    diagram_type: DiagramType = "class"
) -> Dict[str, Any]:
    """
    Generate or update a diagram based on the project plan and change request,
    using an intermediate JSON representation.
    
    Args:
        project_plan: The textual description of the project.
        existing_json: Existing diagram JSON (as a string) if available.
        change_request: Natural language request to modify the diagram.
        diagram_type: Diagram type: "class", "sequence", or "activity".
    
    Returns:
        dict: Updated diagram representation as JSON.
    """
    # Initialize the language model with appropriate temperature
    llm = create_llm(temperature=settings.DIAGRAM_TEMPERATURE)
    
    # Select the appropriate JSON template based on diagram type
    template_map = {
        "class": CLASS_DIAGRAM_JSON_TEMPLATE,
        "activity": ACTIVITY_DIAGRAM_JSON_TEMPLATE,
    }
    template = template_map.get(diagram_type)
    
    if not template:
        raise ValueError(f"Unsupported diagram type: {diagram_type}")
    
    # Include the existing diagram JSON context if available
    existing_context = ""
    
    if existing_json:
        try:
            # Format the JSON for readability in the prompt
            parsed_json = json.loads(existing_json)
            pretty_json = json.dumps(parsed_json, indent=2)
            existing_context = (f"Your task is to **update** the current diagram JSON to reflect the requested changes. You must:"
                                f"- Carefully study the existing diagram and maintain its core structure."
                                f"- Implement user-requested changes accurately without unnecessary modifications."
                                f"- Ensure the resulting diagram remains valid and logically consistent."
                                f"- Current {diagram_type} Diagram in JSON format:\n{pretty_json}\n")
        except json.JSONDecodeError:
            # If the existing JSON is invalid, use it as is with a warning
            logger.warning("Existing diagram JSON is not valid JSON, using as raw text")
            existing_context = f"Current {diagram_type} Diagram in JSON format:\n{existing_json}\n"
    
    # Format the prompt with input values
    formatted_prompt = template.format(
        project_plan=project_plan,
        existing_context=existing_context,
        change_request=change_request,
    )
    
    # Create the LLM message
    messages = [HumanMessage(content=formatted_prompt)]
    
    try:
        # Get response from the AI service
        response = await llm.ainvoke(messages)
        diagram_json_str = extract_json_from_text(response.content)
        
        try:
            diagram_data = json.loads(diagram_json_str)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse initial JSON: {e}")
            logger.debug(f"Raw JSON string: {diagram_json_str}")
            
            # Try to fix common JSON parsing issues
            fixed_json_str = fix_common_json_issues(diagram_json_str)
            try:
                diagram_data = json.loads(fixed_json_str)
                logger.info("Successfully fixed malformed JSON")
            except json.JSONDecodeError:
                # If fixing fails, raise the original error
                raise ValueError(f"Failed to parse diagram JSON: {str(e)}")
        
        # Validate the generated JSON against the expected schema
        is_valid, error_message = validate_json_diagram(diagram_data, diagram_type)
        
        if not is_valid:
            logger.warning(f"Generated invalid diagram JSON: {error_message}")
            
            # Try a correction cycle with an explicit correction prompt
            correction_prompt = f"""
                You are an expert software architect and diagram generation specialist.
                The JSON representation you generated contains schema errors.
                ERROR: {error_message}
                DIAGRAM TYPE: {diagram_type}

                Your job is to fix the following JSON so that it exactly adheres to the defined schema.
                The fixed JSON should include ALL required fields and be syntactically valid.
                Return ONLY the corrected JSON without any additional text.

                ORIGINAL JSON:
                {compact_json(diagram_data)}
                
                Expected schema for {diagram_type} diagram:
                {get_schema_description(diagram_type)}
                """
            correction_messages = [HumanMessage(content=correction_prompt)]
            correction_response = await llm.ainvoke(correction_messages)
            corrected_json_str = extract_json_from_text(correction_response.content)
            
            try:
                diagram_data = json.loads(corrected_json_str)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse corrected JSON: {e}")
                # Try to fix common JSON parsing issues in the correction
                fixed_json_str = fix_common_json_issues(corrected_json_str)
                try:
                    diagram_data = json.loads(fixed_json_str)
                except json.JSONDecodeError:
                    raise ValueError(f"Failed to parse corrected diagram JSON: {str(e)}")
            
            # Validate again after correction
            is_valid, error_message = validate_json_diagram(diagram_data, diagram_type)
            
            if not is_valid:
                raise ValueError(f"Failed to generate valid diagram JSON after correction: {error_message}")
        
        return diagram_data
    except Exception as e:
        logger.error(f"Error generating diagram: {str(e)}")
        raise

def extract_json_from_text(text: str) -> str:
    """
    Extract the first JSON object from text.
    Handles various ways the LLM might format JSON in responses.
    """
    # Check if the entire text is valid JSON
    text = text.strip()
    try:
        json.loads(text)
        return text
    except json.JSONDecodeError:
        pass
    
    # Look for JSON within code blocks
    import re
    code_block_pattern = r"```(?:json)?\s*([\s\S]*?)```"
    matches = re.findall(code_block_pattern, text)
    
    if matches:
        for match in matches:
            try:
                json.loads(match.strip())
                return match.strip()
            except json.JSONDecodeError:
                continue
    
    # Fall back to finding the first { and last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start:end+1].strip()
    
    # If all else fails, return the original text
    return text

def fix_common_json_issues(json_str: str) -> str:
    """
    Fix common JSON formatting issues that might be generated by the LLM.
    """
    # Replace single quotes with double quotes (except in literal strings)
    fixed = ""
    in_string = False
    for i, char in enumerate(json_str):
        if char == '"':
            # Check if this quote is escaped
            if i > 0 and json_str[i-1] == '\\':
                fixed += char
                continue
            in_string = not in_string
            fixed += char
        elif char == "'" and not in_string:
            fixed += '"'
        else:
            fixed += char
    
    # Remove trailing commas in arrays and objects
    fixed = re.sub(r',\s*}', '}', fixed)
    fixed = re.sub(r',\s*]', ']', fixed)
    
    return fixed

def validate_json_diagram(diagram_data: dict, diagram_type: DiagramType) -> Tuple[bool, str]:
    """
    Validate the diagram JSON based on the schema for the given diagram type.
    Returns (is_valid, error_message)
    """
    # Define expected keys for each diagram type
    expected_schema = {
        "class": {"classes", "relationships"},
        "sequence": {"participants", "messages"},
        "activity": {"nodes", "flows"}
    }
    
    expected_keys = expected_schema.get(diagram_type)
    if not expected_keys:
        return False, f"No schema defined for diagram type: {diagram_type}"
    
    missing_keys = expected_keys - set(diagram_data.keys())
    if missing_keys:
        return False, f"Missing keys in diagram JSON: {missing_keys}"
    
    # Additional type-specific validations
    if diagram_type == "class":
        return validate_class_diagram(diagram_data)
    elif diagram_type == "activity":
        return validate_activity_diagram(diagram_data)
    
    return True, ""

def validate_class_diagram(diagram_data: dict) -> Tuple[bool, str]:
    """Validate class diagram JSON structure."""
    classes = diagram_data.get("classes", [])
    relationships = diagram_data.get("relationships", [])
    
    # Check that classes is a list
    if not isinstance(classes, list):
        return False, "classes must be a list"
    
    # Check each class has required fields
    for i, cls in enumerate(classes):
        if not isinstance(cls, dict):
            return False, f"Class at index {i} is not an object"
        
        if "name" not in cls:
            return False, f"Class at index {i} missing required field 'name'"
        
        # Check attributes if present
        attributes = cls.get("attributes", [])
        if not isinstance(attributes, list):
            return False, f"attributes for class '{cls.get('name', f'at index {i}')}' must be a list"
        
        for j, attr in enumerate(attributes):
            if not isinstance(attr, dict):
                return False, f"Attribute at index {j} for class '{cls.get('name')}' is not an object"
            
            required_attr_fields = {"visibility", "name", "type"}
            missing_attr_fields = required_attr_fields - set(attr.keys())
            if missing_attr_fields:
                return False, f"Attribute at index {j} for class '{cls.get('name')}' missing fields: {missing_attr_fields}"
        
        # Check methods if present
        methods = cls.get("methods", [])
        if not isinstance(methods, list):
            return False, f"methods for class '{cls.get('name')}' must be a list"
        
        for j, method in enumerate(methods):
            if not isinstance(method, dict):
                return False, f"Method at index {j} for class '{cls.get('name')}' is not an object"
            
            required_method_fields = {"visibility", "name", "return_type"}
            missing_method_fields = required_method_fields - set(method.keys())
            if missing_method_fields:
                return False, f"Method at index {j} for class '{cls.get('name')}' missing fields: {missing_method_fields}"
    
    # Check relationships
    if not isinstance(relationships, list):
        return False, "relationships must be a list"
    
    for i, rel in enumerate(relationships):
        if not isinstance(rel, dict):
            return False, f"Relationship at index {i} is not an object"
        
        required_rel_fields = {"source", "target", "type"}
        missing_rel_fields = required_rel_fields - set(rel.keys())
        if missing_rel_fields:
            return False, f"Relationship at index {i} missing fields: {missing_rel_fields}"
        
        valid_rel_types = {"inheritance", "composition", "aggregation", "association", "bidirectional"}
        if rel.get("type") not in valid_rel_types:
            return False, f"Relationship at index {i} has invalid type: {rel.get('type')}"
    
    return True, ""

def validate_activity_diagram(diagram_data: dict) -> Tuple[bool, str]:
    """Validate activity diagram JSON structure."""
    nodes = diagram_data.get("nodes", [])
    flows = diagram_data.get("flows", [])
    
    # Check that nodes is a list
    if not isinstance(nodes, list):
        return False, "nodes must be a list"
    
    # Check each node has required fields
    node_ids = set()
    for i, node in enumerate(nodes):
        if not isinstance(node, dict):
            return False, f"Node at index {i} is not an object"
        
        if "id" not in node:
            return False, f"Node at index {i} missing required field 'id'"
        
        if "type" not in node:
            return False, f"Node at index {i} missing required field 'type'"
        
        if "label" not in node:
            return False, f"Node at index {i} missing required field 'label'"
        
        valid_types = {"start", "end", "activity", "decision", "merge", "fork", "join"}
        if node.get("type") not in valid_types:
            return False, f"Node at index {i} has invalid type: {node.get('type')}"
        
        node_ids.add(node.get("id"))
    
    # Check that at least one start node exists
    start_nodes = [node for node in nodes if node.get("type") == "start"]
    if not start_nodes:
        return False, "Activity diagram must have at least one start node"
    
    # Check that at least one end node exists
    end_nodes = [node for node in nodes if node.get("type") == "end"]
    if not end_nodes:
        return False, "Activity diagram must have at least one end node"
    
    # Check flows
    if not isinstance(flows, list):
        return False, "flows must be a list"
    
    for i, flow in enumerate(flows):
        if not isinstance(flow, dict):
            return False, f"Flow at index {i} is not an object"
        
        required_flow_fields = {"source", "target"}
        missing_flow_fields = required_flow_fields - set(flow.keys())
        if missing_flow_fields:
            return False, f"Flow at index {i} missing fields: {missing_flow_fields}"
        
        # Check that source and target exist in nodes
        source = flow.get("source")
        target = flow.get("target")
        
        if source not in node_ids:
            return False, f"Flow at index {i} has source '{source}' that is not a defined node"
        
        if target not in node_ids:
            return False, f"Flow at index {i} has target '{target}' that is not a defined node"
        
        # Decision nodes should have condition on outgoing flows
        source_node = next((node for node in nodes if node.get("id") == source and node.get("type") == "decision"), None)
        if source_node and "condition" not in flow:
            return False, f"Flow at index {i} from decision node '{source}' missing condition"
    
    return True, ""

def get_schema_description(diagram_type: DiagramType) -> str:
    """Return a text description of the expected schema for a diagram type."""
    if diagram_type == "class":
        return """{
  "classes": [
    {
      "name": "string",
      "attributes": [
        {
          "visibility": "+" | "-" | "#",
          "name": "string",
          "type": "string"
        }
      ],
      "methods": [
        {
          "visibility": "+" | "-" | "#",
          "name": "string",
          "parameters": [
            {
              "name": "string",
              "type": "string"
            }
          ],
          "return_type": "string"
        }
      ]
    }
  ],
  "relationships": [
    {
      "source": "string",
      "target": "string",
      "type": "inheritance" | "composition" | "aggregation" | "association" | "bidirectional",
      "cardinality": {
        "source": "string",
        "target": "string"
      }
    }
  ]
}"""
    # Add schema descriptions for other diagram types
    return "Schema details not available for this diagram type"

def generate_svg_from_json(diagram_data: dict, diagram_type: DiagramType) -> str:
    """
    Generate an SVG string from a valid diagram JSON representation.
    
    Args:
        diagram_data: Validated diagram JSON object
        diagram_type: Type of diagram to generate
        
    Returns:
        str: SVG content as a string
    """
    # Select the appropriate renderer based on diagram type
    if diagram_type == "class":
        return render_class_diagram_svg(diagram_data)
    elif diagram_type == "activity":
        return render_activity_diagram_svg(diagram_data)
    else:
        raise ValueError(f"Unsupported diagram type: {diagram_type}")

def render_class_diagram_svg(diagram_data: dict) -> str:
    """
    Render a class diagram as SVG using Graphviz.
    
    Args:
        diagram_data: Validated class diagram JSON object
        
    Returns:
        str: SVG content as a string
    """
    dot_str = convert_class_diagram_to_dot(diagram_data)
    return render_dot_to_svg(dot_str)


def render_activity_diagram_svg(diagram_data: dict) -> str:
    """Render an activity diagram as SVG."""
    dot_str = convert_activity_diagram_to_dot(diagram_data)
    return render_dot_to_svg(dot_str)

def convert_class_diagram_to_dot(diagram_data: dict) -> str:
    """
    Convert class diagram JSON to DOT language.
    
    Args:
        diagram_data: Validated class diagram JSON object
        
    Returns:
        str: DOT language representation
    """
    # Start building the DOT string
    dot = [
        "digraph ClassDiagram {", 
        "  graph [rankdir=TB, splines=polyline, nodesep=0.8, ranksep=1.0];",
        "  node [shape=record, fontname=\"Arial\", fontsize=10];",
        "  edge [fontname=\"Arial\", fontsize=9];"
    ]
    
    # Process each class
    for cls in diagram_data.get("classes", []):
        class_name = cls["name"]
        attributes = cls.get("attributes", [])
        methods = cls.get("methods", [])
        
        # Start building the label compartments.
        # We'll create three compartments for name, attributes, and methods.
        label_parts = [f"<f0> {class_name}"]
        
        # Attributes compartment: Escape any problematic characters in type names.
        if attributes:
            attr_lines = []
            for attr in attributes:
                visibility = attr["visibility"]
                name = attr["name"]
                type_name = attr["type"].replace("<", "\\<").replace(">", "\\>")
                attr_lines.append(f"{visibility} {name}: {type_name}")
            label_parts.append(f"<f1> {' \\l '.join(attr_lines)}\\l")
        
        # Methods compartment
        if methods:
            method_lines = []
            for method in methods:
                visibility = method["visibility"]
                name = method["name"]
                # Process parameters and escape type names there, too.
                params = method.get("parameters", [])
                param_str = ", ".join([
                    f"{p.get('name', '')}: {p.get('type', '').replace('<', '\\<').replace('>', '\\>')}" 
                    for p in params
                ])
                return_type = method["return_type"].replace("<", "\\<").replace(">", "\\>")
                method_lines.append(f"{visibility} {name}({param_str}): {return_type}")
            label_parts.append(f"<f2> {' \\l '.join(method_lines)}\\l")
        
        # Add the class node using record format.
        dot.append(f"  \"{class_name}\" [label=\"{{{' | '.join(label_parts)}}}\"];")
    
    # Process relationships
    for rel in diagram_data.get("relationships", []):
        source = rel["source"]
        target = rel["target"]
        rel_type = rel["type"]
        cardinality = rel.get("cardinality", {})
        
        # Set edge attributes based on relationship type
        edge_attrs = {}
        if rel_type == "inheritance":
            edge_attrs["arrowhead"] = "empty"
            edge_attrs["style"] = "solid"
        elif rel_type == "composition":
            edge_attrs["arrowhead"] = "diamond"
            edge_attrs["style"] = "filled"
        elif rel_type == "aggregation":
            edge_attrs["arrowhead"] = "odiamond"
            edge_attrs["style"] = "solid"
        elif rel_type == "association":
            edge_attrs["arrowhead"] = "vee"
            edge_attrs["style"] = "solid"
        elif rel_type == "bidirectional":
            edge_attrs["dir"] = "both"
            edge_attrs["arrowhead"] = "vee"
            edge_attrs["arrowtail"] = "vee"
        
        # Add cardinality as label if present
        if cardinality:
            source_card = cardinality.get("source", "")
            target_card = cardinality.get("target", "")
            if source_card or target_card:
                edge_attrs["label"] = f"{source_card}..{target_card}"
        
        # Build edge attribute string.
        attr_str = ", ".join([f'{k}="{v}"' for k, v in edge_attrs.items()])
        dot.append(f"  \"{source}\" -> \"{target}\" [{attr_str}];")
    
    dot.append("}")
    return "\n".join(dot)


def convert_activity_diagram_to_dot(diagram_data: dict) -> str:
    """
    Convert activity diagram JSON to DOT language.
    
    Expected JSON schema:
    {
      "nodes": [
        { "id": string, "type": "start" | "end" | "activity" | "decision", "label": string }
      ],
      "flows": [
        { "source": string, "target": string, "condition": string }
      ]
    }
    
    This implementation uses the node type to set a shape:
     - "start": circle
     - "end": doublecircle
     - "decision": diamond
     - "activity": box
    Flows are represented as edges, optionally labeled with a condition.
    """
    dot = [
        "digraph ActivityDiagram {",
        "  rankdir=TB;",
        "  node [fontname=\"Arial\", fontsize=10];"
    ]
    
    nodes = diagram_data.get("nodes", [])
    flows = diagram_data.get("flows", [])
    
    # Create nodes with shapes based on type.
    for node in nodes:
        node_id = node.get("id")
        node_type = node.get("type")
        label = node.get("label", "").replace('"', '\\"')
        if node_type == "start":
            shape = "circle"
        elif node_type == "end":
            shape = "doublecircle"
        elif node_type == "decision":
            shape = "diamond"
        else:  # For "activity" and any unknown type
            shape = "box"
        dot.append(f'  "{node_id}" [label="{label}", shape={shape}];')
    
    # Create flows as edges, adding condition labels if provided.
    for flow in flows:
        source = flow.get("source")
        target = flow.get("target")
        condition = flow.get("condition", "").replace('"', '\\"')
        if condition:
            dot.append(f'  "{source}" -> "{target}" [label="{condition}"];')
        else:
            dot.append(f'  "{source}" -> "{target}";')
    
    dot.append("}")
    return "\n".join(dot)


def render_dot_to_svg(dot_str: str) -> str:
    """
    Render DOT string to SVG using Graphviz.
    
    Args:
        dot_str: DOT language representation
        
    Returns:
        str: SVG content as a string
    """
    try:
        # Create a temporary file for DOT input
        with tempfile.NamedTemporaryFile(mode='w', suffix='.dot', delete=False) as dot_file:
            dot_file.write(dot_str)
            dot_path = dot_file.name
        
        # Create a temporary file for SVG output
        svg_path = dot_path + '.svg'
        
        # Run Graphviz dot command
        result = subprocess.run(
            ['dot', '-Tsvg', dot_path, '-o', svg_path],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Read the SVG file
        with open(svg_path, 'r') as svg_file:
            svg_content = svg_file.read()
        
        # Clean up temporary files
        os.unlink(dot_path)
        os.unlink(svg_path)
        
        return svg_content
    except Exception as e:
        logger.error(f"Error rendering DOT to SVG: {str(e)}")
        if 'result' in locals():
            logger.error(f"Graphviz stderr: {result.stderr}")
        raise ValueError(f"Failed to render diagram: {str(e)}")