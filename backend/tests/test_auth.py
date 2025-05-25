# tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from mongoengine import connect, disconnect
import os
from datetime import datetime, timezone

# Import your main app
from app.main import app
from app.db.models.auth import User
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
    connect(host=f"mongodb://localhost:27017/{test_db_name}")
    
    yield
    
    # Cleanup: disconnect and optionally drop test database
    disconnect()

@pytest.fixture(autouse=True)
def clean_database():
    """Clean database before each test"""
    # Clear all users before each test
    User.drop_collection()
    yield
    # Clean up after test
    User.drop_collection()

class TestAuthEndpoints:
    """Test class for authentication endpoints"""
    
    def test_health_check(self):
        """Test basic connectivity - simplest test that should always pass"""
        response = client.get("/")
        # This might return 404 if you don't have a root endpoint, which is fine
        assert response.status_code in [200, 404]
    
    def test_register_new_user_success(self):
        """Test user registration with valid data"""
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        
        response = client.post("/api/endpoints/auth/register", json=user_data)
        
        print(f"Register response status: {response.status_code}")
        print(f"Register response body: {response.text}")
        
        assert response.status_code == 201
        
        response_data = response.json()
        assert response_data["email"] == user_data["email"]
        assert response_data["full_name"] == user_data["full_name"]
        assert "id" in response_data
        assert "created_at" in response_data
    
    def test_register_duplicate_email_fails(self):
        """Test that registering with duplicate email fails"""
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        
        # Register first user
        response1 = client.post("/api/endpoints/auth/register", json=user_data)
        assert response1.status_code == 201
        
        # Try to register same email again
        response2 = client.post("/api/endpoints/auth/register", json=user_data)
        
        print(f"Duplicate register response status: {response2.status_code}")
        print(f"Duplicate register response body: {response2.text}")
        
        assert response2.status_code == 400
        
        response_data = response2.json()
        assert "already registered" in response_data["detail"].lower()
    
    def test_register_invalid_email_fails(self):
        """Test registration with invalid email format"""
        user_data = {
            "email": "invalid-email",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        
        response = client.post("/api/endpoints/auth/register", json=user_data)
        
        print(f"Invalid email response status: {response.status_code}")
        print(f"Invalid email response body: {response.text}")
        
        assert response.status_code == 422  # Validation error
    
    def test_login_unverified_user_fails(self):
        """Test that login fails for unverified user"""
        # First register a user
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        
        register_response = client.post("/api/endpoints/auth/register", json=user_data)
        assert register_response.status_code == 201
        
        # Try to login (should fail because email not verified)
        login_data = {
            "username": "test@example.com",  # FastAPI OAuth2 uses 'username' field
            "password": "testpassword123"
        }
        
        response = client.post(
            "/api/endpoints/auth/token",
            data=login_data,  # Form data, not JSON
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Login unverified response status: {response.status_code}")
        print(f"Login unverified response body: {response.text}")
        
        assert response.status_code == 403
        
        response_data = response.json()
        assert "not verified" in response_data["detail"].lower()

@pytest.fixture
def verified_user():
    """Create a verified user for testing"""
    # Create user
    user = User.create_user(
        email="verified@example.com",
        password="testpassword123",
        full_name="Verified User"
    )
    
    # Manually verify the user (skip email verification for testing)
    user.is_email_verified = True
    user.save()
    
    return user

class TestAuthWithVerifiedUser:
    """Tests that require a verified user"""
    
    def test_login_verified_user_success(self, verified_user):
        """Test successful login with verified user"""
        login_data = {
            "username": verified_user.email,
            "password": "testpassword123"
        }
        
        response = client.post(
            "/api/endpoints/auth/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Login success response status: {response.status_code}")
        print(f"Login success response body: {response.text}")
        
        assert response.status_code == 200
        
        response_data = response.json()
        assert "access_token" in response_data
        assert response_data["token_type"] == "bearer"
        assert len(response_data["access_token"]) > 10  # Token should be substantial
    
    def test_login_wrong_password_fails(self, verified_user):
        """Test login with wrong password"""
        login_data = {
            "username": verified_user.email,
            "password": "wrongpassword"
        }
        
        response = client.post(
            "/api/endpoints/auth/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Wrong password response status: {response.status_code}")
        print(f"Wrong password response body: {response.text}")
        
        assert response.status_code == 401
        
        response_data = response.json()
        assert "incorrect" in response_data["detail"].lower()
    
    def test_get_current_user_with_token(self, verified_user):
        """Test getting current user info with valid token"""
        # First login to get token
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
        
        # Now get current user info
        response = client.get(
            "/api/endpoints/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        print(f"Get current user response status: {response.status_code}")
        print(f"Get current user response body: {response.text}")
        
        assert response.status_code == 200
        
        response_data = response.json()
        assert response_data["email"] == verified_user.email
        assert response_data["full_name"] == verified_user.full_name
        assert "id" in response_data
    
    def test_get_current_user_without_token_fails(self):
        """Test getting current user without authentication"""
        response = client.get("/api/endpoints/auth/me")
        
        print(f"No token response status: {response.status_code}")
        print(f"No token response body: {response.text}")
        
        assert response.status_code == 401

if __name__ == "__main__":
    pytest.main([__file__, "-v"])