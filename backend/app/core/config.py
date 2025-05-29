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
        FRONTEND_URL, 
        "http://localhost:8000",  # Backend URL
    ]

    # MongoDB
    MONGODB_URI: str 
    MONGODB_DB_NAME: str = "projectron"
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 48 * 60
    
    # Cookie Settings - NEW
    COOKIE_NAME: str = "access_token"
    COOKIE_HTTPONLY: bool = True
    COOKIE_SECURE: bool = False  # Set to True in production with HTTPS
    COOKIE_SAMESITE: str = "lax"  # "strict", "lax", or "none"
    COOKIE_MAX_AGE: int = ACCESS_TOKEN_EXPIRE_MINUTES * 60 
    
    # EMAIL SERVICE
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int =  587
    SMTP_USER: str 
    SMTP_PASSWORD: str 

    DIAGRAM_TEMPERATURE: float = 0.2
    openai_api_key: str = ""

    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.5-flash-preview-05-20"

    # SELENIUM
    # Settings related to the Sequence Diagram Generator
    SELENIUM_URL: str # = "http://localhost:4444"  # URL of the Selenium standalone Chrome instance
    SEQUENCE_DIAGRAM_SITE_URL: str = "https://sequencediagram.org"  
    SELENIUM_TIMEOUT: int = 30 
    MAX_DIAGRAM_ITERATIONS: int = 3  # Maximum number of iterations for diagram generation
    
    ENVIRONMENT: str = "development" 
    ENABLE_MERMAID_CLI_VALIDATION: bool = True

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI:str 
    

    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    GITHUB_REDIRECT_URI: str

    model_config = {
        "env_file": ".env",
        "extra": "ignore"  # Allow extra fields in environment variables
    }

@lru_cache()
def get_settings() -> Settings:
    return Settings()