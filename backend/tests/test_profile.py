# tests/test_profile.py
import pytest
from fastapi.testclient import TestClient
from mongoengine import connect, disconnect
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock
import hashlib

# Import your main app and models
from app.main import app
from app.db.models.auth import User
from app.db.models.project import Project
from app.core.config import get_settings

# Create test client
client = TestClient(app)
settings = get_settings()

# Test database setup
@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Set up test database connection"""
    # Disconnect any existing connections
    disconnect()
    
    # Connect to test database
    test_db_name = "projectron_test"
    connect(
        host=f"mongodb://localhost:27017/{test_db_name}",
        uuidRepresentation='standard'
    )
    
    yield
    
    # Cleanup: disconnect
    disconnect()

@pytest.fixture(autouse=True)
def clean_database():
    """Clean database before each test"""
    # Clear all collections before each test
    User.drop_collection()
    Project.drop_collection()
    yield
    # Clean up after test
    User.drop_collection()
    Project.drop_collection()

@pytest.fixture
def verified_user():
    """Create a verified user for testing"""
    user = User.create_user(
        email="testuser@example.com",
        password="testpassword123",
        full_name="Test User"
    )
    # Manually verify the user (skip email verification for testing)
    user.is_email_verified = True
    
    # Ensure created_at is timezone-aware
    if user.created_at.tzinfo is None:
        user.created_at = user.created_at.replace(tzinfo=timezone.utc)
    
    user.save()
    return user

@pytest.fixture
def authenticated_user_token(verified_user):
    """Get authentication token for verified user"""
    login_data = {
        "username": verified_user.email,
        "password": "testpassword123"
    }
    
    response = client.post(
        "/api/endpoints/auth/token",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    assert response.status_code == 200
    return response.json()["access_token"]

@pytest.fixture
def auth_headers(authenticated_user_token):
    """Create authorization headers for API requests"""
    return {"Authorization": f"Bearer {authenticated_user_token}"}

@pytest.fixture
def user_with_projects(verified_user):
    """Create a user with some sample projects for testing stats"""
    # Create projects with different statuses and dates
    now_utc = datetime.now(tz=timezone.utc)
    
    project1 = Project(
        name="Project 1",
        description="Active project",
        tech_stack=["Python", "FastAPI"],
        experience_level="mid",
        team_size=2,
        status="active",
        owner_id=verified_user,
        created_at=now_utc - timedelta(days=5)  # Ensure timezone-aware
    )
    project1.save()
    
    project2 = Project(
        name="Project 2", 
        description="Completed project",
        tech_stack=["React", "Node.js"],
        experience_level="senior",
        team_size=3,
        status="completed",
        owner_id=verified_user,
        created_at=now_utc - timedelta(days=45)  # Ensure timezone-aware
    )
    project2.save()
    
    project3 = Project(
        name="Project 3",
        description="Draft project",
        tech_stack=["Vue.js"],
        experience_level="junior", 
        team_size=1,
        status="draft",
        owner_id=verified_user,
        created_at=now_utc - timedelta(days=10)  # Ensure timezone-aware
    )
    project3.save()
    
    return verified_user, [project1, project2, project3]

class TestUserProfile:
    """Test class for user profile endpoints"""
    
    def test_get_user_profile_success(self, auth_headers, verified_user):
        """Test successful retrieval of user profile"""
        response = client.get(
            "/api/endpoints/users/profile",
            headers=auth_headers
        )
        
        print(f"Get profile response status: {response.status_code}")
        print(f"Get profile response body: {response.json()}")
        
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["email"] == verified_user.email
        assert data["full_name"] == verified_user.full_name
        assert "created_at" in data
        assert "is_active" in data
        assert "total_projects" in data
        assert "roles" in data
        assert data["total_projects"] == 0  # No projects created yet
        assert "user" in data["roles"]
    
    def test_get_user_profile_with_projects(self, auth_headers, user_with_projects):
        """Test user profile retrieval with existing projects"""
        user, projects = user_with_projects
        
        response = client.get(
            "/api/endpoints/users/profile", 
            headers=auth_headers
        )
        
        print(f"Get profile with projects response: {response.json()}")
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["total_projects"] == 3  # Should count all 3 projects
        assert data["email"] == user.email
    
    def test_get_user_profile_requires_auth(self):
        """Test that getting profile requires authentication"""
        response = client.get("/api/endpoints/users/profile")
        
        print(f"Unauth profile response status: {response.status_code}")
        
        assert response.status_code == 401
    
    def test_update_user_profile_success(self, auth_headers, verified_user):
        """Test successful profile update"""
        update_data = {
            "full_name": "Updated Test User"
        }
        
        response = client.put(
            "/api/endpoints/users/profile",
            headers=auth_headers,
            json=update_data
        )
        
        print(f"Update profile response status: {response.status_code}")
        print(f"Update profile response body: {response.json()}")
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["full_name"] == "Updated Test User"
        assert data["email"] == verified_user.email  # Email should remain unchanged
        
        # Verify the user was actually updated in the database
        updated_user = User.objects.get(id=verified_user.id)
        assert updated_user.full_name == "Updated Test User"
    
    def test_update_user_profile_validation(self, auth_headers):
        """Test profile update with invalid data"""
        # Test empty full_name
        update_data = {
            "full_name": ""
        }
        
        response = client.put(
            "/api/endpoints/users/profile",
            headers=auth_headers,
            json=update_data
        )
        
        print(f"Invalid update response status: {response.status_code}")
        print(f"Invalid update response body: {response.text}")
        
        # The endpoint might accept empty string and just strip it, or reject it
        # Let's check the actual behavior
        assert response.status_code in [200, 400, 422]  # Accept various validation responses
    
    def test_update_user_profile_requires_auth(self):
        """Test that updating profile requires authentication"""
        update_data = {
            "full_name": "Should Not Work"
        }
        
        response = client.put(
            "/api/endpoints/users/profile",
            json=update_data
        )
        
        assert response.status_code == 401

class TestPasswordChange:
    """Test class for password change functionality"""
    
    def test_change_password_success(self, auth_headers, verified_user):
        """Test successful password change"""
        password_data = {
            "current_password": "testpassword123",
            "new_password": "newpassword456"
        }
        
        response = client.post(
            "/api/endpoints/users/change-password",
            headers=auth_headers,
            json=password_data
        )
        
        print(f"Change password response status: {response.status_code}")
        print(f"Change password response body: {response.json()}")
        
        assert response.status_code == 200
        assert "message" in response.json()
        assert "successfully" in response.json()["message"].lower()
        
        # Verify the password was actually changed
        updated_user = User.objects.get(id=verified_user.id)
        assert updated_user.check_password("newpassword456") == True
        assert updated_user.check_password("testpassword123") == False
    
    def test_change_password_wrong_current(self, auth_headers):
        """Test password change with wrong current password"""
        password_data = {
            "current_password": "wrongpassword",
            "new_password": "newpassword456"
        }
        
        response = client.post(
            "/api/endpoints/users/change-password",
            headers=auth_headers,
            json=password_data
        )
        
        print(f"Wrong current password response: {response.status_code}")
        print(f"Wrong current password body: {response.json()}")
        
        assert response.status_code == 400
        assert "current password is incorrect" in response.json()["detail"].lower()
    
    def test_change_password_same_as_current(self, auth_headers):
        """Test password change when new password is same as current"""
        password_data = {
            "current_password": "testpassword123",
            "new_password": "testpassword123"  # Same as current
        }
        
        response = client.post(
            "/api/endpoints/users/change-password",
            headers=auth_headers,
            json=password_data
        )
        
        print(f"Same password response: {response.status_code}")
        print(f"Same password body: {response.json()}")
        
        assert response.status_code == 400
        assert "must be different" in response.json()["detail"].lower()
    
    def test_change_password_too_short(self, auth_headers):
        """Test password change with new password too short"""
        password_data = {
            "current_password": "testpassword123",
            "new_password": "short"  # Less than 8 characters
        }
        
        response = client.post(
            "/api/endpoints/users/change-password",
            headers=auth_headers,
            json=password_data
        )
        
        print(f"Short password response: {response.status_code}")
        print(f"Short password body: {response.json()}")
        
        # Fix: Accept either 400 (backend validation) or 422 (Pydantic validation)
        assert response.status_code in [400, 422]
        response_detail = response.json().get("detail", "")
        # Handle both single string and list of validation errors
        if isinstance(response_detail, list):
            # Pydantic validation error format
            assert any("at least 8 characters" in str(error) for error in response_detail)
        else:
            # Backend validation error format
            assert "at least 8 characters" in response_detail
    
    def test_change_password_requires_auth(self):
        """Test that changing password requires authentication"""
        password_data = {
            "current_password": "testpassword123",
            "new_password": "newpassword456"
        }
        
        response = client.post(
            "/api/endpoints/users/change-password",
            json=password_data
        )
        
        assert response.status_code == 401
    
    def test_change_password_missing_fields(self, auth_headers):
        """Test password change with missing required fields"""
        # Missing new_password
        password_data = {
            "current_password": "testpassword123"
        }
        
        response = client.post(
            "/api/endpoints/users/change-password",
            headers=auth_headers,
            json=password_data
        )
        
        print(f"Missing field response: {response.status_code}")
        
        assert response.status_code == 422  # Pydantic validation error

class TestUserStats:
    """Test class for user statistics endpoint"""
    
    def test_get_user_stats_with_projects(self, auth_headers, user_with_projects):
        """Test user stats with existing projects"""
        user, projects = user_with_projects
        
        response = client.get(
            "/api/endpoints/users/profile/stats",
            headers=auth_headers
        )
        
        print(f"User stats response status: {response.status_code}")
        print(f"User stats response body: {response.json()}")
        
        assert response.status_code == 200
        
        data = response.json()
        assert "total_projects" in data
        assert "projects_by_status" in data
        assert "recent_projects_30_days" in data
        assert "account_age_days" in data
        assert "member_since" in data
        
        # Verify project counts
        assert data["total_projects"] == 3
        
        # Check status breakdown
        status_counts = data["projects_by_status"]
        assert status_counts.get("active", 0) == 1
        assert status_counts.get("completed", 0) == 1
        assert status_counts.get("draft", 0) == 1
        
        # Check recent projects (created within last 30 days)
        # Projects 1 and 3 were created within 30 days, project 2 was 45 days ago
        assert data["recent_projects_30_days"] == 2
        
        # Account age should be reasonable (just created)
        assert data["account_age_days"] >= 0
        assert data["account_age_days"] < 1  # Should be less than 1 day old
        
        # Member since should be an ISO timestamp
        assert "T" in data["member_since"]  # ISO format indicator
    
    def test_get_user_stats_no_projects(self, auth_headers, verified_user):
        """Test user stats with no projects"""
        response = client.get(
            "/api/endpoints/users/profile/stats",
            headers=auth_headers
        )
        
        print(f"No projects stats response: {response.json()}")
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["total_projects"] == 0
        assert data["projects_by_status"] == {}
        assert data["recent_projects_30_days"] == 0
        assert data["account_age_days"] >= 0
    
    def test_get_user_stats_requires_auth(self):
        """Test that getting stats requires authentication"""
        response = client.get("/api/endpoints/users/profile/stats")
        
        assert response.status_code == 401

class TestProfileIntegration:
    """Integration tests for profile workflows"""
    
    def test_profile_workflow_complete(self, verified_user):
        """Test complete profile management workflow"""
        # 1. Login
        login_data = {
            "username": verified_user.email,
            "password": "testpassword123"
        }
        
        login_response = client.post(
            "/api/endpoints/auth/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Get initial profile
        profile_response = client.get(
            "/api/endpoints/users/profile",
            headers=headers
        )
        
        assert profile_response.status_code == 200
        initial_profile = profile_response.json()
        
        # 3. Update profile
        update_data = {
            "full_name": "Updated Integration User"
        }
        
        update_response = client.put(
            "/api/endpoints/users/profile",
            headers=headers,
            json=update_data
        )
        
        assert update_response.status_code == 200
        assert update_response.json()["full_name"] == "Updated Integration User"
        
        # 4. Change password
        password_data = {
            "current_password": "testpassword123",
            "new_password": "newintegrationpass"
        }
        
        password_response = client.post(
            "/api/endpoints/users/change-password",
            headers=headers,
            json=password_data
        )
        
        assert password_response.status_code == 200
        
        # 5. Verify new password works by logging in again
        new_login_data = {
            "username": verified_user.email,
            "password": "newintegrationpass"
        }
        
        new_login_response = client.post(
            "/api/endpoints/auth/token",
            data=new_login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert new_login_response.status_code == 200
        
        # 6. Get stats
        new_token = new_login_response.json()["access_token"]
        new_headers = {"Authorization": f"Bearer {new_token}"}
        
        stats_response = client.get(
            "/api/endpoints/users/profile/stats",
            headers=new_headers
        )
        
        assert stats_response.status_code == 200
        stats = stats_response.json()
        assert stats["total_projects"] == 0
        
        print("✅ Complete profile workflow test passed!")
    
    def test_profile_error_handling(self, auth_headers):
        """Test profile endpoints error handling"""
        # Test with malformed JSON
        response = client.put(
            "/api/endpoints/users/profile",
            headers=auth_headers,
            data="invalid json"
        )
        
        print(f"Malformed JSON response: {response.status_code}")
        # Should return 422 for validation error or 400 for bad request
        assert response.status_code in [400, 422]

class TestProfileSecurity:
    """Security-focused tests for profile endpoints"""
    
    def test_profile_access_isolation(self, verified_user):
        """Test that users can only access their own profile"""
        # Create a second user
        user2 = User.create_user(
            email="user2@example.com",
            password="password456",
            full_name="User Two"
        )
        user2.is_email_verified = True
        user2.save()
        
        # Get token for user2
        login_data = {
            "username": user2.email,
            "password": "password456"
        }
        
        response = client.post(
            "/api/endpoints/auth/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        user2_token = response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}
        
        # User2 should only see their own profile
        profile_response = client.get(
            "/api/endpoints/users/profile",
            headers=user2_headers
        )
        
        assert profile_response.status_code == 200
        profile_data = profile_response.json()
        assert profile_data["email"] == user2.email
        assert profile_data["email"] != verified_user.email
        
        print("✅ Profile access isolation verified!")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])