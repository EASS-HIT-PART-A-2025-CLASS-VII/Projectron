# tests/integration/test_auth_flow.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone, timedelta

from app.main import app
from app.db.models.auth import User
from app.core.config import get_settings

settings = get_settings()

# Test configuration
TEST_USER_EMAIL = "testuser@example.com"
TEST_USER_PASSWORD = "testpassword123"
TEST_USER_FULL_NAME = "Test User"

# tests/integration/test_auth_flow.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone, timedelta
from mongoengine import connect, disconnect
import mongomock

from app.main import app
from app.db.models.auth import User
from app.core.config import get_settings

settings = get_settings()

# Test configuration
TEST_USER_EMAIL = "testuser@example.com"
TEST_USER_PASSWORD = "testpassword123"
TEST_USER_FULL_NAME = "Test User"

@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db():
    """Set up test database connection"""
    # Disconnect any existing connections
    disconnect()
    
    # Connect to test database using mongomock with the new syntax
    connect(
        db='test_db',
        host='localhost',
        mongo_client_class=mongomock.MongoClient
    )
    
    yield
    
    # Clean up after each test
    User.objects.delete()
    disconnect()

@pytest.fixture
def mock_email_service():
    """Mock email service to avoid sending real emails"""
    with patch('app.services.email_service.EmailService.send_verification_email') as mock_send:
        mock_send.return_value = True
        yield mock_send

