import os
import mongoengine
from ..core.config import get_settings

def connect_to_mongo():
    """Connect to MongoDB"""
    settings = get_settings()
    try:
        mongoengine.connect(
            host=settings.MONGODB_URI,
            db=settings.MONGODB_DB_NAME,
            alias='default'
        )
        print(f"Connected to MongoDB at {settings.MONGODB_URI}")
        return True
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        return False

def close_mongo_connection():
    """Close MongoDB connection"""
    try:
        mongoengine.disconnect()
        print("MongoDB connection closed")
        return True
    except Exception as e:
        print(f"Error closing MongoDB connection: {e}")
        return False