#!/bin/bash

# Install dependencies from requirements.txt
pip install -r requirements.txt

# Run the FastAPI application with uvicorn
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
