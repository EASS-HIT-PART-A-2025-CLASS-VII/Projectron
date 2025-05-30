# 🤖 Projectron
**AI-powered project planning for developers**

Transform project descriptions into comprehensive development plans with AI-generated architecture, APIs, and implementation roadmaps.

[Live Demo](https://projectron-production.up.railway.app) • [Report Bug](https://github.com/Eden-Cohen1/projectron/issues)

---

## ✨ Features

- **Smart Planning**: AI generates complete project plans from simple descriptions
- **Technical Architecture**: Auto-generated system diagrams and component breakdowns  
- **API Design**: Complete REST API specifications with schemas
- **Database Models**: Entity relationships and data structures
- **UI Planning**: Component hierarchies and screen layouts
- **AI Context**: Ready-to-use prompts for coding assistants
- **Visual Diagrams**: UML class, sequence, and activity diagrams

![image](https://github.com/user-attachments/assets/90ef9f08-262e-45c4-8c88-7e1b0bf51976)

## 🎯 Use Cases

**🎓 Students:** Academic projects, hackathon planning, learning software architecture

**💼 Freelancers:** Client proposals, accurate time estimates, clear project scope

**👨‍💻 Solo Developers:** Learning new technologies, exploring project ideas, structured practice

**🚀 Entrepreneurs:** MVP structuring, technical complexity assessment, team alignment

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key
- Google Gemini API key

### Option 1: Docker (Recommended)

```bash
# Clone repo
git clone https://github.com/Eden-Cohen1/projectron.git
cd projectron

# Set up environment files (see below)
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Run with Docker
docker-compose up --build
```

Visit [http://localhost:3000](http://localhost:3000)

### Option 2: Local Development

```bash
# Clone repo
git clone https://github.com/Eden-Cohen1/projectron.git
cd projectron

# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # Configure your API keys
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (new terminal)
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Environment Configuration

#### Backend `.env`
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/projectron
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/projectron

# Security
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=2880

# AI Services (Required)
openai_api_key=sk-your-openai-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here

# Selenium (for diagram generation)
SELENIUM_URL=http://selenium:4444
# For local development without Docker: http://localhost:4444

# Email (Optional - for user registration)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# OAuth (Optional - for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Environment
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
```

#### Frontend `.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/endpoints
```

---

# 🛠️ Tech Stack
**Backend:** FastAPI, MongoDB, OpenAI, Google Gemini, LangChain, Selenium

**Frontend:** Next.js, TypeScript, Tailwind CSS, shadcn, Framer Motion

**Deployment:** Railway, MongoDB Atlas, Docker

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

**Made with ❤️ for developers**
