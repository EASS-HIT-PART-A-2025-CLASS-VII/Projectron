# tests/test_diagrams.py
import pytest
from fastapi.testclient import TestClient
from mongoengine import connect, disconnect
from datetime import datetime, timezone
from unittest.mock import patch, MagicMock
import json

# Import your main app and models
from app.main import app
from app.db.models.auth import User
from app.db.models.project import Project
from app.core.config import get_settings
from app.api.endpoints import diagrams  # Import the diagrams module for endpoint-level mocking

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
def sample_project_with_architecture(verified_user):
    """Create a sample project with technical architecture for diagram generation"""
    project = Project(
        name="Test Project",
        description="A test project for diagram generation",
        tech_stack=["Python", "FastAPI", "React", "MongoDB"],
        experience_level="mid",
        team_size=3,
        status="draft",
        owner_id=verified_user,
        technical_architecture={
            "system_components": [
                {
                    "name": "User Service",
                    "type": "backend",
                    "description": "Handles user authentication and management",
                    "technologies": ["FastAPI", "MongoDB"],
                    "responsibilities": ["User registration", "Authentication"]
                },
                {
                    "name": "Task Service", 
                    "type": "backend",
                    "description": "Manages task operations",
                    "technologies": ["FastAPI", "MongoDB"],
                    "responsibilities": ["Task CRUD", "Task assignment"]
                },
                {
                    "name": "Frontend",
                    "type": "frontend", 
                    "description": "User interface",
                    "technologies": ["React", "TypeScript"],
                    "responsibilities": ["User interaction", "Data display"]
                }
            ]
        },
        data_models={
            "entities": [
                {
                    "name": "User",
                    "description": "User entity",
                    "properties": [
                        {"name": "id", "type": "ObjectId", "description": "Unique identifier", "required": True},
                        {"name": "email", "type": "String", "description": "User email", "required": True},
                        {"name": "name", "type": "String", "description": "User name", "required": True}
                    ]
                },
                {
                    "name": "Task",
                    "description": "Task entity", 
                    "properties": [
                        {"name": "id", "type": "ObjectId", "description": "Unique identifier", "required": True},
                        {"name": "title", "type": "String", "description": "Task title", "required": True},
                        {"name": "completed", "type": "Boolean", "description": "Task status", "required": False}
                    ]
                }
            ],
            "relationships": [
                {
                    "source_entity": "User",
                    "target_entity": "Task", 
                    "type": "association",  # Fix: use valid type instead of "one-to-many"
                    "description": "User can have multiple tasks"
                }
            ]
        }
    )
    project.save()
    return project

@pytest.fixture
def mock_svg_content():
    """Sample SVG content for mocking diagram generation"""
    return '''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="100" height="50" fill="lightblue" stroke="black"/>
  <text x="60" y="40" text-anchor="middle">Test Diagram</text>
  <rect x="150" y="10" width="100" height="50" fill="lightgreen" stroke="black"/>
  <text x="200" y="40" text-anchor="middle">Component</text>
  <line x1="110" y1="35" x2="150" y2="35" stroke="black" marker-end="url(#arrowhead)"/>
</svg>'''

