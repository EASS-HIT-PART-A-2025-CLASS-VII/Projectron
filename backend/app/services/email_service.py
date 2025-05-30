# In services/email_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import get_settings

settings = get_settings()

class EmailService:
    @staticmethod
    def send_verification_email(user_email, token):
        """Send verification email with confirmation link"""
        
        # Create confirmation link
        confirmation_url = f"{settings.FRONTEND_URL}/auth/verify-email/confirm?token={token}"
        
        # Email content
        subject = "Verify your email address"
        body = f"""<html>
        <head>
            <style>
                body {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #ffffff; color: #1a1a1a; line-height: 1.6; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
                .header {{ text-align: center; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 1px solid #e5e5e5; }}
                .logo {{ font-size: 28px; font-weight: 700; color: #12e88f; margin-bottom: 8px; letter-spacing: -0.5px; }}
                .title {{ font-size: 18px; font-weight: 500; color: #64748b; }}
                .content {{ background: #f8fafc; border-radius: 12px; padding: 32px; text-align: center; border: 1px solid #e2e8f0; }}
                .message {{ font-size: 16px; color: #334155; margin-bottom: 32px; }}
                .cta-button {{ display: inline-block; background: #12e88f; color: #000000 !important; padding: 16px 32px; text-decoration: none !important; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.2s; }}
                .cta-button:hover {{ background: #0fd982; color: #000000 !important; }}
                .cta-button:visited {{ color: #000000 !important; }}
                .cta-button:active {{ color: #000000 !important; }}
                .cta-button:link {{ color: #000000 !important; }}
                a.cta-button {{ color: #000000 !important; text-decoration: none !important; }}
                .footer {{ text-align: center; margin-top: 32px; font-size: 14px; color: #64748b; }}
                .expiry {{ font-size: 14px; color: #64748b; margin-top: 16px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">PROJECTRON</div>
                    <div class="title">AI-Powered Project Planning</div>
                </div>
                
                <div class="content">
                    <div class="message">
                        Welcome to the future of project planning.<br>
                        One click to activate your account.
                    </div>
                    
                    <a href="{confirmation_url}" class="cta-button">Verify Email Address</a>
                    
                    <div class="expiry">Link expires in 24 hours</div>
                </div>
                
                <div class="footer">
                    <p>Best regards,<br>The Projectron Team</p>
                </div>
            </div>
        </body>
        </html>"""
        
        # Create email message
        message = MIMEMultipart()
        message["From"] = settings.SMTP_USER
        message["To"] = user_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "html"))
        
        # Send email
        try:
            server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, user_email, message.as_string())
            server.quit()
            return True
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False
        
    @staticmethod
    def send_contact_form_email(name: str, email: str, inquiry_type: str, subject: str, message: str):
        """Send contact form submission email to admin"""
        
        settings = get_settings()
        
        # Create email subject
        email_subject = f"[Projectron Contact] {inquiry_type.title()}: {subject}"
        
        # Map inquiry types to emojis for better visual identification
        type_emojis = {
            "feature": "💡",
            "bug": "🐛", 
            "question": "❓",
            "other": "💬"
        }
        
        emoji = type_emojis.get(inquiry_type.lower(), "📧")
        
        # Email content
        body = f"""<html>
        <head>
            <style>
                body {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #ffffff; color: #1a1a1a; line-height: 1.6; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
                .header {{ text-align: center; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 1px solid #e5e5e5; }}
                .logo {{ font-size: 28px; font-weight: 700; color: #12e88f; margin-bottom: 8px; letter-spacing: -0.5px; }}
                .title {{ font-size: 18px; font-weight: 500; color: #64748b; }}
                .content {{ background: #f8fafc; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; }}
                .field {{ margin-bottom: 20px; }}
                .field-label {{ font-weight: 600; color: #374151; margin-bottom: 4px; }}
                .field-value {{ background: white; padding: 12px; border-radius: 6px; border: 1px solid #d1d5db; }}
                .message-field {{ margin-top: 24px; }}
                .message-content {{ background: white; padding: 16px; border-radius: 8px; border: 1px solid #d1d5db; white-space: pre-wrap; }}
                .footer {{ text-align: center; margin-top: 32px; font-size: 14px; color: #64748b; }}
                .type-badge {{ display: inline-block; background: #12e88f; color: #000000; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">PROJECTRON</div>
                    <div class="title">Contact Form Submission</div>
                </div>
                
                <div class="content">
                    <div class="type-badge">{emoji} {inquiry_type.title()}</div>
                    
                    <div class="field">
                        <div class="field-label">From:</div>
                        <div class="field-value">{name} &lt;{email}&gt;</div>
                    </div>
                    
                    <div class="field">
                        <div class="field-label">Subject:</div>
                        <div class="field-value">{subject}</div>
                    </div>
                    
                    <div class="field">
                        <div class="field-label">Inquiry Type:</div>
                        <div class="field-value">{inquiry_type.title()}</div>
                    </div>
                    
                    <div class="message-field">
                        <div class="field-label">Message:</div>
                        <div class="message-content">{message}</div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This message was sent via the Projectron contact form.<br>
                    Reply directly to this email to respond to {name}.</p>
                </div>
            </div>
        </body>
        </html>"""
        
        # Create email message
        email_message = MIMEMultipart()
        email_message["From"] = settings.SMTP_USER
        email_message["To"] = settings.CONTACT_EMAIL
        email_message["Subject"] = email_subject
        email_message["Reply-To"] = email  # Allow direct replies to the user
        email_message.attach(MIMEText(body, "html"))
        
        # Send email
        try:
            server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, settings.CONTACT_EMAIL, email_message.as_string())
            server.quit()
            return True
        except Exception as e:
            print(f"Failed to send contact form email: {str(e)}")
            return False