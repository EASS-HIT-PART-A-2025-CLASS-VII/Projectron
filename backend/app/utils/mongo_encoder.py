from bson import ObjectId
from fastapi.encoders import jsonable_encoder
import json
from typing import Any, Dict, List

class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

def mongo_jsonable_encoder(obj, **kwargs):
    """Custom jsonable encoder that handles MongoDB ObjectId"""
    raw = jsonable_encoder(obj, custom_encoder={ObjectId: str}, **kwargs)
    return raw

def serialize_mongodb_doc(obj: Any) -> Any:
    """
    Recursively serialize MongoDB documents and ObjectIds to JSON-compatible formats.
    Handles nested dictionaries, lists, and special MongoDB types.
    Converts '_id' fields to 'id' fields.
    """
    if isinstance(obj, dict):
        # Handle dictionaries - including those from .to_mongo().to_dict()
        result = {}
        for k, v in obj.items():
            if v is not None:
                if k == '_id':
                    result['id'] = serialize_mongodb_doc(v)
                else:
                    result[k] = serialize_mongodb_doc(v)
        return result
    elif isinstance(obj, list):
        # Handle lists
        return [serialize_mongodb_doc(item) for item in obj]
    elif isinstance(obj, ObjectId):
        # Convert ObjectId to string
        return str(obj)
    elif hasattr(obj, 'to_mongo'):
        # Handle mongoengine documents by converting to dict first
        return serialize_mongodb_doc(obj.to_mongo().to_dict())
    else:
        # Return other types as-is
        return obj