class TestSequenceDiagrams:
    """Test class for sequence diagram endpoints"""
    
    def test_create_sequence_diagram_success(self, auth_headers, sample_project_with_architecture, mock_svg_content):
        """Test successful sequence diagram creation"""
        project_id = str(sample_project_with_architecture.id)
        
        # Mock the sequence diagram generation service
        mock_result = {
            "success": True,
            "svg": mock_svg_content,
            "diagram_source": "participant User\nparticipant System\nUser->System: login"
        }
        
        # Mock at the endpoint level where the function is imported and used
        with patch('app.api.endpoints.diagrams.generate_sequence_diagram', return_value=mock_result) as mock_generator:
            response = client.post(
                "/api/endpoints/diagrams/sequence/create",
                headers=auth_headers,
                json={"project_id": project_id}
            )
            
            print(f"Create sequence response status: {response.status_code}")
            print(f"Create sequence response content type: {response.headers.get('content-type')}")
            print(f"Create sequence response length: {len(response.content)}")
            
            assert response.status_code == 200
            # Fix: Accept either content type format
            content_type = response.headers.get("content-type", "")
            assert "image/svg+xml" in content_type
            assert b"<svg" in response.content
            assert b"Test Diagram" in response.content
            
            # Verify the AI service was called
            mock_generator.assert_called_once()
            
            # Verify project was updated with diagram data
            updated_project = Project.objects.get(id=project_id)
            assert updated_project.sequence_diagram_svg == mock_svg_content
            assert updated_project.sequence_diagram_source_code == "participant User\nparticipant System\nUser->System: login"
    
    def test_create_sequence_diagram_ai_failure(self, auth_headers, sample_project_with_architecture):
        """Test sequence diagram creation when AI service fails"""
        project_id = str(sample_project_with_architecture.id)
        
        # Mock AI service failure
        mock_result = {
            "success": False,
            "error": "AI service timeout"
        }
        
        with patch('app.api.endpoints.diagrams.generate_sequence_diagram', return_value=mock_result):
            response = client.post(
                "/api/endpoints/diagrams/sequence/create",
                headers=auth_headers,
                json={"project_id": project_id}
            )
            
            print(f"Failed sequence response status: {response.status_code}")
            print(f"Failed sequence response body: {response.text}")
            
            assert response.status_code == 504
    
    def test_update_sequence_diagram_success(self, auth_headers, sample_project_with_architecture, mock_svg_content):
        """Test successful sequence diagram update"""
        project_id = str(sample_project_with_architecture.id)
        
        # First, set some existing diagram data
        project = sample_project_with_architecture
        project.sequence_diagram_source_code = "old diagram source"
        project.sequence_diagram_svg = "old svg content"
        project.save()
        
        # Mock the update result
        mock_result = {
            "success": True,
            "svg": mock_svg_content,
            "diagram_source": "participant User\nparticipant NewSystem\nUser->NewSystem: updated_action"
        }
        
        # Mock at the endpoint level
        with patch('app.api.endpoints.diagrams.generate_sequence_diagram', return_value=mock_result):
            response = client.put(
                "/api/endpoints/diagrams/sequence/update",
                headers=auth_headers,
                json={
                    "project_id": project_id,
                    "change_request": "Add new system component"
                }
            )
            
            print(f"Update sequence response status: {response.status_code}")
            print(f"Update sequence response content type: {response.headers.get('content-type')}")
            
            assert response.status_code == 200
            # Fix: Accept either content type format
            content_type = response.headers.get("content-type", "")
            assert "image/svg+xml" in content_type
            
            # Verify project was updated with new diagram data
            updated_project = Project.objects.get(id=project_id)
            assert updated_project.sequence_diagram_svg == mock_svg_content
            assert "updated_action" in updated_project.sequence_diagram_source_code
    
    def test_sequence_diagram_project_not_found(self, auth_headers):
        """Test sequence diagram creation with non-existent project"""
        from bson import ObjectId
        fake_project_id = str(ObjectId())
        
        response = client.post(
            "/api/endpoints/diagrams/sequence/create",
            headers=auth_headers,
            json={"project_id": fake_project_id}
        )
        
        print(f"Not found sequence response status: {response.status_code}")
        print(f"Not found sequence response body: {response.text}")
        
        assert response.status_code == 404
        assert "Project not found" in response.json()["detail"]
    
    def test_sequence_diagram_requires_auth(self, sample_project_with_architecture):
        """Test that sequence diagram creation requires authentication"""
        project_id = str(sample_project_with_architecture.id)
        
        response = client.post(
            "/api/endpoints/diagrams/sequence/create",
            json={"project_id": project_id}
        )
        
        print(f"Unauth sequence response status: {response.status_code}")
        print(f"Unauth sequence response body: {response.text}")
        
        assert response.status_code == 401

