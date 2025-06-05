import os
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import UserMessage
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.storage.blob import BlobServiceClient
import requests
from dotenv import load_dotenv

from dotenv import load_dotenv

load_dotenv()
AI_FOUNDRY_ENDPOINT = os.getenv("AZURE_AI_FOUNDRY_ENDPOINT")
AI_FOUNDRY_KEY = os.getenv("AZURE_AI_FOUNDRY_KEY")
FORM_RECOGNIZER_ENDPOINT = os.getenv("AZURE_FORM_RECOGNIZER_ENDPOINT")
FORM_RECOGNIZER_KEY = os.getenv("AZURE_FORM_RECOGNIZER_KEY")
TRANSLATOR_ENDPOINT = os.getenv("AZURE_TRANSLATOR_ENDPOINT")
TRANSLATOR_KEY = os.getenv("AZURE_TRANSLATOR_KEY")
MAPS_KEY = os.getenv("AZURE_MAPS_KEY")
STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
STORAGE_CONTAINER = os.getenv("AZURE_STORAGE_CONTAINER")

client = ChatCompletionsClient(endpoint=AI_FOUNDRY_ENDPOINT, credential=AzureKeyCredential(AI_FOUNDRY_KEY))
form_client = DocumentAnalysisClient(endpoint=FORM_RECOGNIZER_ENDPOINT, credential=AzureKeyCredential(FORM_RECOGNIZER_KEY))
blob_service_client = BlobServiceClient.from_connection_string(STORAGE_CONNECTION_STRING)
container_client = blob_service_client.get_container_client(STORAGE_CONTAINER)

async def handle_agent_request(query: str, language: str = "en") -> str:
    # Use correct instantiation for UserMessage
    message = UserMessage( content=query)
    response = client.complete(messages=[message])
    result = response.choices[0].message.content or "No response"

    if language != "en":
        result = await translate_text(result, language)
    return result

async def upload_document(file_content: bytes, file_name: str) -> str:
    blob_client = container_client.get_blob_client(file_name)
    blob_client.upload_blob(file_content, overwrite=True)
    return blob_client.url

async def analyze_document(file_content: bytes, file_name: str) -> dict:
    # Upload to Blob Storage
    document_url = await upload_document(file_content, file_name)
    # Analyze with Form Recognizer
    poller = form_client.begin_analyze_document("prebuilt-document", document_url)
    result = poller.result()
    fields = result.documents[0].fields if result.documents else {}
     # Store extracted data in Blob Storage as JSON
    extracted_data = {k: v.value for k, v in fields.items()}
    blob_client = container_client.get_blob_client(f"{file_name}_extracted.json")
    blob_client.upload_blob(str(extracted_data), overwrite=True)
    return {"fields": extracted_data, "extracted_data_url": blob_client.url}

async def get_property_map() -> dict:
    # Example: Fetch mock data from City of Atlanta Open Data Hub
    response = requests.get("https://gis.atlantaga.gov/data", params={"key": MAPS_KEY})
    return response.json()  # Process for Azure Maps heatmap

async def get_outreach_suggestions() -> list:
    query = "Suggest privacy-preserving outreach actions for heirs’ property owners."
    response = client.complete(messages=[{"role": "user", "content": query}])
    return response.choices[0].message.content.split("\n") if response.choices[0].message.content else []

async def translate_text(text: str, target_language: str) -> str:
    url = f"{TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to={target_language}"
    headers = {"Ocp-Apim-Subscription-Key": TRANSLATOR_KEY, "Content-Type": "application/json"}
    payload = [{"Text": text}]
    response = requests.post(url, headers=headers, json=payload)
    return response.json()[0]["translations"][0]["text"]