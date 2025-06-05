import os
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import UserMessage
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient
import requests
from dotenv import load_dotenv

load_dotenv()

AI_FOUNDRY_ENDPOINT = os.getenv("AZURE_AI_FOUNDRY_ENDPOINT")
AI_FOUNDRY_KEY = os.getenv("AZURE_AI_FOUNDRY_KEY")
FORM_RECOGNIZER_ENDPOINT = os.getenv("AZURE_FORM_RECOGNIZER_ENDPOINT")
FORM_RECOGNIZER_KEY = os.getenv("AZURE_FORM_RECOGNIZER_KEY")
TRANSLATOR_ENDPOINT = os.getenv("AZURE_TRANSLATOR_ENDPOINT")
TRANSLATOR_KEY = os.getenv("AZURE_TRANSLATOR_KEY")
MAPS_KEY = os.getenv("AZURE_MAPS_KEY")

client = ChatCompletionsClient(endpoint=AI_FOUNDRY_ENDPOINT, credential=AzureKeyCredential(AI_FOUNDRY_KEY))
form_client = DocumentAnalysisClient(endpoint=FORM_RECOGNIZER_ENDPOINT, credential=AzureKeyCredential(FORM_RECOGNIZER_KEY))

async def handle_agent_request(query: str, language: str = "en") -> str:
    # Use correct instantiation for UserMessage
    message = UserMessage( content=query)
    response = client.complete(messages=[message])
    result = response.choices[0].message.content or "No response"

    if language != "en":
        result = await translate_text(result, language)
    return result

async def analyze_document(document_url: str) -> dict:
    poller = form_client.begin_analyze_document("prebuilt-document", document_url)
    result = poller.result()
    return result.documents[0].fields if result.documents else {}

async def get_property_map() -> dict:
    # Example: Fetch mock data from City of Atlanta Open Data Hub
    response = requests.get("https://gis.atlantaga.gov/data", params={"key": MAPS_KEY})
    return response.json()  # Process for Azure Maps heatmap

async def translate_text(text: str, target_language: str) -> str:
    url = f"{TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to={target_language}"
    headers = {"Ocp-Apim-Subscription-Key": TRANSLATOR_KEY, "Content-Type": "application/json"}
    payload = [{"Text": text}]
    response = requests.post(url, headers=headers, json=payload)
    return response.json()[0]["translations"][0]["text"]