class TestClassDiagrams:
    """Test class for class diagram endpoints"""
    
    def test_create_class_diagram_success(self, auth_headers, sample_project_with_architecture, mock_svg_content):
        """Test successful class diagram creation"""
        project_id = str(sample_project_with_architecture.id)
        
        # Mock class diagram generation - fix relationship type
        mock_diagram_json = {
            "classes": [
                {
                    "name": "User",
                    "attributes": [
                        {"visibility": "+", "name": "id", "type": "ObjectId"},
                        {"visibility": "+", "name": "email", "type": "String"}
                    ],
                    "methods": [
                        {"visibility": "+", "name": "login", "parameters": [], "return_type": "Boolean"}
                    ]
                }
            ],
            "relationships": [
                {"source": "User", "target": "Task", "type": "association"}  # Fix: use valid type
            ]
        }
        
        # Fix: Mock at the endpoint import level, not the service level
        with patch('app.api.endpoints.diagrams.generate_or_update_diagram', return_value=mock_diagram_json) as mock_generator:
            with patch('app.api.endpoints.diagrams.generate_svg_from_json', return_value=mock_svg_content) as mock_svg:
                response = client.post(
                    "/api/endpoints/diagrams/class/create",
                    headers=auth_headers,
                    json={"project_id": project_id}
                )
                
                print(f"Create class response status: {response.status_code}")
                print(f"Create class response content type: {response.headers.get('content-type')}")
                
                assert response.status_code == 200
                # Fix: Accept either content type format
                content_type = response.headers.get("content-type", "")
                assert "image/svg+xml" in content_type
                assert b"<svg" in response.content
                
                # Verify AI services were called
                mock_generator.assert_called_once()
                mock_svg.assert_called_once_with(mock_diagram_json, "class")
                
                # Verify project was updated
                updated_project = Project.objects.get(id=project_id)
                assert updated_project.class_diagram_json == mock_diagram_json
                assert updated_project.class_diagram_svg == mock_svg_content
    
    def test_update_class_diagram_with_change_request(self, auth_headers, sample_project_with_architecture, mock_svg_content):
        """Test class diagram update with change request"""
        project_id = str(sample_project_with_architecture.id)
        
        # Set existing diagram data
        existing_diagram = {"classes": [], "relationships": []}
        project = sample_project_with_architecture
        project.class_diagram_json = existing_diagram
        project.save()
        
        # Mock updated diagram
        updated_diagram = {
            "classes": [
                {"name": "UpdatedUser", "attributes": [], "methods": []}
            ],
            "relationships": []
        }
        
        # Fix: Mock at the endpoint import level
        with patch('app.api.endpoints.diagrams.generate_or_update_diagram', return_value=updated_diagram) as mock_generator:
            with patch('app.api.endpoints.diagrams.generate_svg_from_json', return_value=mock_svg_content):
                response = client.put(
                    "/api/endpoints/diagrams/class/update",
                    headers=auth_headers,
                    json={
                        "project_id": project_id,
                        "change_request": "Rename User class to UpdatedUser"
                    }
                )
                
                print(f"Update class response status: {response.status_code}")
                
                assert response.status_code == 200
                
                # Verify the change request was passed to the AI service - fix call args check
                mock_generator.assert_called_once()
                # Check if call_args exists before accessing it
                if mock_generator.call_args:
                    call_args = mock_generator.call_args[1]  # kwargs
                    assert call_args["change_request"] == "Rename User class to UpdatedUser"
                    assert call_args["existing_json"] is not None

class TestActivityDiagrams:
    """Test class for activity diagram endpoints"""
    
    def test_create_activity_diagram_success(self, auth_headers, sample_project_with_architecture, mock_svg_content):
        """Test successful activity diagram creation"""
        project_id = str(sample_project_with_architecture.id)
        
        # Mock activity diagram generation
        mock_diagram_json = {
            "nodes": [
                {"id": "start", "type": "start", "label": "Start"},
                {"id": "login", "type": "activity", "label": "User Login"},
                {"id": "end", "type": "end", "label": "End"}
            ],
            "flows": [
                {"source": "start", "target": "login"},
                {"source": "login", "target": "end"}
            ]
        }
        
        # Fix: Mock at the endpoint import level
        with patch('app.api.endpoints.diagrams.generate_or_update_diagram', return_value=mock_diagram_json) as mock_generator:
            with patch('app.api.endpoints.diagrams.generate_svg_from_json', return_value=mock_svg_content) as mock_svg:
                response = client.post(
                    "/api/endpoints/diagrams/activity/create",
                    headers=auth_headers,
                    json={"project_id": project_id}
                )
                
                print(f"Create activity response status: {response.status_code}")
                print(f"Create activity response content type: {response.headers.get('content-type')}")
                
                assert response.status_code == 200
                # Fix: Accept either content type format
                content_type = response.headers.get("content-type", "")
                assert "image/svg+xml" in content_type
                
                # Verify AI services were called with correct diagram type
                mock_generator.assert_called_once()
                call_args = mock_generator.call_args[1]
                assert call_args["diagram_type"] == "activity"
                
                mock_svg.assert_called_once_with(mock_diagram_json, "activity")
                
                # Verify project was updated
                updated_project = Project.objects.get(id=project_id)
                assert updated_project.activity_diagram_json == mock_diagram_json
                assert updated_project.activity_diagram_svg == mock_svg_content

