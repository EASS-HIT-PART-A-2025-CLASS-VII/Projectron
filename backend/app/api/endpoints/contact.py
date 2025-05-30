# backend/app/api/endpoints/contact.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator
from typing import Literal
from app.services.email_service import EmailService

router = APIRouter()

# Request model for contact form
class ContactFormRequest(BaseModel):
    name: str
    email: EmailStr
    type: Literal["feature", "bug", "question", "other"]
    subject: str
    message: str
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        return v.strip()
    
    @field_validator('subject')
    @classmethod
    def validate_subject(cls, v):
        if not v or not v.strip():
            raise ValueError('Subject cannot be empty')
        if len(v.strip()) < 5:
            raise ValueError('Subject must be at least 5 characters long')
        return v.strip()
    
    @field_validator('message')
    @classmethod
    def validate_message(cls, v):
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')
        if len(v.strip()) < 10:
            raise ValueError('Message must be at least 10 characters long')
        return v.strip()

# Response model
class ContactFormResponse(BaseModel):
    message: str
    success: bool

@router.post("/contact", response_model=ContactFormResponse)
async def submit_contact_form(contact_data: ContactFormRequest):
    """
    Submit contact form - sends email to admin
    """
    try:
        # Send the contact form email
        email_sent = EmailService.send_contact_form_email(
            name=contact_data.name,
            email=contact_data.email,
            inquiry_type=contact_data.type,
            subject=contact_data.subject,
            message=contact_data.message
        )
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send contact form email. Please try again later."
            )
        
        return ContactFormResponse(
            message="Your message has been sent successfully! We'll get back to you soon.",
            success=True
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Error processing contact form: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request. Please try again later."
        )