class TestAuthFlowIntegration:
    """Integration tests for complete authentication flow"""
    
    def test_complete_auth_flow_success(self, client, mock_email_service):
        """
        Test complete successful authentication flow:
        1. Register user
        2. Verify email
        3. Login
        4. Access protected resource
        5. Logout
        """
        # Step 1: Register new user
        register_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "full_name": TEST_USER_FULL_NAME
        }
        
        register_response = client.post("/api/endpoints/auth/register", json=register_data)
        
        assert register_response.status_code == 201
        register_result = register_response.json()
        assert register_result["email"] == TEST_USER_EMAIL
        assert register_result["full_name"] == TEST_USER_FULL_NAME
        assert "id" in register_result
        
        # Verify email service was called
        mock_email_service.assert_called_once()
        
        # Step 2: Verify user exists in database but not verified
        user = User.objects(email=TEST_USER_EMAIL).first()
        assert user is not None
        assert user.email == TEST_USER_EMAIL
        assert user.is_email_verified == False
        assert user.verification_token is not None
        
        # Step 3: Verify email with token
        verification_token = user.verification_token
        verify_response = client.get(f"/api/endpoints/auth/verify-email?token={verification_token}")
        
        assert verify_response.status_code == 200
        verify_result = verify_response.json()
        assert verify_result["message"] == "Email successfully verified"
        
        # Check user is now verified
        user.reload()
        assert user.is_email_verified == True
        assert user.verification_token is None
        
        # Step 4: Login with correct credentials
        login_data = {
            "username": TEST_USER_EMAIL,  # FastAPI OAuth2 uses 'username' field
            "password": TEST_USER_PASSWORD
        }
        
        login_response = client.post(
            "/api/endpoints/auth/token",
            data=login_data,  # Form data, not JSON
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert login_response.status_code == 200
        login_result = login_response.json()
        assert "access_token" in login_result
        assert login_result["token_type"] == "bearer"
        
        # Extract token for subsequent requests
        access_token = login_result["access_token"]
        auth_headers = {"Authorization": f"Bearer {access_token}"}
        
        # Step 5: Access protected resource (get current user)
        me_response = client.get("/api/endpoints/auth/me", headers=auth_headers)
        
        assert me_response.status_code == 200
        me_result = me_response.json()
        assert me_result["email"] == TEST_USER_EMAIL
        assert me_result["full_name"] == TEST_USER_FULL_NAME
        assert "id" in me_result
        
        # Step 6: Access another protected resource (projects list)
        projects_response = client.get("/api/endpoints/projects/", headers=auth_headers)
        
        assert projects_response.status_code == 200
        projects_result = projects_response.json()
        assert isinstance(projects_result, list)  # Should return empty list for new user
        
        # Step 7: Logout
        logout_response = client.post("/api/endpoints/auth/logout", headers=auth_headers)
        
        assert logout_response.status_code == 200
        logout_result = logout_response.json()
        assert logout_result["message"] == "Successfully logged out"
    
    def test_registration_with_existing_email(self, client, mock_email_service):
        """Test registration fails when email already exists"""
        # Create user first
        User.create_user(
            email=TEST_USER_EMAIL,
            password=TEST_USER_PASSWORD,
            full_name=TEST_USER_FULL_NAME
        )
        
        # Try to register with same email
        register_data = {
            "email": TEST_USER_EMAIL,
            "password": "different_password",
            "full_name": "Different Name"
        }
        
        register_response = client.post("/api/endpoints/auth/register", json=register_data)
        
        assert register_response.status_code == 400
        error_result = register_response.json()
        assert "Email already registered" in error_result["detail"]
    
    def test_login_with_unverified_email(self, client, mock_email_service):
        """Test login fails for unverified email"""
        # Register user but don't verify email
        register_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "full_name": TEST_USER_FULL_NAME
        }
        
        client.post("/api/endpoints/auth/register", json=register_data)
        
        # Try to login without verifying email
        login_data = {
            "username": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        login_response = client.post(
            "/api/endpoints/auth/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert login_response.status_code == 403
        error_result = login_response.json()
        assert "Email not verified" in error_result["detail"]
    
    def test_login_with_wrong_credentials(self, client, mock_email_service):
        """Test login fails with incorrect credentials"""
        # Create and verify user
        user = User.create_user(
            email=TEST_USER_EMAIL,
            password=TEST_USER_PASSWORD,
            full_name=TEST_USER_FULL_NAME
        )
        user.is_email_verified = True
        user.save()
        
        # Try login with wrong password
        login_data = {
            "username": TEST_USER_EMAIL,
            "password": "wrong_password"
        }
        
        login_response = client.post(
            "/api/endpoints/auth/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert login_response.status_code == 401
        error_result = login_response.json()
        assert "Incorrect email or password" in error_result["detail"]
        
        # Try login with wrong email
        login_data = {
            "username": "wrong@example.com",
            "password": TEST_USER_PASSWORD
        }
        
        login_response = client.post(
            "/api/endpoints/auth/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert login_response.status_code == 401
        error_result = login_response.json()
        assert "Incorrect email or password" in error_result["detail"]
    
    def test_access_protected_resource_without_auth(self, client):
        """Test accessing protected resource without authentication fails"""
        # Try to access protected resource without token
        me_response = client.get("/api/endpoints/auth/me")
        
        assert me_response.status_code == 401
        
        projects_response = client.get("/api/endpoints/projects/")
        
        assert projects_response.status_code == 401
    
    def test_access_protected_resource_with_invalid_token(self, client):
        """Test accessing protected resource with invalid token fails"""
        # Use invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token_here"}
        
        me_response = client.get("/api/endpoints/auth/me", headers=invalid_headers)
        
        assert me_response.status_code == 401
        
        projects_response = client.get("/api/endpoints/projects/", headers=invalid_headers)
        
        assert projects_response.status_code == 401
    
    def test_email_verification_with_invalid_token(self, client):
        """Test email verification fails with invalid token"""
        verify_response = client.get("/api/endpoints/auth/verify-email?token=invalid_token")
        
        assert verify_response.status_code == 400
        error_result = verify_response.json()
        assert "Invalid verification token" in error_result["detail"]
    
    def test_email_verification_with_expired_token(self, client, mock_email_service):
        """Test email verification fails with expired token"""
        # Register user
        register_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "full_name": TEST_USER_FULL_NAME
        }
        
        client.post("/api/endpoints/auth/register", json=register_data)
        
        # Get user and manually expire the token
        user = User.objects(email=TEST_USER_EMAIL).first()
        user.verification_token_expires = datetime.now(tz=timezone.utc) - timedelta(hours=1)  # Expired 1 hour ago
        user.save()
        
        # Try to verify with expired token
        verification_token = user.verification_token
        verify_response = client.get(f"/api/endpoints/auth/verify-email?token={verification_token}")
        
        assert verify_response.status_code == 400
        error_result = verify_response.json()
        assert "Verification token has expired" in error_result["detail"]
    
    def test_resend_verification_email(self, client, mock_email_service):
        """Test resending verification email"""
        # Register user
        register_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "full_name": TEST_USER_FULL_NAME
        }
        
        client.post("/api/endpoints/auth/register", json=register_data)
        
        # Reset mock to count new calls
        mock_email_service.reset_mock()
        
        # Resend verification
        resend_data = {"email": TEST_USER_EMAIL}
        resend_response = client.post("/api/endpoints/auth/resend-verification", json=resend_data)
        
        assert resend_response.status_code == 200
        resend_result = resend_response.json()
        assert "Verification email sent" in resend_result["message"]
        
        # Verify email service was called again
        mock_email_service.assert_called_once()
        
    def test_resend_verification_for_verified_user(self, client, mock_email_service):
        """Test resending verification email for already verified user"""
        # Create and verify user
        user = User.create_user(
            email=TEST_USER_EMAIL,
            password=TEST_USER_PASSWORD,
            full_name=TEST_USER_FULL_NAME
        )
        user.is_email_verified = True
        user.save()
        
        # Try to resend verification
        resend_data = {"email": TEST_USER_EMAIL}
        resend_response = client.post("/api/endpoints/auth/resend-verification", json=resend_data)
        
        assert resend_response.status_code == 200
        resend_result = resend_response.json()
        assert "Email already verified" in resend_result["message"]
        
        # Verify email service was not called
        mock_email_service.assert_not_called()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])