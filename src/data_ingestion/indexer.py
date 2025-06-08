# src/data_ingestion/indexers.py

import logging
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SearchField,
    SearchFieldDataType,
    SimpleField,
    CorsOptions,
    ScoringProfile,
    TextWeights,
    BM25Similarity,
    VectorSearch,
    VectorSearchAlgorithmConfiguration,
    HnswAlgorithmConfiguration,
    SearchSuggester
)

logger = logging.getLogger(__name__)

def create_or_update_search_index(search_index_client: SearchIndexClient, index_name: str, subscription_id: str):
    """
    Creates or updates an Azure Cognitive Search index with the defined schema.
    
    Args:
        search_index_client: The SearchIndexClient instance.
        index_name: The name of the search index.
        subscription_id: The Azure Subscription ID, used for constructing Private DNS Zone ID.
    """
    logger.info(f"Checking for or creating search index: {index_name}")

    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True, filterable=True, retrievable=True, sortable=True),
        SearchField(name="filename", type=SearchFieldDataType.String, filterable=True, retrievable=True, sortable=True),
        SearchField(name="filepath", type=SearchFieldDataType.String, retrievable=True), # Original path in blob storage
        SearchField(name="document_type", type=SearchFieldDataType.String, filterable=True, retrievable=True),
        SearchField(name="content", type=SearchFieldDataType.String, searchable=True, retrievable=True, analyzer_name="en.microsoft"), # Main document content
        SearchField(name="summary", type=SearchFieldDataType.String, searchable=True, retrievable=True, analyzer_name="en.microsoft"),
        SearchField(name="legal_category", type=SearchFieldDataType.String, filterable=True, retrievable=True),
        SearchField(name="tax_redemption_period_days", type=SearchFieldDataType.Int32, filterable=True, retrievable=True, facetable=True),
        SearchField(name="effective_date", type=SearchFieldDataType.DateTimeOffset, filterable=True, retrievable=True, sortable=True),
        
        # RBAC FIELDS - CRITICAL FOR FILTERING
        SearchField(name="owner_id", type=SearchFieldDataType.String, filterable=True, retrievable=True, facetable=True),
        SearchField(name="case_id", type=SearchFieldDataType.String, filterable=True, retrievable=True, facetable=True),
        SearchField(name="allowed_roles", type=SearchFieldDataType.Collection(SearchFieldDataType.String), filterable=True, retrievable=True), # e.g., ["client", "admin"]
        
        # FIELDS FOR VECTOR SEARCH (RAG)
        SearchField(name="content_vector", type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
                    searchable=True, vector_search_dimensions=1536, vector_search_configuration="default-vector-config"), # Adjust dimensions based on your embedding model (e.g., OpenAI text-embedding-ada-002 is 1536)
    ]

    vector_search = VectorSearch(
        algorithm_configurations=[
            HnswAlgorithmConfiguration(
                name="default-vector-config",
                parameters={"m": 4, "efConstruction": 400, "efSearch": 500, "metric": "cosine"}
            )
        ]
    )

    suggesters = [
        SearchSuggester(name="sg", source_fields=["filename", "content"])
    ]

    scoring_profiles = [
        ScoringProfile(
            name="text_relevance",
            text_weights=TextWeights(weights={"content": 3, "summary": 2, "filename": 1.5})
        )
    ]

    index = SearchIndex(
        name=index_name,
        fields=fields,
        vector_search=vector_search,
        suggesters=suggesters,
        scoring_profiles=scoring_profiles,
        default_scoring_profile="text_relevance",
        cors_options=CorsOptions(allowed_origins=["*"], max_age_in_seconds=300) # Adjust for production
    )

    try:
        search_index_client.create_or_update_index(index)
        logger.info(f"Search index '{index_name}' created or updated successfully.")
    except Exception as e:
        logger.error(f"Failed to create or update search index: {e}")
        raise

def upload_documents_to_search(search_client: SearchClient, documents: list[dict]):
    """
    Uploads a list of documents to the Azure Cognitive Search index.

    Args:
        search_client: The SearchClient instance.
        documents: A list of dictionaries, where each dictionary represents a document.
    """
    logger.info(f"Uploading {len(documents)} documents to Cognitive Search.")
    try:
        result = search_client.upload_documents(documents)
        # Check for successes and failures
        for item in result:
            if item.succeeded:
                logger.info(f"  Document '{item.key}' uploaded successfully.")
            else:
                logger.warning(f"  Failed to upload document '{item.key}': {item.error_message}")
        logger.info("Document upload process completed.")
    except Exception as e:
        logger.error(f"Failed to upload documents to Cognitive Search: {e}")
        raise