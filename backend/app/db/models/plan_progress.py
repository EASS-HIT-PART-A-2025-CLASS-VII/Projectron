from mongoengine import Document, StringField, IntField, DictField, DateTimeField
from datetime import datetime
from typing import Optional, Dict, Any

class PlanProgress(Document):
    """Track progress of plan generation"""
    
    task_id = StringField(required=True, unique=True)
    user_id = StringField(required=True)
    status = StringField(required=True, choices=['pending', 'processing', 'completed', 'failed'], default='pending')
    current_step = StringField(required=True, default='starting')
    step_number = IntField(required=True, default=0)
    total_steps = IntField(required=True, default=6)
    error_message = StringField()
    result = DictField()  # Store the final plan result
    project_id = StringField()  # Store the created project ID
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'plan_progress',
        'indexes': ['task_id', 'user_id']
    }
    
    def update_progress(self, step: str, step_number: int, status: str = 'processing'):
        """Update progress for current step"""
        self.current_step = step
        self.step_number = step_number
        self.status = status
        self.updated_at = datetime.utcnow()
        self.save()
    
    def complete(self, result: Dict[str, Any], project_id: str):
        """Mark as completed with result"""
        self.status = 'completed'
        self.current_step = 'completed'
        self.step_number = self.total_steps
        self.result = result
        self.project_id = project_id
        self.updated_at = datetime.utcnow()
        self.save()
    
    def fail(self, error: str):
        """Mark as failed with error"""
        self.status = 'failed'
        self.error_message = error
        self.updated_at = datetime.utcnow()
        self.save()