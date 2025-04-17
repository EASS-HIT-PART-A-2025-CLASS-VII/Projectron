from typing import Dict, Any, Type, List, Optional
from pydantic import BaseModel, ValidationError
import json
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.output_parsers.json import SimpleJsonOutputParser

from app.services.ai.plan_prompts import REPAIR_PROMPT

async def validate_and_repair_json(
    response: Dict[str, Any], 
    model: Type[BaseModel], 
    llm_chain_creator,
    max_attempts: int = 3
) -> Dict[str, Any]:
    """
    Validates a JSON response against a Pydantic model and attempts to repair it if invalid.
    
    Args:
        response: The JSON response to validate
        model: The Pydantic model to validate against
        llm_chain_creator: Function to create an LLM chain
        max_attempts: Maximum number of repair attempts
        
    Returns:
        The validated (and possibly repaired) JSON response
    """
    # Try to validate with the model
    try:
        print(f"Validating JSON against model: {model.__name__}")
        validated_data = model(**response)
        return validated_data.model_dump()
    except ValidationError as e:
        # Get validation errors
        errors = e.errors()
        error_str = format_validation_errors(errors)
        
        # Get expected structure from model schema
        model_schema = model.model_json_schema()
        expected_structure = json.dumps(model_schema, indent=2)
        
        # Previous response
        previous_response = json.dumps(response, indent=2)
        
        repair_chain = llm_chain_creator(
        prompt_template=REPAIR_PROMPT,
        output_parser=SimpleJsonOutputParser()
     )
        
        # Try to repair
        attempts = 0
        while attempts < max_attempts:
            print(f"Attempt {attempts + 1} to repair JSON...")
            try:
                # Run the repair chain
                repaired_json = await repair_chain.ainvoke(
                    {"errors":error_str,
                    "expected_structure":expected_structure,
                    "total_hours": response.get("total_hours", 100),
                    "previous_response":previous_response}
                )        
                repaired_json = repaired_json.get("text", {})
                # Validate the repaired JSON
                validated_data = model(**repaired_json)
                return validated_data.model_dump()
                
            except ValidationError as e:
                errors = e.errors()
                error_str = format_validation_errors(errors)
                # Update previous response for next attempt
                previous_response = json.dumps(repaired_json)
                attempts += 1
                continue
                
        # If we get here, repair failed after max attempts
        raise ValueError(f"Failed to repair JSON after {max_attempts} attempts. Validation errors: {error_str}")

def format_validation_errors(errors):
    formatted_errors = []
    for error in errors:
        # Extract the location path as a chain
        loc_path = '.'.join(str(loc_part) for loc_part in error.get('loc', []))
        
        # Create more descriptive error message
        if error['type'] == 'missing':
            msg = f"MISSING FIELD: {loc_path} - Required field is missing"
        elif error['type'] == 'type_error':
            msg = f"TYPE ERROR: {loc_path} - Expected {error.get('ctx', {}).get('expected_type', 'proper type')}, got {type(error.get('input', '')).__name__}"
        elif error['type'] in ('less_than_equal', 'greater_than_equal'):
            constraint = error.get('ctx', {})
            limit_type = 'maximum' if error['type'] == 'less_than_equal' else 'minimum'
            limit_value = error.get('ctx', {}).get('le' if error.get('type') == 'less_than_equal' else 'ge')
            msg = f"CONSTRAINT ERROR: {loc_path} - Value {error.get('input')} exceeds {limit_type} of {limit_value}"
        else:
            # For other error types
            msg = f"VALIDATION ERROR: {loc_path} - {error.get('msg', 'Unknown error')}"
            
        # Add value information when available
        if 'input' in error and error.get('input', None) is not None:
            msg += f" (Current value: {error.get('input', "Unknown")})"
            
        formatted_errors.append(msg)
    
    return "\n".join(formatted_errors)