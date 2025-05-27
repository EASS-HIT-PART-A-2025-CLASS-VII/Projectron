# tests/unit/test_jwt_utils.py
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone, timedelta
from jose import jwt

from app.core.jwt import create_access_token

@pytest.mark.unit
class TestJWTUtils:
    """Unit tests for JWT utility functions"""
    
    def test_create_access_token_with_default_expiry(self):
        """Test JWT token creation with default expiration"""
        # Test data
        data = {"sub": "user123", "email": "test@example.com"}
        
        # Mock settings
        with patch('app.core.jwt.settings') as mock_settings:
            mock_settings.SECRET_KEY = "test-secret-key"
            mock_settings.ALGORITHM = "HS256"
            mock_settings.ACCESS_TOKEN_EXPIRE_MINUTES = 30
            
            # Create token
            token = create_access_token(data)
            
            # Verify token is a string
            assert isinstance(token, str)
            assert len(token) > 50  # JWT tokens are substantial
            
            # Decode token without verifying expiration (for testing)
            decoded = jwt.decode(
                token, 
                "test-secret-key", 
                algorithms=["HS256"],
                options={"verify_exp": False}  # Skip expiration validation for testing
            )
            
            # Verify payload
            assert decoded["sub"] == "user123"
            assert decoded["email"] == "test@example.com"
            
            # Verify expiration field exists
            assert "exp" in decoded
            assert isinstance(decoded["exp"], int)
    
    def test_create_access_token_with_custom_expiry(self):
        """Test JWT token creation with custom expiration"""
        # Test data
        data = {"sub": "user456"}
        custom_expiry = timedelta(hours=2)
        
        # Mock settings
        with patch('app.core.jwt.settings') as mock_settings:
            mock_settings.SECRET_KEY = "test-secret-key"
            mock_settings.ALGORITHM = "HS256"
            
            # Create token with custom expiry
            token = create_access_token(data, expires_delta=custom_expiry)
            
            # Decode and verify (skip expiration validation)
            decoded = jwt.decode(
                token, 
                "test-secret-key", 
                algorithms=["HS256"],
                options={"verify_exp": False}
            )
            
            # Verify payload
            assert decoded["sub"] == "user456"
            assert "exp" in decoded
    
    def test_create_access_token_minimal_data(self):
        """Test JWT token creation with minimal data"""
        data = {"sub": "user789"}
        
        with patch('app.core.jwt.settings') as mock_settings:
            mock_settings.SECRET_KEY = "test-secret"
            mock_settings.ALGORITHM = "HS256"
            mock_settings.ACCESS_TOKEN_EXPIRE_MINUTES = 15
            
            token = create_access_token(data)
            
            # Verify token is valid
            assert isinstance(token, str)
            assert len(token) > 30
            
            # Verify can be decoded (skip expiration check)
            decoded = jwt.decode(
                token, 
                "test-secret", 
                algorithms=["HS256"],
                options={"verify_exp": False}
            )
            assert decoded["sub"] == "user789"
            assert "exp" in decoded
    
    def test_jwt_token_structure(self):
        """Test JWT token structure and format"""
        data = {"sub": "test-user", "role": "admin"}
        
        with patch('app.core.jwt.settings') as mock_settings:
            mock_settings.SECRET_KEY = "secret-key"
            mock_settings.ALGORITHM = "HS256"
            mock_settings.ACCESS_TOKEN_EXPIRE_MINUTES = 60
            
            token = create_access_token(data)
            
            # JWT tokens have 3 parts separated by dots
            parts = token.split('.')
            assert len(parts) == 3
            
            # Each part should be base64-encoded
            for part in parts:
                assert len(part) > 0
                assert all(c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_' for c in part)
    
    def test_token_payload_integrity(self):
        """Test that token payload contains expected data"""
        original_data = {
            "sub": "user-12345",
            "email": "user@example.com",
            "role": "user",
            "permissions": ["read", "write"]
        }
        
        with patch('app.core.jwt.settings') as mock_settings:
            mock_settings.SECRET_KEY = "integrity-test-key"
            mock_settings.ALGORITHM = "HS256"
            mock_settings.ACCESS_TOKEN_EXPIRE_MINUTES = 30
            
            token = create_access_token(original_data)
            
            # Decode and verify all original data is present
            decoded = jwt.decode(
                token,
                "integrity-test-key",
                algorithms=["HS256"],
                options={"verify_exp": False}
            )
            
            # Check all original fields are preserved
            for key, value in original_data.items():
                assert key in decoded
                assert decoded[key] == value
            
            # Verify expiration was added
            assert "exp" in decoded
            assert isinstance(decoded["exp"], int)