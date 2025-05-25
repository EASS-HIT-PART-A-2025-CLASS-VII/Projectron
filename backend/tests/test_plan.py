# tests/test_plan.py
import pytest
from fastapi.testclient import TestClient
from mongoengine import connect, disconnect
from datetime import datetime, timezone
import json
import time
from unittest.mock import patch, MagicMock

# Import your main app and models
from app.main import app
from app.db.models.auth import User
from app.db.models.project import Project
from app.db.models.plan_progress import PlanProgress
from app.core.config import get_settings
from app.api.endpoints import plan  # Import the plan module for patching

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
    PlanProgress.drop_collection()
    yield
    # Clean up after test
    User.drop_collection()
    Project.drop_collection()
    PlanProgress.drop_collection()

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
def sample_plan_input():
    """Sample plan generation input data"""
    return {
        "name": "Test Project",
        "description": "A sample web application for managing tasks",
        "tech_stack": ["Python", "FastAPI", "React", "MongoDB"],
        "experience_level": "mid",  # Should be: junior, mid, or senior
        "team_size": 3,
        "total_hours": 100
    }

class TestClarificationQuestions:
    """Test class for clarification question generation"""
    
    def test_generate_clarification_questions_success(self, auth_headers, sample_plan_input):
        """Test successful generation of clarification questions"""
        
        # Mock the AI service to avoid actual API calls
        mock_questions = {
            "questions": [
                "Will users need to log in to the application?",
                "What are the main data entities this application needs to store?",
                "Do you need real-time features like notifications?",
                "Will this be a mobile app, web app, or both?"
            ]
        }
        
        # Mock where the function is IMPORTED, not where it's defined
        with patch('app.api.endpoints.plan.generate_clarifying_questions', return_value=mock_questions) as mock_ai:
            
            response = client.post(
                "/api/endpoints/plan/clarify",
                headers=auth_headers,
                json=sample_plan_input
            )
            
            print(f"Clarify response status: {response.status_code}")
            print(f"Clarify response body: {response.text}")
            
            assert response.status_code == 200
            
            response_data = response.json()
            assert "questions" in response_data
            assert isinstance(response_data["questions"], list)
            assert len(response_data["questions"]) > 0
            
            # Verify the AI service was called
            mock_ai.assert_called_once()
    
    def test_generate_clarification_questions_with_minimal_input(self, auth_headers):
        """Test clarification questions with minimal but valid input"""
        minimal_input = {
            "name": "Test",
            "description": "Test description",
            "tech_stack": ["Python"],
            "experience_level": "junior",
            "team_size": 1,
            "total_hours": 10
        }
        
        # Mock the AI service
        mock_questions = {"questions": ["Test question?"]}
        
        with patch('app.api.endpoints.plan.generate_clarifying_questions', return_value=mock_questions) as mock_ai:
            response = client.post(
                "/api/endpoints/plan/clarify",
                headers=auth_headers,
                json=minimal_input
            )
            
            print(f"Minimal input response status: {response.status_code}")
            print(f"Minimal input response body: {response.text}")
            
            assert response.status_code == 200
            assert "questions" in response.json()
            mock_ai.assert_called_once()
    
    def test_generate_clarification_questions_without_mock(self, auth_headers, sample_plan_input):
        """Test that the real AI service works (no mock) - integration test"""
        response = client.post(
            "/api/endpoints/plan/clarify",
            headers=auth_headers,
            json=sample_plan_input
        )
        
        print(f"Real AI response status: {response.status_code}")
        print(f"Real AI response body: {response.text}")
        
        assert response.status_code == 200
        
        response_data = response.json()
        assert "questions" in response_data
        assert isinstance(response_data["questions"], list)
        assert len(response_data["questions"]) > 0
        
        # Verify we got actual questions (not empty)
        for question in response_data["questions"]:
            assert len(question.strip()) > 10  # Questions should be substantial
    
    def test_generate_clarification_questions_requires_auth(self, sample_plan_input):
        """Test that clarification questions endpoint requires authentication"""
        response = client.post(
            "/api/endpoints/plan/clarify",
            json=sample_plan_input
        )
        
        print(f"Unauth clarify response status: {response.status_code}")
        print(f"Unauth clarify response body: {response.text}")
        
        assert response.status_code == 401

