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
        body = f"""
            <html>
                <body>
                    <h1>🚀 Welcome to Projectron! 🚀</h1>
                    <p>Congratulations on joining the most intelligent project planning revolution since humans discovered calendars!</p>
                    <p>Your future self is already thanking you for this brilliant decision. Now, there's just one tiny step between you and project management nirvana...</p>
                    <p><a href="{confirmation_url}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">VERIFY THIS EMAIL!</a></p>
                    <p>⏰ This magical link will self-destruct in 24 hours, so click it before it vanishes like your productivity without Projectron.</p>
                    <p>If you didn't sign up for Projectron, please ignore this email... and reconsider your life choices. Who wouldn't want the world's most awesome AI project planner?</p>
                    <p>May your deadlines always be met and your coffee always be strong,</p>
                    <p>The Projectron Team</p>
                </body>
            </html>
        """
        
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