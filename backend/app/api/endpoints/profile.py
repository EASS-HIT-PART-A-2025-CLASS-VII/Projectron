from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime, timezone
import hashlib
from bson import ObjectId

from app.api.deps import get_current_user
from app.db.models.auth import User

router = APIRouter()

# Response Models
class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: datetime
    is_active: bool
    total_projects: int
    last_login: Optional[datetime] = None
    roles: list

    @field_validator('id', mode='before')
    def objectid_to_str(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

# Request Models
class UpdateProfileRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="User's full name")

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, description="Current password")
    new_password: str = Field(..., min_length=8, description="New password (minimum 8 characters)")

class PasswordChangeResponse(BaseModel):
    message: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash using SHA256."""
    hashed = hashlib.sha256(plain_password.encode()).hexdigest()
    return hashed == hashed_password

def get_password_hash(password: str) -> str:
    """Generate SHA256 password hash."""
    return hashlib.sha256(password.encode()).hexdigest()

def get_user_project_count(user_id: str) -> int:
    """Get the total number of projects for a user."""
    try:
        # Import here to avoid circular imports
        from app.db.models.project import Project
        
        # Count projects where user_id matches
        count = Project.objects(owner_id=user_id).count()
        return count
    except Exception as e:
        print(f"Error counting projects for user {user_id}: {e}")
        return 0

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get the current user's profile information including project count.
    """
    try:
        # Get user's project count
        project_count = get_user_project_count(str(current_user.id))
        
        # Build profile response
        profile_data = UserProfileResponse(
            id=str(current_user.id),
            email=current_user.email,
            full_name=current_user.full_name,
            created_at=current_user.created_at,
            is_active=getattr(current_user, 'is_active', True),  # Default to True if field doesn't exist
            total_projects=project_count,
            last_login=current_user.last_login,
            roles=current_user.roles or []
        )
        
        return profile_data
    
    except Exception as e:
        print(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve profile information"
        )

@router.put("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile_data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Update the current user's profile information.
    """
    try:
        # Update user's full name
        current_user.full_name = profile_data.full_name.strip()
        current_user.save()
        
        # Get project count
        project_count = get_user_project_count(str(current_user.id))
        
        # Return updated profile
        return UserProfileResponse(
            id=str(current_user.id),
            email=current_user.email,
            full_name=current_user.full_name,
            created_at=current_user.created_at,
            is_active=getattr(current_user, 'is_active', True),
            total_projects=project_count,
            last_login=current_user.last_login,
            roles=current_user.roles or []
        )
    
    except Exception as e:
        print(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

@router.post("/change-password", response_model=PasswordChangeResponse)
async def change_user_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Change the current user's password.
    """
    try:
        # Verify current password
        if not current_user.check_password(password_data.current_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Check if new password is different from current
        new_hashed = get_password_hash(password_data.new_password)
        if new_hashed == current_user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from current password"
            )
        
        # Update password
        current_user.hashed_password = new_hashed
        current_user.save()
        
        return PasswordChangeResponse(message="Password changed successfully")
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error changing password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )

@router.get("/profile/stats")
async def get_user_stats(current_user: User = Depends(get_current_user)):
    """
    Get additional user statistics.
    """
    try:
        # Import here to avoid circular imports
        from app.db.models.project import Project
        
        # Get all projects for the user
        user_projects = Project.objects(user_id=str(current_user.id))
        
        # Count projects by status
        status_counts = {}
        for project in user_projects:
            status = getattr(project, 'status', 'unknown')
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Get recent project activity (last 30 days)
        from datetime import timedelta
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        
        recent_projects = 0
        for project in user_projects:
            if hasattr(project, 'created_at') and project.created_at >= thirty_days_ago:
                recent_projects += 1
        
        # Calculate account age
        account_age_days = (datetime.now(timezone.utc) - current_user.created_at).days
        
        return {
            "total_projects": len(user_projects),
            "projects_by_status": status_counts,
            "recent_projects_30_days": recent_projects,
            "account_age_days": account_age_days,
            "member_since": current_user.created_at.isoformat(),
            "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
            "email_verified": getattr(current_user, 'is_email_verified', True)
        }
    
    except Exception as e:
        print(f"Error getting user stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user statistics"
        )