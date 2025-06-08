# Use official Python image as base
FROM python:3.12-slim

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY src/ ./src/

# Copy environment variables file
COPY .env ./

# Expose port for FastAPI
EXPOSE 8000

# Set environment variables (optional, for local dev)
ENV PYTHONUNBUFFERED=1

# Run the FastAPI app
CMD ["python", "src/main.py"]
