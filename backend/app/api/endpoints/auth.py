from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from pydantic import BaseModel, EmailStr, field_validator
import requests
from urllib.parse import urlencode

# JWT imports - MAKE SURE THESE ARE CORRECT
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError

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

def set_auth_cookie(response: Response, token: str) -> None:
    """Helper function to set authentication cookie"""
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        max_age=settings.COOKIE_MAX_AGE,
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/"
    )

def clear_auth_cookie(response: Response) -> None:
    """Helper function to clear authentication cookie"""
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        path="/",
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE
    )

@router.post("/token", response_model=Token)
async def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends()) -> Dict[str, str]:
    """
    OAuth2 compatible token login, get an access token for future requests
    Now sets httpOnly cookie in addition to returning token for backwards compatibility
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
    
    # Set httpOnly cookie
    set_auth_cookie(response, access_token)
    
    # Return the token (for backwards compatibility)
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(response: Response, current_user: User = Depends(get_current_user)):
    """
    Logout endpoint - clears the authentication cookie
    """
    clear_auth_cookie(response)
    return {"message": "Successfully logged out"}

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
    if datetime.now(tz=timezone.utc) > user.verification_token_expires.replace(tzinfo=timezone.utc):
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
async def google_callback(response: Response, code: str):
    """Handle Google OAuth callback - now returns token for frontend to handle"""
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
    
        # For OAuth, pass token in URL for frontend to handle cookie setting
        # This avoids cross-domain cookie issues
        params = urlencode({"token": jwt_token})
        return RedirectResponse(f"http://localhost:3000/auth/success?{params}")
    
    except Exception as e:
        params = urlencode({"error": "oauth_failed"})
        return RedirectResponse(f"http://localhost:3000/auth/login?{params}")

@router.get("/github")
async def github_login():
    """Redirect to GitHub OAuth"""
    github_auth_url = "https://github.com/login/oauth/authorize"
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
        "scope": "user:email",
        "state": "random_state_string"  # Add CSRF protection in production
    }
    url = f"{github_auth_url}?{urlencode(params)}"
    return {"auth_url": url}

@router.get("/github/callback")
async def github_callback(response: Response, code: str):
    """Handle GitHub OAuth callback - now returns token for frontend to handle"""
    try:
        # Exchange code for token
        token_url = "https://github.com/login/oauth/access_token"
        token_data = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
        }
        
        token_response = requests.post(
            token_url, 
            data=token_data,
            headers={"Accept": "application/json"}
        )
        token_json = token_response.json()
        access_token = token_json.get("access_token")
        
        # Get user info from GitHub
        user_info_url = "https://api.github.com/user"
        user_response = requests.get(
            user_info_url,
            headers={"Authorization": f"token {access_token}"}
        )
        user_data = user_response.json()
        
        # Get user email from GitHub (if not public)
        email = user_data.get("email")
        if not email:
            emails_response = requests.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"token {access_token}"}
            )
            emails = emails_response.json()
            # Get primary email
            for email_obj in emails:
                if email_obj.get("primary"):
                    email = email_obj.get("email")
                    break
        
        if not email:
            params = urlencode({"error": "no_email"})
            return RedirectResponse(f"http://localhost:3000/auth/login?{params}")
        
        # Find or create user
        user = User.objects(email=email).first()
        if not user:
            user = User.create_oauth_user(
                email=email,
                full_name=user_data.get("name") or user_data.get("login"),
                oauth_provider="github",
                oauth_id=str(user_data["id"])
            )
        
        # Create JWT token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        jwt_token = create_access_token(
            data={"sub": str(user.id)}, 
            expires_delta=access_token_expires
        )
    
        # For OAuth, pass token in URL for frontend to handle cookie setting
        # This avoids cross-domain cookie issues
        params = urlencode({"token": jwt_token})
        return RedirectResponse(f"http://localhost:3000/auth/success?{params}")
    
    except Exception as e:
        params = urlencode({"error": "oauth_failed"})
        return RedirectResponse(f"http://localhost:3000/auth/login?{params}")
    

class TokenExchangeRequest(BaseModel):
    token: str

@router.post("/oauth/exchange")
async def exchange_oauth_token(response: Response, request: TokenExchangeRequest):
    """Exchange OAuth token for httpOnly cookie"""
    try:
        token = request.token
                
        if not token:
            raise HTTPException(status_code=400, detail="Token required")
        
        # Verify the token using jose jwt (same as in deps.py)
        try:
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=[settings.ALGORITHM]
            )
            user_id = payload.get("sub")
                        
            if not user_id:
                raise HTTPException(status_code=400, detail="Invalid token payload")
            
        except ExpiredSignatureError:
            print("Token expired")  # Debug log
            raise HTTPException(status_code=400, detail="Token expired")
        except JWTError as e:
            print(f"JWT decode error: {str(e)}")  # Debug log
            raise HTTPException(status_code=400, detail="Invalid token format")
        
        # Verify user exists
        user = User.objects(id=user_id).first()
        if not user:
            print(f"User not found for id: {user_id}")  # Debug log
            raise HTTPException(status_code=400, detail="User not found")
        
        print(f"User found: {user.email}")  # Debug log
        
        # Set httpOnly cookie using the same function as login
        set_auth_cookie(response, token)
        
        
        return {"message": "Token exchanged successfully"}
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Unexpected error in token exchange: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")