class TestPlanGeneration:
    """Test class for plan generation endpoints"""
    
    def test_generate_plan_starts_background_task(self, auth_headers, sample_plan_input):
        """Test that plan generation starts a background task"""
        
        # Mock the background task to avoid actual AI processing
        with patch('app.api.endpoints.plan.generate_plan_background') as mock_bg_task:
            
            # Wrap the input data correctly
            request_data = {
                "input_data": sample_plan_input,
                "clarification_qa": {
                    "question1": "Yes, with email and password",
                    "question2": "Tasks, users, and projects"
                }
            }
            
            response = client.post(
                "/api/endpoints/plan/generate-plan",
                headers=auth_headers,
                json=request_data
            )
            
            print(f"Generate plan response status: {response.status_code}")
            print(f"Generate plan response body: {response.text}")
            
            assert response.status_code == 200
            
            response_data = response.json()
            assert "task_id" in response_data
            assert "status" in response_data
            assert response_data["status"] == "started"
            
            # Verify task ID is a valid UUID format
            task_id = response_data["task_id"]
            assert len(task_id) == 36  # UUID length
            assert task_id.count("-") == 4  # UUID dashes
    
    def test_generate_plan_creates_progress_tracker(self, auth_headers, sample_plan_input, verified_user):
        """Test that plan generation creates a progress tracker"""
        with patch('app.api.endpoints.plan.generate_plan_background'):
            
            # Wrap the input data correctly
            request_data = {
                "input_data": sample_plan_input,
                "clarification_qa": {}
            }
            
            response = client.post(
                "/api/endpoints/plan/generate-plan",
                headers=auth_headers,
                json=request_data
            )
            
            print(f"Progress tracker response status: {response.status_code}")
            print(f"Progress tracker response body: {response.text}")
            
            assert response.status_code == 200
            task_id = response.json()["task_id"]
            
            # Check that progress tracker was created
            progress = PlanProgress.objects(task_id=task_id).first()
            assert progress is not None
            assert progress.user_id == str(verified_user.id)
            assert progress.status == "pending"
            assert progress.total_steps == 7
    
    def test_generate_plan_requires_auth(self, sample_plan_input):
        """Test that plan generation requires authentication"""
        
        # Wrap the input data correctly
        request_data = {
            "input_data": sample_plan_input,
            "clarification_qa": {}
        }
        
        response = client.post(
            "/api/endpoints/plan/generate-plan",
            json=request_data
        )
        
        print(f"Unauth generate plan response status: {response.status_code}")
        print(f"Unauth generate plan response body: {response.text}")
        
        assert response.status_code == 401

