from mongoengine import Document, StringField, DateTimeField, ListField, DictField, BooleanField, IntField
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
    
    # New fields for password reset
    reset_password_token = StringField()
    reset_password_token_expires = DateTimeField()
    
    # Rate limiting fields
    total_plan_generations = IntField(default=0)
    plan_generations_this_hour = IntField(default=0)
    current_hour_start = DateTimeField(default=lambda: datetime.now(tz=timezone.utc))
    
    oauth_provider = StringField()  # 'google', 'github', etc.
    oauth_id = StringField()        # User's ID from OAuth provider
    
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

    def can_generate_plan(self):
        """
        Check if user can generate a new plan based on rate limits.
        Returns (can_generate: bool, error_message: str)
        """
        # Initialize rate limiting fields if they don't exist (backward compatibility)
        if not hasattr(self, 'total_plan_generations') or self.total_plan_generations is None:
            self.total_plan_generations = 0
        if not hasattr(self, 'plan_generations_this_hour') or self.plan_generations_this_hour is None:
            self.plan_generations_this_hour = 0
        if not hasattr(self, 'current_hour_start') or self.current_hour_start is None:
            self.current_hour_start = datetime.now(tz=timezone.utc)
        
        # Check total limit (30 projects)
        if self.total_plan_generations >= 30:
            return False, "You have reached the maximum limit of 30 projects. Please contact support if you need to increase your limit."
        
        # Check hourly limit (5 projects per hour)
        current_time = datetime.now(tz=timezone.utc)
        current_hour_start = current_time.replace(minute=0, second=0, microsecond=0)
        
        # Make self.current_hour_start timezone-aware if it's naive (for database compatibility)
        if self.current_hour_start and self.current_hour_start.tzinfo is None:
            self.current_hour_start = self.current_hour_start.replace(tzinfo=timezone.utc)
        
        # Reset hourly counter if we're in a new hour
        if not self.current_hour_start or self.current_hour_start < current_hour_start:
            self.plan_generations_this_hour = 0
            self.current_hour_start = current_hour_start
            self.save()
        
        if self.plan_generations_this_hour >= 5:
            next_hour = current_hour_start + timedelta(hours=1)
            minutes_remaining = int((next_hour - current_time).total_seconds() / 60)
            return False, f"You have reached the hourly limit of 5 projects. Please try again in {minutes_remaining} minutes."
        
        return True, ""

    def record_plan_generation(self):
        """
        Record a plan generation attempt. Should be called when plan generation starts.
        """
        # Initialize rate limiting fields if they don't exist (backward compatibility)
        if not hasattr(self, 'total_plan_generations') or self.total_plan_generations is None:
            self.total_plan_generations = 0
        if not hasattr(self, 'plan_generations_this_hour') or self.plan_generations_this_hour is None:
            self.plan_generations_this_hour = 0
        if not hasattr(self, 'current_hour_start') or self.current_hour_start is None:
            self.current_hour_start = datetime.now(tz=timezone.utc)
        
        current_time = datetime.now(tz=timezone.utc)
        current_hour_start = current_time.replace(minute=0, second=0, microsecond=0)
        
        # Make self.current_hour_start timezone-aware if it's naive (for database compatibility)
        if self.current_hour_start and self.current_hour_start.tzinfo is None:
            self.current_hour_start = self.current_hour_start.replace(tzinfo=timezone.utc)
        
        # Ensure hour counter is current
        if not self.current_hour_start or self.current_hour_start < current_hour_start:
            self.plan_generations_this_hour = 0
            self.current_hour_start = current_hour_start
        
        # Increment counters
        self.total_plan_generations += 1
        self.plan_generations_this_hour += 1
        self.save()

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
    
    def generate_reset_password_token(self):
        """Generate a password reset token"""
        # Generate a random token
        token = secrets.token_urlsafe(32)
        # Set expiration time (1 hour from now)
        expires = datetime.now(tz=timezone.utc) + timedelta(hours=1)
        
        # Save token and expiration time
        self.reset_password_token = token
        self.reset_password_token_expires = expires
        self.save()
        
        return token
    
    def reset_password(self, new_password):
        """Reset user password and clear reset token"""
        self.hashed_password = hashlib.sha256(new_password.encode()).hexdigest()
        self.reset_password_token = None
        self.reset_password_token_expires = None
        self.save()

    @classmethod
    def create_oauth_user(cls, email, full_name, oauth_provider, oauth_id, roles=None):
        """Create a new OAuth user (no password required)"""
        return cls(
            email=email,
            hashed_password="",  # Empty for OAuth users
            full_name=full_name,
            oauth_provider=oauth_provider,
            oauth_id=oauth_id,
            roles=roles or ["user"],
            is_email_verified=True  # OAuth emails are pre-verified
        ).save()