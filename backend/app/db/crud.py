from typing import List, Optional, Any, Type, TypeVar, Generic
from mongoengine import Document
from bson import ObjectId

T = TypeVar('T', bound=Document)

class CRUDBase(Generic[T]):
    """Base class for CRUD operations on MongoDB documents"""
    
    def __init__(self, model: Type[T]):
        self.model = model
    
    def get(self, id: str) -> Optional[T]:
        """Get a document by ID"""
        if not ObjectId.is_valid(id):
            return None
        return self.model.objects(id=id).first()
    
    def get_multi(self, *, skip: int = 0, limit: int = 100) -> List[T]:
        """Get multiple documents with pagination"""
        return list(self.model.objects.skip(skip).limit(limit))
    
    def create(self, *, obj_in: dict) -> T:
        """Create a new document"""
        obj = self.model(**obj_in)
        obj.save()
        return obj
    
    def update(self, *, id: str, obj_in: dict) -> Optional[T]:
        """Update a document"""
        db_obj = self.get(id)
        if not db_obj:
            return None
        
        for field, value in obj_in.items():
            setattr(db_obj, field, value)
        
        db_obj.save()
        return db_obj
    
    def delete(self, *, id: str) -> bool:
        """Delete a document"""
        db_obj = self.get(id)
        if not db_obj:
            return False
        
        db_obj.delete()
        return True