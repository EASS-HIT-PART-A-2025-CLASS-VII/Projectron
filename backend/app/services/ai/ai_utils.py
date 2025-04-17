from langchain_openai import ChatOpenAI
from app.core.config import get_settings

settings = get_settings()

def create_llm(temperature=0.1):
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
    
    
    # Create with explicit model name and API key
    return ChatOpenAI(
        model=settings.AI_MODEL_NAME,
        temperature=temperature,
        openai_api_key=api_key)  