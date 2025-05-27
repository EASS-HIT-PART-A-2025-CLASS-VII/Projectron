# tests/test_projects.py
import pytest
from fastapi.testclient import TestClient
from mongoengine import connect, disconnect
from datetime import datetime, timezone
from bson import ObjectId

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
def sample_project(verified_user):
    """Create a sample project for testing"""
    project = Project(
        name="Test Project",
        description="A test project for testing",
        tech_stack=["Python", "FastAPI", "MongoDB"],
        experience_level="mid",
        team_size=3,
        status="draft",
        owner_id=verified_user,
        high_level_plan={
            "name": "Test Project",
            "vision": "Test vision",
            "business_objectives": ["Test objective 1", "Test objective 2"]
        },
        implementation_plan={
            "milestones": [
                {
                    "name": "Setup",
                    "status": "not_started",
                    "tasks": [
                        {
                            "name": "Initialize project",
                            "status": "not_started",
                            "estimated_hours": 4,
                            "subtasks": [
                                {"name": "Create repo", "status": "not_started"}
                            ]
                        }
                    ]
                }
            ]
        }
    )
    project.save()
    return project

class TestProjectsEndpoints:
    """Test class for project management endpoints"""
    
    def test_list_projects_empty_for_new_user(self, auth_headers):
        """Test that new user has empty project list"""
        response = client.get(
            "/api/endpoints/projects/",
            headers=auth_headers
        )
        
        print(f"List projects response status: {response.status_code}")
        print(f"List projects response body: {response.text}")
        
        assert response.status_code == 200
        
        projects = response.json()
        assert isinstance(projects, list)
        assert len(projects) == 0
    
    def test_list_projects_returns_user_projects(self, auth_headers, sample_project):
        """Test that user can see their own projects"""
        response = client.get(
            "/api/endpoints/projects/",
            headers=auth_headers
        )
        
        print(f"List projects with data response status: {response.status_code}")
        print(f"List projects with data response body: {response.text}")
        
        assert response.status_code == 200
        
        projects = response.json()
        assert isinstance(projects, list)
        assert len(projects) == 1
        
        project = projects[0]
        assert project["name"] == "Test Project"
        assert project["description"] == "A test project for testing"
        assert project["status"] == "draft"
        assert "id" in project
        assert "created_at" in project
        assert "milestone_count" in project
        assert "task_count" in project
        assert "completion_percentage" in project
    
    def test_list_projects_requires_authentication(self):
        """Test that listing projects requires authentication"""
        response = client.get("/api/endpoints/projects/")
        
        print(f"Unauthenticated list response status: {response.status_code}")
        print(f"Unauthenticated list response body: {response.text}")
        
        assert response.status_code == 401

class TestGetSpecificProject:
    """Tests for getting specific project details"""
    
    def test_get_project_success(self, auth_headers, sample_project):
        """Test getting a specific project that user owns"""
        project_id = str(sample_project.id)
        
        response = client.get(
            f"/api/endpoints/projects/{project_id}",
            headers=auth_headers
        )
        
        print(f"Get project response status: {response.status_code}")
        print(f"Get project response body: {response.text}")
        
        assert response.status_code == 200
        
        project_data = response.json()
        assert project_data["name"] == "Test Project"
        assert project_data["description"] == "A test project for testing"
        assert project_data["tech_stack"] == ["Python", "FastAPI", "MongoDB"]
        assert project_data["experience_level"] == "mid"
        assert project_data["team_size"] == 3
        assert project_data["status"] == "draft"
        
        # Check that nested data is included
        assert "high_level_plan" in project_data
        assert "implementation_plan" in project_data
        assert "milestones" in project_data["implementation_plan"]
    
    def test_get_project_not_found(self, auth_headers):
        """Test getting a project that doesn't exist"""
        fake_project_id = str(ObjectId())  # Generate a valid ObjectId that doesn't exist
        
        response = client.get(
            f"/api/endpoints/projects/{fake_project_id}",
            headers=auth_headers
        )
        
        print(f"Get non-existent project response status: {response.status_code}")
        print(f"Get non-existent project response body: {response.text}")
        
        assert response.status_code == 404
    
    def test_get_project_invalid_id_format(self, auth_headers):
        """Test getting a project with invalid ID format"""
        invalid_id = "invalid-project-id"
        
        response = client.get(
            f"/api/endpoints/projects/{invalid_id}",
            headers=auth_headers
        )
        
        print(f"Get project invalid ID response status: {response.status_code}")
        print(f"Get project invalid ID response body: {response.text}")
        
        assert response.status_code == 400
    
    def test_get_project_requires_authentication(self, sample_project):
        """Test that getting project details requires authentication"""
        project_id = str(sample_project.id)
        
        response = client.get(f"/api/endpoints/projects/{project_id}")
        
        print(f"Unauthenticated get project response status: {response.status_code}")
        print(f"Unauthenticated get project response body: {response.text}")
        
        assert response.status_code == 401

