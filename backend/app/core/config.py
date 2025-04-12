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

    CORS_ORIGINS: List[Union[str, AnyHttpUrl]] = [
        "http://localhost:3000",  # Frontend URL
        "http://localhost:8000",  # Backend URL
    ]

    # MongoDB
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = "projectron"
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-jwt")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # EMAIL SERVICE
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER", "travel7450@gmail.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "rmcx lfdo olyb dhdm")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # OPENAI SERVICE
    AI_MODEL_NAME: str = "gpt-4o-mini"
    DIAGRAM_TEMPERATURE: float = 0.2
    openai_api_key: str = ""

    # SELENIUM
    # Settings related to the Sequence Diagram Generator
    SELENIUM_URL: str = "http://localhost:4444"  # URL of the Selenium standalone Chrome instance
    SEQUENCE_DIAGRAM_SITE_URL: str = "https://sequencediagram.org"  # URL of sequencediagram.org 
    SELENIUM_TIMEOUT: int = 30  # Timeout in seconds for Selenium operations
    MAX_DIAGRAM_ITERATIONS: int = 3  # Maximum number of iterations for diagram generation
    
    ENVIRONMENT: str = "development"  # "development", "staging", "production"
    ENABLE_MERMAID_CLI_VALIDATION: bool = True

    model_config = {
        "env_file": ".env",
        "extra": "ignore"  # Allow extra fields in environment variables
    }

@lru_cache()
def get_settings() -> Settings:
    return Settings()
