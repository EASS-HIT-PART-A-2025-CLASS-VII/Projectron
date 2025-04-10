# app/services/llm_utils.py
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from typing import Any, Dict, Tuple, Optional
import json
import logging
from ...core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

"""
This file contains utility functions for interacting with language models.
It handles common operations like creating chains, extracting JSON from responses,
and managing the core LLM interaction patterns. These utilities abstract away
the complexities of working directly with LLMs.
"""

def create_llm(temperature=0.2, repair_mode=False):
    """
    Creates a language model instance with the specified configuration.
    
    Args:
        temperature: Controls randomness in the output (lower = more deterministic)
        repair_mode: If True, uses a higher temperature for creative repairs
    
    Returns:
        A configured ChatOpenAI instance from LangChain
    """
    api_key = settings.openai_api_key
    print(f"OpenAI API Key: {api_key}")  # Debugging line to check API key
    if not api_key:
        logger.error("OpenAI API key is missing or empty!")
        raise ValueError("OpenAI API key is required")
    
    # For repair operations, use slightly higher temperature
    temp = 0.4 if repair_mode else temperature
    
    # Create with explicit model name and API key
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=temp,
        openai_api_key=api_key,  # Make sure this is explicitly set
        model_kwargs={"top_p": 0.9}  # Add optional parameters
    )


def create_chain(prompt_template: str, output_parser=None, repair_mode=False, temperature=0.2):
    """
    Creates a LangChain chain with the given prompt template and configuration.
    
    Args:
        prompt_template: The template text with variables for the prompt
        output_parser: Optional parser to structure the LLM output
        repair_mode: If True, uses the repair LLM with higher temperature
    
    Returns:
        A configured LangChain Chain ready to be invoked
    """
    # Create the template
    prompt = ChatPromptTemplate.from_template(prompt_template)
    
    # Create the LLM
    llm = create_llm(temperature=temperature, repair_mode=repair_mode)
    
    # Debug info
    logger.debug(f"Creating chain with prompt template: {prompt_template[:50]}...")
    
    # Create and return the chain
    if output_parser:
        return LLMChain(llm=llm, prompt=prompt, output_parser=output_parser)
    return LLMChain(llm=llm, prompt=prompt)


async def extract_json_from_text(text: str, expected_start_char: str = None, expected_end_char: str = None) -> Tuple[Any, bool]:
    """
    Extract JSON content from LLM-generated text using multiple strategies.
    
    This function uses a series of increasingly flexible parsing strategies:
    1. Try to parse the entire text as JSON
    2. Look for JSON between expected start/end characters
    3. Extract from code blocks
    4. Extract items line by line (for lists)
    
    Args:
        text: The raw text from the LLM response
        expected_start_char: Expected first character of JSON (e.g., '{' or '[')
        expected_end_char: Expected last character of JSON (e.g., '}' or ']')
    
    Returns:
        Tuple of (parsed_content, success_flag)
    """
    print("STARTING JSON EXTRACTION")
    text = text.strip()
    
    # Case 1: The entire text is valid JSON
    if (expected_start_char is None or text.startswith(expected_start_char)) and \
       (expected_end_char is None or text.endswith(expected_end_char)):
        try:
            return json.loads(text), True
        except json.JSONDecodeError:
            pass  # Try other extraction methods
    
    # Case 2: JSON is embedded within text
    if expected_start_char and expected_end_char:
        start_idx = text.find(expected_start_char)
        end_idx = text.rfind(expected_end_char) + 1
        
        if start_idx >= 0 and end_idx > start_idx:
            json_content = text[start_idx:end_idx]
            try:
                return json.loads(json_content), True
            except json.JSONDecodeError:
                pass  # Continue to more aggressive parsing
    
    # Case 3: Extract from code blocks
    if "```json" in text or "```" in text:
        # Extract from code blocks
        code_block_start = text.find("```json")
        if code_block_start == -1:
            code_block_start = text.find("```")
        
        if code_block_start != -1:
            code_block_start = text.find("\n", code_block_start) + 1
            code_block_end = text.find("```", code_block_start)
            if code_block_end != -1:
                json_content = text[code_block_start:code_block_end].strip()
                try:
                    print("ENDING JSON EXTRACTION")
                    return json.loads(json_content), True
                except json.JSONDecodeError:
                    pass
    
    # Case 4: Line-by-line parsing for arrays (lists of questions, etc.)
    if expected_start_char == '[' and expected_end_char == ']':
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # Try to identify list items (for questions, etc.)
        items = []
        for line in lines:
            # Remove common list item prefixes
            if line.startswith('-') or line.startswith('*'):
                line = line[1:].strip()
            elif line.startswith('"') and line.endswith('"'):
                line = line.strip('"')
            elif line.startswith("'") and line.endswith("'"):
                line = line.strip("'")
            
            # Only add non-empty lines that aren't JSON syntax
            if line and not line.startswith('[') and not line.startswith(']'):
                items.append(line)
        
        if items:
            print("ENDING JSON EXTRACTION")
            return items, True
    
    # If all extraction attempts fail
    logger.warning(f"Failed to extract valid JSON from response: {text[:100]}...")
    print("ENDING JSON EXTRACTION")

    return None, False