class TestUpdateProject:
    """Tests for updating projects"""
    
    def test_update_project_success(self, auth_headers, sample_project):
        """Test successfully updating a project"""
        project_id = str(sample_project.id)
        
        update_data = {
            "name": "Updated Test Project",
            "description": "An updated test project",
            "status": "active",
            "tech_stack": ["Python", "FastAPI", "MongoDB", "React"]
        }
        
        response = client.put(
            f"/api/endpoints/projects/{project_id}",
            headers=auth_headers,
            json=update_data
        )
        
        print(f"Update project response status: {response.status_code}")
        print(f"Update project response body: {response.text}")
        
        assert response.status_code == 200
        
        updated_project = response.json()
        assert updated_project["name"] == "Updated Test Project"
        assert updated_project["description"] == "An updated test project"
        assert updated_project["status"] == "active"
        assert "React" in updated_project["tech_stack"]
    
    def test_update_project_not_found(self, auth_headers):
        """Test updating a project that doesn't exist"""
        fake_project_id = str(ObjectId())
        
        update_data = {
            "name": "Updated Project",
            "description": "Updated description"
        }
        
        response = client.put(
            f"/api/endpoints/projects/{fake_project_id}",
            headers=auth_headers,
            json=update_data
        )
        
        print(f"Update non-existent project response status: {response.status_code}")
        print(f"Update non-existent project response body: {response.text}")
        
        assert response.status_code == 404
    
    def test_update_project_requires_authentication(self, sample_project):
        """Test that updating a project requires authentication"""
        project_id = str(sample_project.id)
        
        update_data = {
            "name": "Updated Project"
        }
        
        response = client.put(
            f"/api/endpoints/projects/{project_id}",
            json=update_data
        )
        
        print(f"Unauthenticated update response status: {response.status_code}")
        print(f"Unauthenticated update response body: {response.text}")
        
        assert response.status_code == 401

class TestDeleteProject:
    """Tests for deleting projects"""
    
    def test_delete_project_success(self, auth_headers, sample_project):
        """Test successfully deleting a project"""
        project_id = str(sample_project.id)
        
        response = client.delete(
            f"/api/endpoints/projects/{project_id}",
            headers=auth_headers
        )
        
        print(f"Delete project response status: {response.status_code}")
        print(f"Delete project response body: {response.text}")
        
        assert response.status_code == 200
        
        response_data = response.json()
        assert "message" in response_data
        assert "deleted successfully" in response_data["message"].lower()
        
        # Verify project is actually deleted
        get_response = client.get(
            f"/api/endpoints/projects/{project_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 404
    
    def test_delete_project_not_found(self, auth_headers):
        """Test deleting a project that doesn't exist"""
        fake_project_id = str(ObjectId())
        
        response = client.delete(
            f"/api/endpoints/projects/{fake_project_id}",
            headers=auth_headers
        )
        
        print(f"Delete non-existent project response status: {response.status_code}")
        print(f"Delete non-existent project response body: {response.text}")
        
        assert response.status_code == 404
    
    def test_delete_project_requires_authentication(self, sample_project):
        """Test that deleting a project requires authentication"""
        project_id = str(sample_project.id)
        
        response = client.delete(f"/api/endpoints/projects/{project_id}")
        
        print(f"Unauthenticated delete response status: {response.status_code}")
        print(f"Unauthenticated delete response body: {response.text}")
        
        assert response.status_code == 401

class TestProjectOwnership:
    """Tests for project ownership and access control"""
    
    def test_user_cannot_access_other_users_project(self, sample_project):
        """Test that users cannot access projects they don't own"""
        # Create a second user
        other_user = User.create_user(
            email="otheruser@example.com",
            password="testpassword123",
            full_name="Other User"
        )
        other_user.is_email_verified = True
        other_user.save()
        
        # Get token for the other user
        login_data = {
            "username": other_user.email,
            "password": "testpassword123"
        }
        
        response = client.post(
            "/api/endpoints/auth/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert response.status_code == 200
        other_user_token = response.json()["access_token"]
        other_user_headers = {"Authorization": f"Bearer {other_user_token}"}
        
        # Try to access the first user's project
        project_id = str(sample_project.id)
        
        response = client.get(
            f"/api/endpoints/projects/{project_id}",
            headers=other_user_headers
        )
        
        print(f"Other user access response status: {response.status_code}")
        print(f"Other user access response body: {response.text}")
        
        # Should return 403 Forbidden or 404 Not Found (depending on your implementation)
        assert response.status_code in [403, 404]
    
    def test_user_only_sees_own_projects_in_list(self, sample_project):
        """Test that users only see their own projects in the list"""
        # Create a second user with their own project
        other_user = User.create_user(
            email="otheruser@example.com",
            password="testpassword123",
            full_name="Other User"
        )
        other_user.is_email_verified = True
        other_user.save()
        
        # Create a project for the other user
        other_project = Project(
            name="Other User's Project",
            description="A project owned by another user",
            owner_id=other_user,
            status="draft"
        )
        other_project.save()
        
        # Get token for the other user
        login_data = {
            "username": other_user.email,
            "password": "testpassword123"
        }
        
        response = client.post(
            "/api/endpoints/auth/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert response.status_code == 200
        other_user_token = response.json()["access_token"]
        other_user_headers = {"Authorization": f"Bearer {other_user_token}"}
        
        # Get projects for the other user
        response = client.get(
            "/api/endpoints/projects/",
            headers=other_user_headers
        )
        
        print(f"Other user projects list response status: {response.status_code}")
        print(f"Other user projects list response body: {response.text}")
        
        assert response.status_code == 200
        
        projects = response.json()
        assert len(projects) == 1  # Should only see their own project
        assert projects[0]["name"] == "Other User's Project"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])