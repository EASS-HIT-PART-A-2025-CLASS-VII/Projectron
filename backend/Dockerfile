# backend/Dockerfile
FROM python:3.12-slim

# Install system dependencies including Graphviz
RUN apt-get update && apt-get install -y \
    graphviz \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome for Selenium (if using local Chrome)
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Set environment variables for better Python behavior in containers
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=8000

EXPOSE $PORT

CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT