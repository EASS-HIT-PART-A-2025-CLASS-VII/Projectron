import os
from typing import Optional, Dict, Any, List, Union
from pydantic import AnyHttpUrl, field_validator
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from functools import lru_cache

# Load environment variables from .env file
load_dotenv()
class Settings(BaseSettings):
    """Application settings."""    

    PROJECT_NAME: str = "Projectron"
    API_V1_STR: str = "/api/endpoints"

    FRONTEND_URL: str = "http://localhost:3000" 

    CORS_ORIGINS: List[Union[str, AnyHttpUrl]] = [
        "http://localhost:3000",  # Frontend DEV URL
        FRONTEND_URL,  # Frontend URL from environment variable
        "http://localhost:8000",  # Backend URL
    ]

    # MongoDB
    MONGODB_URI: str 
    MONGODB_DB_NAME: str = "projectron"
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 48 * 60
    
    # EMAIL SERVICE
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int =  587
    SMTP_USER: str 
    SMTP_PASSWORD: str 
    
    # OPENAI SERVICE
    AI_MODEL_STRONG: str = "gpt-4o-mini"
    AI_MODEL_FAST: str = "gpt-4.1-nano"

    DIAGRAM_TEMPERATURE: float = 0.2
    openai_api_key: str = ""

    # ANTHROPIC SERVICE
    ANTHROPIC_API_KEY: str 

    # SELENIUM
    # Settings related to the Sequence Diagram Generator
    SELENIUM_URL: str = "http://localhost:4444"  # URL of the Selenium standalone Chrome instance
    SEQUENCE_DIAGRAM_SITE_URL: str = "https://sequencediagram.org"  # URL of sequencediagram.org 
    SELENIUM_TIMEOUT: int = 30  # Timeout in seconds for Selenium operations
    MAX_DIAGRAM_ITERATIONS: int = 3  # Maximum number of iterations for diagram generation
    
    ENVIRONMENT: str = "development"  # "development", "staging", "production"
    ENABLE_MERMAID_CLI_VALIDATION: bool = True

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI:str 
    
    model_config = {
        "env_file": ".env",
        "extra": "ignore"  # Allow extra fields in environment variables
    }

@lru_cache()
def get_settings() -> Settings:
    return Settings()
