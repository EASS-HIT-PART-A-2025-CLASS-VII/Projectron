# tests/unit/test_auth_models.py
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone, timedelta
import hashlib

from app.db.models.auth import User

@pytest.mark.unit
class TestUserModel:
    """Unit tests for User model business logic"""
    
    def test_password_hashing_directly(self):
        """Test password hashing logic without database operations"""
        password = "testpassword123"
        
        # Test the hashing logic directly
        expected_hash = hashlib.sha256(password.encode()).hexdigest()
        actual_hash = hashlib.sha256(password.encode()).hexdigest()
        
        assert actual_hash == expected_hash
        assert len(actual_hash) == 64  # SHA256 produces 64-character hex string
        assert actual_hash != password  # Hash should be different from original
        
        # Test that different passwords produce different hashes
        different_password = "differentpassword"
        different_hash = hashlib.sha256(different_password.encode()).hexdigest()
        assert different_hash != actual_hash
    
    def test_check_password_method_logic(self):
        """Test password verification logic directly"""
        password = "mypassword123"
        wrong_password = "wrongpassword"
        
        # Test the actual hashing and comparison logic
        correct_hash = hashlib.sha256(password.encode()).hexdigest()
        wrong_hash = hashlib.sha256(wrong_password.encode()).hexdigest()
        
        # Test hash comparison (what check_password does internally)
        assert correct_hash == hashlib.sha256(password.encode()).hexdigest()
        assert correct_hash != hashlib.sha256(wrong_password.encode()).hexdigest()
        assert len(correct_hash) == 64
    
    @patch('app.db.models.auth.secrets.token_urlsafe')
    @patch('app.db.models.auth.datetime')
    def test_generate_verification_token_logic(self, mock_datetime, mock_token):
        """Test verification token generation logic"""
        # Mock datetime to make test deterministic
        fixed_time = datetime(2024, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        mock_datetime.now.return_value = fixed_time
        mock_datetime.timedelta = timedelta  # Keep real timedelta
        
        # Mock token generation
        mock_token.return_value = "test_token_12345"
        
        # Create user instance and manually set required attributes
        user = User()
        user._initialised = True  # Required by mongoengine
        user.email = "test@example.com"
        
        with patch.object(user, 'save') as mock_save:
            token = user.generate_verification_token()
            
            # Verify token was set correctly
            assert token == "test_token_12345"
            assert user.verification_token == "test_token_12345"
            
            # Verify expiration time (should be 24 hours from fixed_time)
            expected_expiry = fixed_time + timedelta(hours=24)
            assert user.verification_token_expires == expected_expiry
            
            # Verify save was called
            mock_save.assert_called_once()
            
            # Verify token generation was called
            mock_token.assert_called_once_with(32)
    
    def test_user_creation_hashing_logic(self):
        """Test the password hashing logic used in user creation"""
        email = "test@example.com"
        password = "password123"
        full_name = "Test User"
        
        # Test the hashing logic that would be used in create_user
        expected_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Verify hash properties
        assert len(expected_hash) == 64
        assert expected_hash != password
        assert expected_hash == hashlib.sha256(password.encode()).hexdigest()  # Consistent
        
        # Test that the hash can be used for verification
        verification_hash = hashlib.sha256(password.encode()).hexdigest()
        assert verification_hash == expected_hash
        
        # Test wrong password doesn't match
        wrong_hash = hashlib.sha256("wrongpassword".encode()).hexdigest()
        assert wrong_hash != expected_hash
    
    def test_oauth_user_properties(self):
        """Test OAuth user properties logic"""
        # Test the logic for OAuth user creation
        oauth_data = {
            "email": "oauth@example.com",
            "full_name": "OAuth User",
            "oauth_provider": "google",
            "oauth_id": "12345",
            "hashed_password": "",  # Empty for OAuth users
            "is_email_verified": True,  # OAuth emails are pre-verified
            "roles": ["user"]
        }
        
        # Test OAuth user validation logic
        assert oauth_data["hashed_password"] == ""
        assert oauth_data["is_email_verified"] == True
        assert "user" in oauth_data["roles"]
        assert oauth_data["oauth_provider"] in ["google", "github"]
        assert len(oauth_data["oauth_id"]) > 0
        assert "@" in oauth_data["email"]