class TestPlanStatus:
    """Test class for plan generation status tracking"""
    
    def test_get_plan_status_success(self, auth_headers, verified_user):
        """Test getting plan generation status"""
        # Create a progress tracker manually
        progress = PlanProgress(
            task_id="test-task-123",
            user_id=str(verified_user.id),
            status="processing",
            current_step="Generating high-level plan",
            step_number=2,
            total_steps=7
        )
        progress.save()
        
        response = client.get(
            "/api/endpoints/plan/status/test-task-123",
            headers=auth_headers
        )
        
        print(f"Status response status: {response.status_code}")
        print(f"Status response body: {response.text}")
        
        assert response.status_code == 200
        
        response_data = response.json()
        assert response_data["task_id"] == "test-task-123"
        assert response_data["status"] == "processing"
        assert response_data["current_step"] == "Generating high-level plan"
        assert response_data["step_number"] == 2
        assert response_data["total_steps"] == 7
    
    def test_get_plan_status_completed_with_result(self, auth_headers, verified_user):
        """Test getting status for completed plan generation"""
        # Create a completed progress tracker with result
        sample_result = {
            "name": "Test Project",
            "high_level_plan": {"vision": "Test vision"},
            "implementation_plan": {"milestones": []}
        }
        
        progress = PlanProgress(
            task_id="completed-task-456",
            user_id=str(verified_user.id),
            status="completed",
            current_step="completed",
            step_number=7,
            total_steps=7,
            result=sample_result,
            project_id="64a1b2c3d4e5f6789012345"
        )
        progress.save()
        
        response = client.get(
            "/api/endpoints/plan/status/completed-task-456",
            headers=auth_headers
        )
        
        print(f"Completed status response status: {response.status_code}")
        print(f"Completed status response body: {response.text}")
        
        assert response.status_code == 200
        
        response_data = response.json()
        assert response_data["status"] == "completed"
        assert response_data["result"] is not None
        assert response_data["project_id"] == "64a1b2c3d4e5f6789012345"
        assert "high_level_plan" in response_data["result"]
    
    def test_get_plan_status_failed(self, auth_headers, verified_user):
        """Test getting status for failed plan generation"""
        progress = PlanProgress(
            task_id="failed-task-789",
            user_id=str(verified_user.id),
            status="failed",
            current_step="failed",
            step_number=3,
            total_steps=7,
            error_message="AI service timeout"
        )
        progress.save()
        
        response = client.get(
            "/api/endpoints/plan/status/failed-task-789",
            headers=auth_headers
        )
        
        print(f"Failed status response status: {response.status_code}")
        print(f"Failed status response body: {response.text}")
        
        assert response.status_code == 200
        
        response_data = response.json()
        assert response_data["status"] == "failed"
        assert response_data["error_message"] == "AI service timeout"
    
    def test_get_plan_status_not_found(self, auth_headers):
        """Test getting status for non-existent task"""
        response = client.get(
            "/api/endpoints/plan/status/nonexistent-task",
            headers=auth_headers
        )
        
        print(f"Not found status response status: {response.status_code}")
        print(f"Not found status response body: {response.text}")
        
        assert response.status_code == 404
        
        response_data = response.json()
        assert "not found" in response_data["detail"].lower()
    
    def test_get_plan_status_wrong_user(self, auth_headers):
        """Test that users can't access other users' plan status"""
        # Create another user and their progress
        other_user = User.create_user(
            email="other@example.com",
            password="password123",
            full_name="Other User"
        )
        other_user.is_email_verified = True
        other_user.save()
        
        progress = PlanProgress(
            task_id="other-user-task",
            user_id=str(other_user.id),  # Different user
            status="processing",
            current_step="test",
            step_number=1,
            total_steps=7
        )
        progress.save()
        
        # Try to access with our authenticated user
        response = client.get(
            "/api/endpoints/plan/status/other-user-task",
            headers=auth_headers
        )
        
        print(f"Wrong user status response status: {response.status_code}")
        print(f"Wrong user status response body: {response.text}")
        
        assert response.status_code == 404  # Should not find it
    
    def test_get_plan_status_requires_auth(self):
        """Test that getting plan status requires authentication"""
        response = client.get("/api/endpoints/plan/status/any-task")
        
        print(f"Unauth status response status: {response.status_code}")
        print(f"Unauth status response body: {response.text}")
        
        assert response.status_code == 401

class TestPlanGenerationIntegration:
    """Integration tests for the complete plan generation workflow"""
    
    def test_full_plan_generation_workflow_simulation(self, auth_headers, sample_plan_input, verified_user):
        """Test the complete workflow: clarify -> generate -> check status"""
        
        # Step 1: Generate clarification questions
        mock_questions = {
            "questions": [
                "Will users need authentication?",
                "What data should be stored?",
                "Any third-party integrations needed?"
            ]
        }
        
        # Use correct mock path for clarify endpoint
        with patch('app.api.endpoints.plan.generate_clarifying_questions', return_value=mock_questions) as mock_clarify:
            
            clarify_response = client.post(
                "/api/endpoints/plan/clarify",
                headers=auth_headers,
                json=sample_plan_input
            )
            
            print(f"Workflow clarify status: {clarify_response.status_code}")
            print(f"Workflow clarify body: {clarify_response.text}")
            
            assert clarify_response.status_code == 200
            questions = clarify_response.json()["questions"]
            mock_clarify.assert_called_once()
            
        # Step 2: Start plan generation
        with patch('app.api.endpoints.plan.generate_plan_background'):
            
            # Wrap the input data correctly
            request_data = {
                "input_data": sample_plan_input,
                "clarification_qa": {
                    questions[0]: "Yes, email/password login",
                    questions[1]: "Users, tasks, projects",
                    questions[2]: "No external integrations needed"
                }
            }
            
            generate_response = client.post(
                "/api/endpoints/plan/generate-plan",
                headers=auth_headers,
                json=request_data
            )
            
            print(f"Workflow generate status: {generate_response.status_code}")
            print(f"Workflow generate body: {generate_response.text}")
            
            assert generate_response.status_code == 200
            task_id = generate_response.json()["task_id"]
        
        # Step 3: Check status immediately (should be pending/processing)
        status_response = client.get(
            f"/api/endpoints/plan/status/{task_id}",
            headers=auth_headers
        )
        
        print(f"Workflow status check: {status_response.status_code}")
        print(f"Workflow status body: {status_response.text}")
        
        assert status_response.status_code == 200
        status_data = status_response.json()
        assert status_data["task_id"] == task_id
        assert status_data["status"] in ["pending", "processing"]
        
        print("✅ Full workflow simulation completed successfully!")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])