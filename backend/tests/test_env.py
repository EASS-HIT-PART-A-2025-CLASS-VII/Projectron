"""
Set up test environment variables
Import this at the top of conftest.py
"""

import os

# Set test environment variables
os.environ.update({
    "MONGODB_URL": "mongodb://localhost:27017/projectron_test",
    "JWT_SECRET": "test_secret_key_for_testing_only",
    "JWT_ALGORITHM": "HS256",
    "ACCESS_TOKEN_EXPIRE_MINUTES": "30",
    "ENVIRONMENT": "testing",
    "SMTP_HOST": "",
    "SMTP_PORT": "587",
    "SMTP_USER": "",
    "SMTP_PASSWORD": "",
    "GOOGLE_CLIENT_ID": "",
    "GOOGLE_CLIENT_SECRET": "",
    "GOOGLE_REDIRECT_URI": "",
    "GITHUB_CLIENT_ID": "",
    "GITHUB_CLIENT_SECRET": "",
    "GITHUB_REDIRECT_URI": "",
    "DIAGRAM_TEMPERATURE": "0.7",
    "SELENIUM_URL": "http://localhost:4444/wd/hub",
    "SEQUENCE_DIAGRAM_SITE_URL": "https://sequencediagram.org",
    "SELENIUM_TIMEOUT": "30"
})