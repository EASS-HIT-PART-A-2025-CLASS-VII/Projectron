import pytest
import os
from mongoengine import connect, disconnect

@pytest.fixture(scope="session")
def test_database():
    """Set up test database for the entire test session"""
    # Ensure we're using a test database
    test_db_name = "projectron_test"
    
    # Disconnect any existing connections
    disconnect()
    
    # Connect to test database
    connect(host=f"mongodb://localhost:27017/{test_db_name}")
    
    yield test_db_name
    
    # Cleanup
    disconnect()

@pytest.fixture(autouse=True)
def isolate_tests(test_database):
    """Ensure each test runs in isolation"""
    # This runs before each test
    yield
    # This runs after each test - cleanup is handled in individual test files