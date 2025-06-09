# src/data_ingestion/ingest_pipeline.py

import os
import logging
from dotenv import load_dotenv

# Import functions from your new modules
from .extractors import get_blob_list, download_blob_content, extract_text_from_pdf, extract_text_from_txt
from .taggers import enrich_and_tag_document
from .indexer import create_or_update_search_index, upload_documents_to_search
from .utils import initialize_azure_clients # Assuming you move client init here

# Load environment variables
load_dotenv()

# --- Configuration (kept here or moved to a config module if complex) ---
BLOB_STORAGE_ACCOUNT_URL = os.environ.get("BLOB_STORAGE_ACCOUNT_URL")
FORM_RECOGNIZER_ENDPOINT = os.environ.get("FORM_RECOGNIZER_ENDPOINT")
COGNITIVE_SEARCH_ENDPOINT = os.environ.get("COGNITIVE_SEARCH_ENDPOINT")
COGNITIVE_SEARCH_INDEX_NAME = os.environ.get("COGNITIVE_SEARCH_INDEX_NAME", "heiraid-docs")
FORM_RECOGNIZER_MODEL_ID = os.environ.get("FORM_RECOGNIZER_MODEL_ID", "prebuilt-document")

# --- Logger Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Main Ingestion Pipeline Orchestration ---
def run_ingestion_pipeline():
    logger.info("Starting data ingestion pipeline...")

    # Initialize all clients once
    blob_service_client, document_analysis_client, search_index_client, search_client = \
        initialize_azure_clients(
            BLOB_STORAGE_ACCOUNT_URL,
            FORM_RECOGNIZER_ENDPOINT,
            COGNITIVE_SEARCH_ENDPOINT
        )

    # Step 1: Create or Update Search Index
    try:
        create_or_update_search_index(search_index_client, COGNITIVE_SEARCH_INDEX_NAME)
    except Exception as e:
        logger.error(f"Pipeline halted due to index creation failure: {e}")
        return

    # Define the source blob containers (can also be external config)
    source_containers = {
        "legal-statutes": ["ocga_sections.txt"],
        "gpcsf-forms": ["gpcsf_2.pdf", "gpcsf_3.pdf"],
        "tax-data": ["tax_bill_data.csv"],
        "sensitive-heir-data": []
    }
    
    documents_to_index = []

    for container_name, known_files in source_containers.items():
        blobs_in_container = known_files if known_files else get_blob_list(blob_service_client, container_name)
        
        for blob_name in blobs_in_container:
            if not blob_name.lower().endswith(('.pdf', '.txt', '.csv')):
                logger.warning(f"Skipping unsupported file type: {blob_name}")
                continue

            content = download_blob_content(blob_service_client, container_name, blob_name)
            if content is None:
                continue

            extracted_text = None
            if blob_name.lower().endswith('.pdf'):
                extracted_text = extract_text_from_pdf(document_analysis_client, FORM_RECOGNIZER_MODEL_ID, content)
            elif blob_name.lower().endswith(('.txt', '.csv')):
                extracted_text = extract_text_from_txt(content)
            
            if extracted_text:
                # Step 4: Enrich and Tag Document
                enriched_doc = enrich_and_tag_document(blob_name, extracted_text, container_name)
                documents_to_index.append(enriched_doc)
            else:
                logger.warning(f"No text extracted for {blob_name}. Skipping indexing.")

    # Step 5: Upload to Cognitive Search
    if documents_to_index:
        upload_documents_to_search(search_client, documents_to_index)
    else:
        logger.info("No documents to index.")

    logger.info("Data ingestion pipeline completed.")

if __name__ == "__main__":
    run_ingestion_pipeline()