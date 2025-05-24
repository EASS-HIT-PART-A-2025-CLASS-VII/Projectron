# Import test environment setup first
from tests.test_env import *  # This sets up all environment variables

import pytest
from fastapi.testclient import TestClient
from mongoengine import connect, disconnect
from datetime import datetime, timezone
import mongomock

from app.main import app
from app.db.models.auth import User
from app.db.models.project import Project
from app.core.jwt import create_access_token


@pytest.fixture(scope="session")
def mongodb():
    """Setup test MongoDB connection"""
    # Disconnect any existing connections
    disconnect()
    
    # Connect to test database using mongomock with the new syntax
    connect('projectron_test', mongo_client_class=mongomock.MongoClient)
    
    yield
    
    # Cleanup
    disconnect()


@pytest.fixture(scope="function")
def client(mongodb):
    """Create test client"""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="function", autouse=True)
def cleanup_db(mongodb):
    """Clean up database before each test"""
    # Drop all collections before each test
    User.drop_collection()
    Project.drop_collection()
    # Add other model cleanups as needed
    yield


@pytest.fixture
def test_user():
    """Create a test user"""
    user = User.create_user(
        email="test@example.com",
        password="testpassword123",
        full_name="Test User"
    )
    user.is_email_verified = True
    user.save()
    return user


@pytest.fixture
def auth_headers(test_user):
    """Create authentication headers with JWT token"""
    access_token = create_access_token(data={"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {access_token}"}