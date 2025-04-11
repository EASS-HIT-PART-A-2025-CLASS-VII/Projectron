from mongoengine import Document, ReferenceField, ListField, DictField, DateTimeField
from datetime import datetime
from .project import Project

class AIConversation(Document):
    project_id = ReferenceField(Project, required=True)
    messages = ListField(DictField())
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)
    metadata = DictField()
    
    meta = {
        'collection': 'ai_conversations',
        'indexes': [
            'project_id'
        ]
    }