class TestDiagramErrors:
    """Test class for diagram error scenarios"""
    
    def test_diagram_generation_service_exception(self, auth_headers, sample_project_with_architecture):
        """Test handling of diagram generation service exceptions"""
        project_id = str(sample_project_with_architecture.id)
        
        # Mock service exception at the endpoint level - this should cause a 500 error
        with patch('app.api.endpoints.diagrams.generate_or_update_diagram', side_effect=Exception("AI service error")):
            response = client.post(
                "/api/endpoints/diagrams/class/create",
                headers=auth_headers,
                json={"project_id": project_id}
            )
            
            print(f"Service error response status: {response.status_code}")
            print(f"Service error response body: {response.text}")
            
            # The endpoint should handle the exception and return 500
            assert response.status_code == 500
            assert "Failed to create diagram" in response.json()["detail"]
    
    def test_svg_generation_failure(self, auth_headers, sample_project_with_architecture):
        """Test handling of SVG generation failures"""
        project_id = str(sample_project_with_architecture.id)
        
        mock_diagram_json = {"classes": [], "relationships": []}
        
        # Fix: Mock at the endpoint level where functions are imported
        with patch('app.api.endpoints.diagrams.generate_or_update_diagram', return_value=mock_diagram_json):
            with patch('app.api.endpoints.diagrams.generate_svg_from_json', side_effect=Exception("SVG generation failed")):
                response = client.post(
                    "/api/endpoints/diagrams/class/create",
                    headers=auth_headers,
                    json={"project_id": project_id}
                )
                
                print(f"SVG error response status: {response.status_code}")
                print(f"SVG error response body: {response.text}")
                
                assert response.status_code == 500
                assert "Failed to create diagram" in response.json()["detail"]

class TestDiagramIntegration:
    """Integration tests for diagram workflows"""
    
    def test_multiple_diagram_types_for_same_project(self, auth_headers, sample_project_with_architecture, mock_svg_content):
        """Test creating multiple diagram types for the same project"""
        project_id = str(sample_project_with_architecture.id)
        
        # Mock all diagram services
        mock_sequence_result = {"success": True, "svg": mock_svg_content, "diagram_source": "sequence code"}
        mock_class_json = {"classes": [], "relationships": []}
        mock_activity_json = {"nodes": [], "flows": []}
        
        # Fix: Mock sequence diagram at the correct path and class/activity at endpoint level
        with patch('app.api.endpoints.diagrams.generate_sequence_diagram', return_value=mock_sequence_result):
            with patch('app.api.endpoints.diagrams.generate_or_update_diagram', return_value=mock_class_json):
                with patch('app.api.endpoints.diagrams.generate_svg_from_json', return_value=mock_svg_content):
                    
                    # Create sequence diagram
                    seq_response = client.post(
                        "/api/endpoints/diagrams/sequence/create",
                        headers=auth_headers,
                        json={"project_id": project_id}
                    )
                    
                    # Create class diagram
                    class_response = client.post(
                        "/api/endpoints/diagrams/class/create",
                        headers=auth_headers,
                        json={"project_id": project_id}
                    )
                    
                    # Create activity diagram  
                    with patch('app.api.endpoints.diagrams.generate_or_update_diagram', return_value=mock_activity_json):
                        activity_response = client.post(
                            "/api/endpoints/diagrams/activity/create",
                            headers=auth_headers,
                            json={"project_id": project_id}
                        )
                    
                    # All should succeed
                    assert seq_response.status_code == 200
                    assert class_response.status_code == 200
                    assert activity_response.status_code == 200
                    
                    # Verify project has all diagram types
                    updated_project = Project.objects.get(id=project_id)
                    assert updated_project.sequence_diagram_svg is not None
                    assert updated_project.class_diagram_json is not None
                    assert updated_project.activity_diagram_json is not None
                    
                    print("✅ Multiple diagram types created successfully!")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])