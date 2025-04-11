FROM python:3.12

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Set environment variables for better Python behavior in containers
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1


CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]