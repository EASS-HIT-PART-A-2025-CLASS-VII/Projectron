from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from pydantic import BaseModel, EmailStr, field_validator
import requests
from urllib.parse import urlencode
from app.core.config import get_settings
from app.core.jwt import create_access_token
from app.db.models.auth import User
from app.api.deps import get_current_user
from app.services.email_service import EmailService



router = APIRouter()
settings = get_settings()


# Schemas for request/response validation
class Token(BaseModel):
    access_token: str
    token_type: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    roles: list
    last_login: Optional[datetime] = None
    created_at: datetime
    
        
    @field_validator('id', mode='before')
    def objectid_to_str(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

class ResendRequest(BaseModel):
    email: EmailStr

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Dict[str, str]:
    """
    OAuth2 compatible token login, get an access token for future requests
    
    This endpoint is used to authenticate users and generate JWT tokens.
    It follows the OAuth2 password flow standard.
    """
    # Get the user by email
    user = User.objects(email=form_data.username).first()
    
    # Check if user exists and password is correct
    if not user or not user.check_password(form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please check your inbox to verify your email."
        )

    # Update last login time
    user.last_login = datetime.now(tz=timezone.utc)

    user.save()
    
    # Create access token with user ID as the subject
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, 
        expires_delta=access_token_expires
    )
    
    # Return the token
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate) -> Any:
    """
    Register new user
    
    This endpoint creates a new user account with the provided details.
    """
    # Check if the user already exists
    existing_user = User.objects(email=user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user with the User.create_user class method
    user = User.create_user(
        email=user_in.email,
        password=user_in.password,
        full_name=user_in.full_name
    )
    
    token = user.generate_verification_token()
    
    # Send verification email
    EmailService.send_verification_email(user.email, token)

    return user


@router.get("/verify-email")
def verify_email(token: str):
    """
    Verify user email with token
    """
    # Find user with this token
    user = User.objects(verification_token=token).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    # Check if token has expired
    if datetime.now(tz=timezone.utc) > user.verification_token_expires:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired"
        )
    
    # Mark email as verified
    user.is_email_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    user.save()
    
    # Return success response
    return {"message": "Email successfully verified"}


@router.post("/resend-verification")
def resend_verification_email(request: ResendRequest):
    """
    Resend verification email
    """
    # Find user
    user = User.objects(email=request.email).first()
    if not user:
        # Don't reveal that email doesn't exist for security
        return {"message": "If your email exists, a verification link will be sent"}
    
    # If already verified, don't send
    if user.is_email_verified:
        return {"message": "Email already verified"}
    
    # Generate new token
    token = user.generate_verification_token()
    
    # Send verification email
    EmailService.send_verification_email(user.email, token)
    
    return {"message": "Verification email sent"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get current user
    
    This endpoint returns the currently authenticated user's information.
    """
    return current_user


@router.get("/google")
async def google_login():
    """Redirect to Google OAuth"""
    google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "scope": "openid email profile",
        "response_type": "code",
        "state": "random_state_string"  # Add CSRF protection in production
    }
    url = f"{google_auth_url}?{urlencode(params)}"
    return {"auth_url": url}

@router.get("/google/callback")
async def google_callback(code: str):
    """Handle Google OAuth callback"""
    # Exchange code for token
    try:
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()
        access_token = token_json.get("access_token")
        
        # Get user info from Google
        user_info_url = f"https://www.googleapis.com/oauth2/v2/userinfo?access_token={access_token}"
        user_response = requests.get(user_info_url)
        user_data = user_response.json()
        
        # Find or create user
        user = User.objects(email=user_data["email"]).first()
        if not user:
            user = User.create_oauth_user(
                email=user_data["email"],
                full_name=user_data["name"],
                oauth_provider="google",
                oauth_id=user_data["id"]
            )
        
        # Create JWT token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        jwt_token = create_access_token(
            data={"sub": str(user.id)}, 
            expires_delta=access_token_expires
        )
    
        params = urlencode({"token": jwt_token})
        return RedirectResponse(f"http://localhost:3000/auth/success?{params}")
    
    except Exception as e:
        params = urlencode({"error": "oauth_failed"})
        return RedirectResponse(f"http://localhost:3000/auth/login?{params}")