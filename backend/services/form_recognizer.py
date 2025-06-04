from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
import os

endpoint = os.getenv("AZURE_FORM_RECOGNIZER_ENDPOINT")
key = os.getenv("AZURE_FORM_RECOGNIZER_KEY")

client = DocumentAnalysisClient(endpoint=endpoint, credential=AzureKeyCredential(key))

def analyze_document(file_path: str) -> dict:
    with open(file_path, "rb") as f:
        poller = client.begin_analyze_document("prebuilt-document", f)
        result = poller.result()

    extracted = {}
    for page in result.pages:
        for line in page.lines:
            extracted.setdefault("text", []).append(line.content)

    return extracted
