# 🤖 Projectron

**AI-powered project planning for developers**

Transform project descriptions into comprehensive development plans with AI-generated architecture, APIs, and implementation roadmaps.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![React](https://img.shields.io/badge/React-18-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green) ![Python](https://img.shields.io/badge/Python-3.12-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green) ![Docker](https://img.shields.io/badge/Docker-24.0-blue)

[Live Demo](https://projectron-production.up.railway.app) • [Report Bug](https://github.com/Eden-Cohen1/projectron/issues)

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About the Project

Projectron is a comprehensive project planning platform that leverages multiple AI models to transform high-level project descriptions into detailed, actionable development plans. Built for developers, by developers, it generates complete technical specifications including architecture diagrams, API endpoints, database schemas, and implementation roadmaps.

### Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│◄──► │  FastAPI Backend│◄──►│   MongoDB Atlas │
│   (TypeScript)  │     │    (Python)     │    │   (Database)    │
└─────────────────┘     └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│  AI Services    │◄─────────────┘
                        │ (OpenAI/Gemini) │
                        └─────────────────┘
                                │
                        ┌─────────────────┐
                        │    Selenium     │
                        │ (Diagram Gen)   │
                        └─────────────────┘
```

### Key Design Principles

- **AI-First Architecture**: Multiple AI models (OpenAI, Gemini) with fallback mechanisms
- **Real-time Progress Tracking**: Background task processing with live status updates
- **Comprehensive Planning**: From high-level vision to detailed implementation tasks
- **Visual Documentation**: Auto-generated UML diagrams (class, sequence, activity)
- **Developer-Centric**: Export-ready context for AI coding assistants

## Features

### 🎯 Core Features

- **AI Plan Generation** - Transform descriptions into complete project plans
- **Smart Clarifications** - AI asks relevant questions to refine requirements
- **Technical Architecture** - System design with component breakdowns
- **API Specifications** - Complete REST API documentation with schemas
- **Database Design** - Entity relationships and data models
- **UI Planning** - Component hierarchies and screen layouts
- **Implementation Roadmap** - Detailed tasks with time estimates
- **Progress Tracking** - Real-time plan generation status

### 📊 Visual Documentation

- **Class Diagrams** - Object-oriented design visualization
- **Sequence Diagrams** - Interaction flow documentation
- **Activity Diagrams** - Business process workflows
- **Architecture Diagrams** - System component relationships

### 🤖 AI Integration

- **Multiple AI Models** - OpenAI GPT-4, Google Gemini with fallbacks
- **Context Generation** - Ready-to-use prompts for coding assistants
- **Smart Recommendations** - AI-powered architecture suggestions
- **Adaptive Planning** - Plans scale with project complexity

### 🔐 Authentication & Security

- **JWT Authentication** - Secure token-based auth with httpOnly cookies
- **Google OAuth2** - Social login integration
- **GitHub OAuth2** - Developer-friendly authentication
- **Email Verification** - Account verification flow
- **Password Reset** - Secure password recovery

### 🎨 User Experience

- **Responsive Design** - Works on desktop and mobile
- **Dark Theme** - Modern UI with smooth animations
- **Real-time Updates** - Live progress indicators
- **Export Options** - Download plans in multiple formats
- **Toast Notifications** - Instant feedback on actions

## Tech Stack

### Frontend

- **React 18** - Modern React with Hooks
- **Next.js 14** - Full-stack React framework
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3** - Utility-first styling
- **Framer Motion** - Smooth animations
- **shadcn/ui** - Accessible UI components
- **Lucide Icons** - Modern icon library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend

- **FastAPI** - Modern Python web framework
- **Python 3.12** - Latest Python features
- **Pydantic 2** - Data validation
- **MongoEngine** - MongoDB ODM
- **LangChain** - AI orchestration
- **LangGraph** - Stateful AI workflows
- **PyJWT** - JWT implementation
- **Passlib** - Password hashing
- **HTTPX** - Async HTTP client

### AI & External Services

- **OpenAI API** - GPT-4 models for plan generation
- **Google Gemini** - Alternative AI model
- **Selenium** - Browser automation for diagrams
- **sequencediagram.org** - Sequence diagram generation
- **Graphviz** - Class & activity diagrams
- **SMTP/Gmail** - Email notifications

### DevOps & Tools

- **Docker & Docker Compose** - Containerization
- **Railway** - Cloud deployment platform
- **MongoDB Atlas** - Managed database
- **GitHub Actions** - CI/CD pipeline
- **Pytest** - Python testing framework
- **ESLint & Prettier** - Code quality

## Project Structure

```
Projectron/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py          # Authentication endpoints
│   │   │   │   ├── context.py       # AI context generation
│   │   │   │   ├── contact.py       # Contact form handling
│   │   │   │   ├── diagrams.py      # Diagram generation
│   │   │   │   ├── plan.py          # Project plan generation
│   │   │   │   ├── profile.py       # User profile management
│   │   │   │   └── projects.py      # Project CRUD operations
│   │   │   ├── api_router.py        # API route configuration
│   │   │   └── deps.py              # Dependencies & auth
│   │   ├── core/
│   │   │   ├── config.py            # Application settings
│   │   │   └── jwt.py               # JWT token handling
│   │   ├── db/
│   │   │   ├── models/
│   │   │   │   ├── auth.py          # User model
│   │   │   │   ├── plan_progress.py # Progress tracking
│   │   │   │   └── project.py       # Project model
│   │   │   └── mongodb.py           # Database connection
│   │   ├── pydantic_models/
│   │   │   ├── ai_plan_models.py    # AI response schemas
│   │   │   ├── context_models.py    # Context schemas
│   │   │   └── project_http_models.py # API request/response
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── prompts/
│   │   │   │   │   ├── context_prompts.py   # Context generation
│   │   │   │   │   ├── diagram_prompts.py   # Diagram prompts
│   │   │   │   │   └── plan_prompts.py      # Planning prompts
│   │   │   │   ├── ai_plan_service.py       # Plan generation
│   │   │   │   ├── ai_utils.py              # AI utilities
│   │   │   │   ├── class_diagram_service.py # Class diagrams
│   │   │   │   ├── context_service.py       # Context service
│   │   │   │   └── sequence_diagram_service.py # Sequence diagrams
│   │   │   └── email_service.py     # Email notifications
│   │   ├── utils/
│   │   │   ├── context-utils.py     # Context utilities
│   │   │   ├── mongo_encoder.py     # MongoDB serialization
│   │   │   ├── serializers.py       # Data serializers
│   │   │   └── timing.py            # Performance timing
│   │   └── main.py                  # Application entry
│   ├── tests/
│   │   ├── integration/
│   │   │   ├── test_auth_endpoints.py
│   │   │   ├── test_auth_flow.py
│   │   │   ├── test_diagrams_endpoints.py
│   │   │   ├── test_plan_endpoints.py
│   │   │   ├── test_profile_endpoints.py
│   │   │   ├── test_project_creation_flow.py
│   │   │   └── test_projects_endpoints.py
│   │   └── unit/
│   │       ├── test_ai_service.py
│   │       ├── test_auth_models.py
│   │       ├── test_jwt_utils.py
│   │       ├── test_mongo_encoder.py
│   │       ├── test_project_model.py
│   │       └── test_serializers.py
│   ├── Dockerfile
│   ├── Dockerfile.local
│   ├── Makefile                     # Test runner commands
│   ├── pytest.ini                   # Pytest configuration
│   ├── requirements.txt
│   └── requirements-test.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── styles/
│   ├── Dockerfile
│   ├── Dockerfile.local
│   ├── next.config.js
│   ├── package.json
│   └── tsconfig.json
├── selenium/
│   ├── Dockerfile
│   └── railway.toml
├── docker-compose.yml
├── docker-compose.override.yml
└── README.md
```

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Git** for cloning the repository
- **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com)
- **Google Gemini API Key** - Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Google OAuth Credentials** (Optional) - Set up at [Google Cloud Console](https://console.cloud.google.com)
- **GitHub OAuth Credentials** (Optional) - Set up at [GitHub Developer Settings](https://github.com/settings/developers)
- **MongoDB Atlas Account** - Free tier at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/EASS-HIT-PART-A-2025-CLASS-VII/Projectron.git
cd projectron
```

2. **Create environment files**

```bash
# Create backend environment file
cp backend/.env.example backend/.env

# Create frontend environment file
cp frontend/.env.local.example frontend/.env.local
```

### Environment Setup

#### Backend Environment (`backend/.env`)

```bash
# Database Configuration
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/projectron?retryWrites=true&w=majority"
MONGODB_DB_NAME="projectron"

# Security Configuration
SECRET_KEY="your-super-secret-key-here-make-it-long-and-random"  # Generate: openssl rand -hex 32
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=2880  # 48 hours

# Cookie Settings
COOKIE_NAME="access_token"
COOKIE_HTTPONLY=true
COOKIE_SECURE=true  # Set to true in production with HTTPS
COOKIE_SAMESITE="none"
COOKIE_MAX_AGE=172800  # 48 hours in seconds

# AI Services (Required)
openai_api_key="sk-your-openai-api-key-here"
GEMINI_API_KEY="your-gemini-api-key-here"
GEMINI_MODEL="gemini-2.5-flash-preview-05-20"

# Diagram Generation
SELENIUM_URL="http://selenium:4444"  # Use http://localhost:4444 for local dev
SEQUENCE_DIAGRAM_SITE_URL="https://sequencediagram.org"
SELENIUM_TIMEOUT=30
MAX_DIAGRAM_ITERATIONS=3
ENABLE_MERMAID_CLI_VALIDATION=true
DIAGRAM_TEMPERATURE=0.2

# Email Configuration (Optional)
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"
CONTACT_EMAIL="your-contact-email@gmail.com"

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:8000/api/endpoints/auth/google/callback"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_REDIRECT_URI="http://localhost:8000/api/endpoints/auth/github/callback"

# Application URLs
FRONTEND_URL="http://localhost:3000"
FRONT_AUTH_REDIRECT_SUCCESS="http://localhost:3000/auth/oauth-success"
FRONT_AUTH_REDIRECT_FAILURE="http://localhost:3000/auth/oauth-error"

# Environment
ENVIRONMENT="development"

# CORS Origins
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000", "https://projectron-production.up.railway.app"]
```

#### Frontend Environment (`frontend/.env.local`)

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/endpoints

# Google Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-YOUR-GA-ID
```

### Environment Variables Guide

| Variable           | Required    | Description                    | How to Obtain                                                    |
| ------------------ | ----------- | ------------------------------ | ---------------------------------------------------------------- |
| `MONGODB_URI`      | ✅ Yes      | MongoDB connection string      | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)             |
| `SECRET_KEY`       | ✅ Yes      | JWT signing secret (64+ chars) | Generate: `openssl rand -hex 32`                                 |
| `openai_api_key`   | ✅ Yes      | OpenAI API key                 | [OpenAI Platform](https://platform.openai.com)                   |
| `GEMINI_API_KEY`   | ✅ Yes      | Google Gemini API key          | [Google AI Studio](https://makersuite.google.com)                |
| `GOOGLE_CLIENT_ID` | ⚠️ OAuth    | Google OAuth client ID         | [Google Cloud Console](https://console.cloud.google.com)         |
| `GITHUB_CLIENT_ID` | ⚠️ OAuth    | GitHub OAuth client ID         | [GitHub Settings](https://github.com/settings/developers)        |
| `SMTP_PASSWORD`    | 🔧 Optional | Gmail app password             | [Gmail App Passwords](https://myaccount.google.com/apppasswords) |

### Running the Application

#### Option 1: Docker (Recommended)

```bash
# Start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The application will automatically:

- Build and start the Next.js frontend on port 3000
- Launch the FastAPI backend on port 8000
- Start Selenium container for diagram generation
- Configure all necessary services

#### Option 2: Local Development

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Access the application:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## API Documentation

### Authentication Endpoints

| Method | Endpoint                    | Description               | Auth Required |
| ------ | --------------------------- | ------------------------- | ------------- |
| POST   | `/auth/register`            | Create new user account   | ❌            |
| POST   | `/auth/token`               | Login with credentials    | ❌            |
| POST   | `/auth/logout`              | Logout user               | ✅            |
| GET    | `/auth/verify-email`        | Verify email address      | ❌            |
| POST   | `/auth/resend-verification` | Resend verification email | ❌            |
| POST   | `/auth/forgot-password`     | Request password reset    | ❌            |
| POST   | `/auth/reset-password`      | Reset password with token | ❌            |
| GET    | `/auth/google`              | Initiate Google OAuth     | ❌            |
| GET    | `/auth/google/callback`     | Google OAuth callback     | ❌            |
| GET    | `/auth/github`              | Initiate GitHub OAuth     | ❌            |
| GET    | `/auth/github/callback`     | GitHub OAuth callback     | ❌            |
| POST   | `/auth/oauth/exchange`      | Exchange OAuth token      | ❌            |
| GET    | `/auth/me`                  | Get current user          | ✅            |

### Project Management

| Method | Endpoint                 | Description          | Auth Required |
| ------ | ------------------------ | -------------------- | ------------- |
| GET    | `/projects/`             | List user's projects | ✅            |
| GET    | `/projects/{project_id}` | Get project details  | ✅            |
| PUT    | `/projects/{project_id}` | Update project       | ✅            |
| DELETE | `/projects/{project_id}` | Delete project       | ✅            |

### Plan Generation

| Method | Endpoint                 | Description                      | Auth Required |
| ------ | ------------------------ | -------------------------------- | ------------- |
| POST   | `/plan/clarify`          | Generate clarification questions | ✅            |
| POST   | `/plan/generate-plan`    | Start plan generation            | ✅            |
| GET    | `/plan/status/{task_id}` | Check generation status          | ✅            |

### Diagram Generation

| Method | Endpoint                          | Description                  | Auth Required |
| ------ | --------------------------------- | ---------------------------- | ------------- |
| POST   | `/diagrams/sequence/create`       | Create sequence diagram      | ✅            |
| PUT    | `/diagrams/sequence/update`       | Update sequence diagram      | ✅            |
| GET    | `/diagrams/sequence/{project_id}` | Get sequence diagram         | ✅            |
| POST   | `/diagrams/class/create`          | Create class diagram         | ✅            |
| PUT    | `/diagrams/class/update`          | Update class diagram         | ✅            |
| GET    | `/diagrams/class/{project_id}`    | Get class diagram            | ✅            |
| POST   | `/diagrams/activity/create`       | Create activity diagram      | ✅            |
| PUT    | `/diagrams/activity/update`       | Update activity diagram      | ✅            |
| GET    | `/diagrams/activity/{project_id}` | Get activity diagram         | ✅            |
| GET    | `/diagrams/status`                | Check diagram service status | ❌            |

### AI Context & User Profile

| Method | Endpoint                       | Description          | Auth Required |
| ------ | ------------------------------ | -------------------- | ------------- |
| POST   | `/context/generate`            | Generate AI context  | ✅            |
| GET    | `/context/latest/{project_id}` | Get latest context   | ✅            |
| PUT    | `/context/notes/{project_id}`  | Update context notes | ✅            |
| GET    | `/context/notes/{project_id}`  | Get context notes    | ✅            |
| GET    | `/users/profile`               | Get user profile     | ✅            |
| PUT    | `/users/profile`               | Update profile       | ✅            |
| POST   | `/users/change-password`       | Change password      | ✅            |
| GET    | `/users/profile/stats`         | Get user statistics  | ✅            |
| POST   | `/contact`                     | Submit contact form  | ❌            |

### Example API Usage

```bash
# Register new user
curl -X POST "http://localhost:8000/api/endpoints/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "full_name": "John Doe"
  }'

# Login (get access token)
curl -X POST "http://localhost:8000/api/endpoints/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=securepassword123"

# Generate clarification questions
curl -X POST "http://localhost:8000/api/endpoints/plan/clarify" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Task Manager App",
    "description": "A web app for managing tasks with team collaboration",
    "tech_stack": ["React", "FastAPI", "PostgreSQL"],
    "experience_level": "mid",
    "team_size": 2,
    "time_scale": "medium"
  }'

# Start plan generation
curl -X POST "http://localhost:8000/api/endpoints/plan/generate-plan" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input_data": {
      "name": "Task Manager App",
      "description": "A web app for managing tasks",
      "tech_stack": ["React", "FastAPI"],
      "experience_level": "mid",
      "team_size": 2,
      "time_scale": "medium"
    },
    "clarification_qa": {
      "Do you need user authentication?": "Yes, with email and OAuth",
      "Will it support real-time updates?": "Yes, using WebSockets"
    }
  }'

# Check plan generation status
curl "http://localhost:8000/api/endpoints/plan/status/TASK_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Usage Guide

### 1. Getting Started

1. **Sign Up**: Create an account with email and password
2. **Email Verification**: Check your email and click the verification link
3. **Login**: Access your account with credentials or OAuth providers

### 2. Creating a Project Plan

1. **Describe Your Project**: Provide a name, description, and basic details
2. **Answer Clarifications**: AI will ask 4-6 questions to better understand your needs
3. **Generate Plan**: Click generate and watch the real-time progress
4. **Review Results**: Explore the generated architecture, APIs, and tasks

### 3. Working with Diagrams

- **Class Diagrams**: View object-oriented design
- **Sequence Diagrams**: Understand interaction flows
- **Activity Diagrams**: See business processes
- **Update Diagrams**: Request changes through natural language

### 4. AI Context Generation

1. **Add Context Notes**: Provide additional requirements or constraints
2. **Generate Context**: Create comprehensive prompts for AI coding assistants
3. **Export Context**: Copy the context to use with ChatGPT, Claude, etc.

### 5. Project Management

- **View Projects**: See all your generated plans
- **Update Details**: Modify project information
- **Track Progress**: Monitor implementation status
- **Export Plans**: Download plans in various formats

## Development

### Local Development Setup

1. **Backend Development**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-test.txt  # For testing
uvicorn app.main:app --reload
```

2. **Frontend Development**

```bash
cd frontend
npm install
npm run dev
```

3. **Database Setup (Local MongoDB)**

```bash
docker run -d --name mongodb -p 27017:27017 mongo:7.0
```

### Testing

The project includes comprehensive testing with **65+ tests** across 5 test suites:

| Test Suite          | File                         | Tests    | Coverage                            |
| ------------------- | ---------------------------- | -------- | ----------------------------------- |
| **Authentication**  | `test_auth_endpoints.py`     | 8 tests  | Login, Registration, JWT, OAuth     |
| **Projects**        | `test_projects_endpoints.py` | 12 tests | CRUD, Ownership, Collaboration      |
| **Plan Generation** | `test_plan_endpoints.py`     | 10 tests | AI Plan Creation, Progress Tracking |
| **Diagrams**        | `test_diagrams_endpoints.py` | 11 tests | Sequence, Class, Activity Diagrams  |
| **Profile**         | `test_profile_endpoints.py`  | 20 tests | User Management, Stats, Security    |

**Running Tests:**

```bash
# Run all tests
make test

# Run with coverage
make test-coverage

# Run specific test suite
make test-auth
make test-projects
make test-plan

# Run unit tests only
make unit

# Run integration tests only
make integration
```

### Code Quality

```bash
# Backend linting
cd backend
flake8 app/
black app/

# Frontend linting
cd frontend
npm run lint
npm run format
```

## Deployment

### Railway Deployment

The project is configured for easy deployment on Railway:

1. Fork the repository
2. Connect Railway to your GitHub
3. Create new project from the forked repo
4. Add environment variables in Railway dashboard
5. Deploy!

### Manual Deployment

1. **Build Docker images**

```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Configure production environment**

- Use MongoDB Atlas for database
- Set `COOKIE_SECURE=true` for HTTPS
- Update CORS origins
- Use strong SECRET_KEY

3. **Deploy to your platform**

- Railway (recommended)
- Heroku
- AWS ECS
- Google Cloud Run
- DigitalOcean App Platform

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features (aim for >80% coverage)
- Update documentation as needed
- Ensure all tests pass before submitting PR

### Code Style

- **Python**: Follow PEP 8, use Black formatter
- **TypeScript**: Follow ESLint rules, use Prettier
- **Commits**: Use conventional commits format

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

**Project Maintainer**: Eden Cohen

- Email: edencohen.dev@gmail.com
- GitHub: [@Eden-Cohen1](https://github.com/Eden-Cohen1)
- LinkedIn: [Eden Cohen](https://linkedin.com/in/eden-cohen)
- Project Link: [https://github.com/Eden-Cohen1/projectron](https://github.com/Eden-Cohen1/projectron)

---

**Made with ❤️ for developers** • Built using React, FastAPI, MongoDB, and AI
