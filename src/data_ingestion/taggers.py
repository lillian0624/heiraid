# src/data_ingestion/taggers.py

import logging
# import re # Uncomment if you need regex for more advanced extraction

logger = logging.getLogger(__name__)

# RBAC configuration (example lists, adapt to your actual roles/attributes)
# Default roles for documents that don't have specific restrictions
DEFAULT_ALLOWED_ROLES = ["public", "client", "admin"] 
# Roles for standard legal forms/statutes
STANDARD_LEGAL_ROLES = ["public", "legal_professional"]

def enrich_and_tag_document(filename: str, raw_content_text: str, container_name: str) -> dict:
    """
    Enriches the document with metadata and assigns RBAC tags based on content and source.

    Args:
        filename: The name of the file (e.g., "gpcsf_2.pdf").
        raw_content_text: The extracted text content of the document.
        container_name: The name of the Azure Blob Storage container where the file is located.

    Returns:
        A dictionary containing the enriched document data, ready for Cognitive Search.
    """
    logger.info(f"Enriching and tagging document: {filename} from {container_name}")
    
    # Initialize with defaults for potentially sensitive/case-specific fields
    enriched_data = {
        "id": filename.replace('.', '_').replace('/', '_').lower(), # Unique ID for Cognitive Search
        "filename": filename,
        "filepath": f"azblob://{container_name}/{filename}",
        "document_type": "unknown",
        "content": raw_content_text,
        "summary": raw_content_text[:500] + "..." if len(raw_content_text) > 500 else raw_content_text, # Simple summary
        "legal_category": "general",
        "tax_redemption_period_days": None,
        "effective_date": None,
        "owner_id": None, # Will be None for empty forms, or specific for filled forms
        "case_id": None,   # Will be None for empty forms, or specific for filled forms
        "allowed_roles": list(DEFAULT_ALLOWED_ROLES) # Start with default roles
    }

    # --- CUSTOM ENRICHMENT AND TAGGING LOGIC ---
    # This section needs to be adapted precisely to your data's characteristics
    # and your RBAC requirements.

    if "gpcsf" in filename.lower() and container_name.lower() == "gpcsf-forms":
        enriched_data["document_type"] = "probate_standard_form"
        enriched_data["legal_category"] = "probate_template"
        # For empty standard forms, owner_id and case_id cannot be extracted
        # They remain None, indicating no specific case/owner associated.
        # Access is granted based on the general nature of the document.
        enriched_data["allowed_roles"] = list(STANDARD_LEGAL_ROLES)
        logger.info(f"  Recognized as empty GPCSF form. Assigned type: {enriched_data['document_type']}, roles: {enriched_data['allowed_roles']}")

    elif "ocga_sections" in filename.lower() or "legal-statutes" in container_name.lower():
        enriched_data["document_type"] = "legal_statute"
        enriched_data["legal_category"] = "statute"
        # Statutes are typically public reference documents
        enriched_data["allowed_roles"] = ["public"]
        logger.info(f"  Recognized as legal statute. Assigned type: {enriched_data['document_type']}, roles: {enriched_data['allowed_roles']}")

    elif "tax_bill_data" in filename.lower() or "tax-data" in container_name.lower():
        enriched_data["document_type"] = "tax_record"
        enriched_data["legal_category"] = "tax"
        
        # If these tax data files are *filled* and securely available, 
        # you would implement extraction here for owner_id, case_id, etc.
        # Example (requires 're' import and actual data patterns):
        # if "Property Owner: " in raw_content_text:
        #     owner_match = re.search(r"Property Owner: (.*)", raw_content_text)
        #     if owner_match:
        #         enriched_data["owner_id"] = owner_match.group(1).replace(" ", "_").lower()
        #         # Add specific client role if applicable
        #         enriched_data["allowed_roles"].append(f"client_{enriched_data['owner_id']}")
        
        # For empty/general tax data, keep owner_id/case_id as None and assign general roles
        # Tax records are generally sensitive, so default to more restricted access.
        enriched_data["allowed_roles"] = ["admin", "tax_analyst"] 
        logger.info(f"  Recognized as tax record. Assigned type: {enriched_data['document_type']}, roles: {enriched_data['allowed_roles']}")

    elif "sensitive_heir_data" in container_name.lower():
        enriched_data["document_type"] = "sensitive_heir_filing"
        enriched_data["legal_category"] = "sensitive"
        # For any data in this container, default to highly restricted access.
        # If these are *filled* sensitive forms, you *must* extract `owner_id` and `case_id`
        # securely from the `raw_content_text` here to enable granular access.
        enriched_data["allowed_roles"] = ["admin", "specific_legal_team_heir"] 
        # Example for highly sensitive data:
        # if "Heir Name:" in raw_content_text:
        #     heir_match = re.search(r"Heir Name: (.*)", raw_content_text)
        #     if heir_match:
        #         enriched_data["owner_id"] = heir_match.group(1).replace(" ", "_").lower()
        #         enriched_data["allowed_roles"].append(f"heir_{enriched_data['owner_id']}_specific_access")

        logger.info(f"  Recognized as sensitive heir data. Assigned type: {enriched_data['document_type']}, roles: {enriched_data['allowed_roles']}")

    # --- VECTOR EMBEDDING GENERATION (CRITICAL FOR RAG) ---
    # This section requires integration with an embedding model (e.g., Azure OpenAI)
    # The 'openai' pip package and Azure OpenAI endpoint/key would be needed here.
    # Example using OpenAI API (requires 'openai' pip package and API key to be configured):
    # from openai import OpenAI # This import would be at the top of the file if used
    # client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"), base_url=os.environ.get("AZURE_OPENAI_ENDPOINT"))
    # try:
    #     response = client.embeddings.create(input=raw_content_text, model="text-embedding-ada-002") # Use your deployment name
    #     enriched_data["content_vector"] = response.data[0].embedding
    # except Exception as e:
    #     logger.warning(f"Failed to generate embeddings for {filename}: {e}. Content vector will be placeholder.")
    #     enriched_data["content_vector"] = [0.0] * 1536 # Fallback placeholder if embedding fails

    # Placeholder vector if you haven't set up embedding generation yet:
    enriched_data["content_vector"] = [0.0] * 1536 

    logger.info(f"Document '{filename}' enriched with type: {enriched_data['document_type']}, roles: {enriched_data['allowed_roles']}")
    return enriched_data