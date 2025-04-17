from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import Optional

from app.core.config import get_settings
from app.db.models.auth import User

settings = get_settings()
# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Dependency to get the current user from a JWT token.
    
    Args:
        token: The JWT token from the Authorization header
        
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
    # user = user_repo.get(id=user_id)
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