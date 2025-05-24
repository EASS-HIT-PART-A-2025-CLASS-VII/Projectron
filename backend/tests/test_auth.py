import pytest
from fastapi import status


def test_register_user(client):
    """Test user registration endpoint"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "password123",
            "full_name": "New User"
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "New User"
    assert "id" in data
    assert "password" not in data  # Password should not be returned


def test_login_with_valid_credentials(client, test_user):
    """Test login with valid credentials"""
    response = client.post(
        "/api/auth/token",
        data={
            "username": test_user.email,  # OAuth2 form uses 'username' field
            "password": "testpassword123"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"