from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import Optional

from app.core.config import get_settings
from app.db.models.auth import User

settings = get_settings()

# OAuth2 scheme for token extraction (fallback only)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token", auto_error=False)

def get_token_from_request(request: Request, token: Optional[str] = Depends(oauth2_scheme)) -> Optional[str]:
    """
    Get JWT token from cookies first, then fallback to Authorization header.
    
    Args:
        request: FastAPI Request object to access cookies
        token: Optional token from Authorization header
        
    Returns:
        str: The JWT token if found, None otherwise
    """
    # First try to get token from httpOnly cookie
    cookie_token = request.cookies.get(settings.COOKIE_NAME)
    if cookie_token:
        return cookie_token
    
    # Fallback to Authorization header (for backwards compatibility)
    return token

async def get_current_user(request: Request, token: Optional[str] = Depends(get_token_from_request)) -> User:
    """
    Dependency to get the current user from a JWT token (cookie or header).
    
    Args:
        request: FastAPI Request object
        token: The JWT token from cookie or Authorization header
        
    Returns:
        User: The current user
        
    Raises:
        HTTPException: If the token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
    
    try:
        # Decode the JWT token
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        # Extract the user ID from the token
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        # Token is invalid
        raise credentials_exception
        
    # Get the user from the database
    user = User.objects(id=user_id).first()
    if user is None:
        raise credentials_exception
        
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to ensure the user is active.
    
    Args:
        current_user: The current authenticated user
        
    Returns:
        User: The current active user
        
    Raises:
        HTTPException: If the user is not active
    """
    # Check if user has 'user' role
    if "user" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="User does not have sufficient permissions"
        )
    
    return current_user

async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to ensure the user is an admin.
    
    Args:
        current_user: The current authenticated user
        
    Returns:
        User: The current admin user
        
    Raises:
        HTTPException: If the user is not an admin
    """
    if "admin" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Admin privileges required"
        )
    
    return current_user