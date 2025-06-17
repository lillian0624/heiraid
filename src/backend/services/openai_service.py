# src/backend/services/openai_service.py
import os
import logging
from openai import AzureOpenAI
from typing import List, Dict
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self, openai_endpoint: str, openai_api_key: str, deployment_name: str, api_version: str = "2024-02-15-preview"):
        print("DEBUG: openai_endpoint =", openai_endpoint)
        print("DEBUG: openai_api_key =", openai_api_key)
        print("DEBUG: deployment_name =", deployment_name)
        print("DEBUG: api_version =", api_version)
        self.client = AzureOpenAI(
            api_key=openai_api_key,
            azure_endpoint=openai_endpoint,
            api_version="2024-12-01-preview"
        )
        self.deployment_name = deployment_name
        logger.info(f"Initialized Azure OpenAI client for deployment: {deployment_name}")

    def get_chat_completion(self, messages: List[Dict[str, str]], temperature: float = 0.7, max_tokens: int = 800) -> str:
        """
        Gets a chat completion from the Azure OpenAI model.
        """
        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,  # Use deployment name for Azure OpenAI
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error calling Azure OpenAI: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="AI service failed")

    def get_embedding(self, text: str) -> List[float]:
        """
        Gets an embedding for the given text.
        (Used for RAG query embedding if not done on ingestion side)
        """
        try:
            response = self.client.embeddings.create(
                model="text-embedding-ada-002",  # Your embedding model deployment name
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Embedding generation failed")