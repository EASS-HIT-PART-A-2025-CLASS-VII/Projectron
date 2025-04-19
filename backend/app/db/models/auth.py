from mongoengine import Document, StringField, DateTimeField, ListField, DictField, BooleanField
from datetime import datetime, timedelta, timezone
import hashlib
import secrets

class User(Document):
    email = StringField(required=True, unique=True)
    hashed_password = StringField(required=True)
    full_name = StringField(required=True)
    created_at = DateTimeField(default=lambda: datetime.now(tz=timezone.utc))
    last_login = DateTimeField()
    roles = ListField(StringField())
    preferences = DictField()
    is_email_verified = BooleanField(default=False)
    verification_token = StringField()
    verification_token_expires = DateTimeField()
    
    meta = {
        'collection': 'users',
        'indexes': ['email']
    }
    
    @classmethod
    def create_user(cls, email, password, full_name, roles=None):
        """Create a new user with hashed password"""
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        return cls(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            roles=roles or ["user"]
        ).save()
    
    def check_password(self, password):
        """Verify password"""
        hashed = hashlib.sha256(password.encode()).hexdigest()
        return hashed == self.hashed_password


    def generate_verification_token(self):
        """Generate a verification token for email confirmation"""
        # Generate a random token
        token = secrets.token_urlsafe(32)
        # Set expiration time (24 hours from now)
        expires = datetime.now(tz=timezone.utc) + timedelta(hours=24)
        
        # Save token and expiration time
        self.verification_token = token
        self.verification_token_expires = expires
        self.save()
        
        return token