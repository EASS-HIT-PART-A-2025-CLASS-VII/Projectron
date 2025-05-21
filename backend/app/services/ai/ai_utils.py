import json
from langchain_openai import ChatOpenAI
from app.core.config import get_settings
from langchain_anthropic import ChatAnthropic

settings = get_settings()

def create_llm(temperature=0.1, json_mode=True, model='gpt-4o-mini', max_tokens=14000) -> ChatOpenAI:
    """
    Creates a language model instance with the specified configuration.
    
    Args:
        temperature: Controls randomness in the output (lower = more deterministic)
        json_mode: Whether to force the response to be in JSON format
        model: The OpenAI model to use (supported: gpt-4o-mini, gpt-4.1-mini, gpt-4.1-nano, gpt-o4-mini)
        max_tokens: Maximum tokens for model response (default: 14000)
    
    Returns:
        A configured ChatOpenAI instance from LangChain
    """
    api_key = settings.openai_api_key

    if not api_key:
        print("OpenAI API key is missing or empty!")
        raise ValueError("OpenAI API key is required")
    
    # List of specifically supported models
    supported_models = [
        'gpt-4o-mini',
        'gpt-4.1-mini',
        'gpt-4.1-nano',
        'o4-mini'
    ]
    
    # Validate that the model is supported
    if model not in supported_models:
        print(f"Warning: Model '{model}' is not in the list of specifically supported models: {supported_models}")
        print(f"Proceeding with model '{model}' anyway, but this may cause errors if the model name is invalid.")

    try: 
        return ChatOpenAI(
            model=model,
            temperature=temperature,
            openai_api_key=api_key,
            max_tokens=max_tokens,
            response_format={"type": "json_object"} if json_mode else None,
        )

    except Exception as e:
        print(f"Error creating LLM instance: {e}")
        raise ValueError("Failed to create LLM instance")
    

def compact_json(obj) -> str:
    """Serialize obj without any whitespace – saves ≈25 % tokens."""
    return json.dumps(obj, separators=(",", ":"))