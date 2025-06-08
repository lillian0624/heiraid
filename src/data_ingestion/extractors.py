# src/data_ingestion/extractors.py

import logging
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.ai.formrecognizer import DocumentAnalysisClient

logger = logging.getLogger(__name__)

def get_blob_list(blob_service_client: BlobServiceClient, container_name: str) -> list[str]:
    """Lists blobs in a specified container."""
    logger.info(f"Listing blobs in container: {container_name}")
    container_client: ContainerClient = blob_service_client.get_container_client(container_name)
    blobs = []
    try:
        for blob in container_client.list_blobs():
            blobs.append(blob.name)
        logger.info(f"Found {len(blobs)} blobs in '{container_name}'.")
        return blobs
    except Exception as e:
        logger.error(f"Failed to list blobs in container '{container_name}': {e}")
        return []

def download_blob_content(blob_service_client: BlobServiceClient, container_name: str, blob_name: str) -> bytes:
    """Downloads the content of a blob."""
    logger.info(f"Downloading blob: {blob_name} from {container_name}")
    blob_client: BlobClient = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
    try:
        download_stream = blob_client.download_blob()
        return download_stream.readall()
    except Exception as e:
        logger.error(f"Failed to download blob '{blob_name}': {e}")
        return None

def extract_text_from_pdf(document_analysis_client: DocumentAnalysisClient, model_id: str, pdf_content: bytes) -> str:
    """Extracts text from PDF content using Document Intelligence."""
    logger.info("Extracting text from PDF using Document Intelligence...")
    try:
        poller = document_analysis_client.begin_analyze_document(model_id, pdf_content)
        result = poller.result()
        full_text = ""
        for page in result.pages:
            if page.lines:
                for line in page.lines:
                    full_text += line.content + "\n"
        logger.info("Text extraction complete.")
        return full_text
    except Exception as e:
        logger.error(f"Failed to extract text from PDF using Document Intelligence: {e}")
        return None

def extract_text_from_txt(text_content: bytes) -> str:
    """Decodes byte content to string for text/CSV files."""
    return text_content.decode('utf-8', errors='ignore') # Added errors='ignore' for robustness