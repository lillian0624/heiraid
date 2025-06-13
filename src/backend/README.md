# HeirAid Backend Setup & Azure OpenAI Integration Guide

## Overview

This document explains how to set up the HeirAid backend (FastAPI) and connect it to Azure OpenAI for AI-powered chat and document processing.

---

## 1. Prerequisites

- Python 3.8+
- [pip](https://pip.pypa.io/en/stable/)
- Access to [Azure OpenAI Service](https://portal.azure.com/)
- Access to [Azure Cognitive Search](https://portal.azure.com/)
- (Optional) [Git](https://git-scm.com/)

---

## 2. Backend Setup

### a. Clone the Repository

```sh
git clone https://github.com/lillian0624/heiraid.git
cd heiraid/src/backend
```

### b. Install Dependencies

```sh
pip install -r requirements.txt
```

### c. Environment Variables

Create a `.env` file in `src/backend/` with the following content:

```
# Azure Cognitive Search
AZURE_SEARCH_ENDPOINT=https://<your-search-service>.search.windows.net
AZURE_SEARCH_INDEX=<your-index-name>
AZURE_SEARCH_KEY=<your-search-key>

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://<your-openai-resource>.openai.azure.com/
AZURE_OPENAI_API_KEY=<your-openai-api-key>
AZURE_OPENAI_CHAT_DEPLOYMENT_NAME=<your-deployment-name>
```

**How to find these values:**

- **AZURE_SEARCH_ENDPOINT:** Azure Portal → Your Search Service → Overview → "URL"
- **AZURE_SEARCH_INDEX:** Azure Portal → Your Search Service → Indexes → (pick your index)
- **AZURE_SEARCH_KEY:** Azure Portal → Your Search Service → Keys
- **AZURE_OPENAI_ENDPOINT:** Azure Portal → Your OpenAI Resource → Overview → "Endpoint"
- **AZURE_OPENAI_API_KEY:** Azure Portal → Your OpenAI Resource → Keys and Endpoint
- **AZURE_OPENAI_CHAT_DEPLOYMENT_NAME:** Azure Portal → Your OpenAI Resource → Deployments → (pick your deployment name)

---

## 3. Running the Backend

From the `src/backend` directory, run:

```sh
uvicorn main:app --reload
```

- The API will be available at [http://localhost:8000](http://localhost:8000)
- Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 4. How the Backend Connects to Azure OpenAI

- The backend loads your `.env` file using `python-dotenv`.
- When a chat request is received, the backend:
  1. Searches for relevant documents using Azure Cognitive Search.
  2. Prepares a prompt and sends it to Azure OpenAI using the `openai` Python SDK.
  3. Returns the AI-generated response to the frontend.

**Key code snippet:**

```python
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    base_url=os.getenv("AZURE_OPENAI_ENDPOINT")
)

response = client.chat.completions.create(
    model=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"),
    messages=[{"role": "user", "content": "Hello, AI!"}]
)
print(response.choices[0].message.content)
```

---

## 5. Troubleshooting

- **Environment variables are None:**  
  Make sure `.env` exists and `load_dotenv()` is called before accessing variables.
- **API key or endpoint errors:**  
  Double-check your Azure Portal for the correct values.
- **500 errors:**  
  Check backend logs for details.

---

## 6. Useful Links

- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Azure Cognitive Search Documentation](https://learn.microsoft.com/en-us/azure/search/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

\*\*Contact your project admin if you need access to Azure resources or
