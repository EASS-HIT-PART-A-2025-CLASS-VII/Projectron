import json
from langchain_openai import ChatOpenAI
from app.core.config import get_settings

settings = get_settings()

def create_llm(temperature=0.1, json_mode=True, mode="strong") -> ChatOpenAI:
    """
    Creates a language model instance with the specified configuration.
    
    Args:
        temperature: Controls randomness in the output (lower = more deterministic)
    
    Returns:
        A configured ChatOpenAI instance from LangChain
    """
    api_key = settings.openai_api_key
    # api_key = settings.ANTHROPIC_API_KEY
    if not api_key:
        print("OpenAI API key is missing or empty!")
        raise ValueError("OpenAI API key is required")
    
    model = settings.AI_MODEL_STRONG
    # Create with explicit model name and API key
    if mode == "fast":
        model = settings.AI_MODEL_FAST

    return ChatOpenAI(
        model=model,
        temperature=temperature,
        openai_api_key=api_key,
        response_format={"type": "json_object"} if json_mode else None,
        )  

def compact_json(obj) -> str:
    """Serialize obj without any whitespace – saves ≈25 % tokens."""
    return json.dumps(obj, separators=(",", ":"))