# src/backend/services/cognitive_search_service.py
import os
import logging
from azure.search.documents import SearchClient
from azure.identity import DefaultAzureCredential

logger = logging.getLogger(__name__)

class CognitiveSearchService:
    def __init__(self, endpoint: str, index_name: str):
        credential = DefaultAzureCredential() # Using DefaultAzureCredential for service-to-service auth
        self.search_client = SearchClient(endpoint=endpoint, index_name=index_name, credential=credential)
        logger.info(f"Initialized Cognitive Search client for index: {index_name}")

    def build_rbac_filter(self, user_context: dict) -> str:
        """
        Builds an OData filter string based on the user's roles, owner_id, and case_id.
        """
        user_roles = user_context.get("roles", [])
        user_id = user_context.get("user_id") # This would be the user's object ID from Azure AD B2C

        filters = []

        # Always allow access for 'admin' role, regardless of document-specific tags
        if "admin" in user_roles:
            return None # No filter needed for admins, they see everything

        # Filter by allowed_roles: document's allowed_roles must contain one of the user's roles
        role_filters = []
        for role in user_roles:
            role_filters.append(f"allowed_roles/any(r: r eq '{role}')")
        if role_filters:
            filters.append(f"({' or '.join(role_filters)})")

        # Filter by owner_id and case_id (if the user is associated with a specific owner/case)
        # This requires a mapping between Azure AD user_id and owner_id/case_id in your system.
        # Example: A user_id might be linked to specific cases or properties they manage/own.
        # This is complex and depends on how you model user-to-data relationships.

        # Placeholder: If the user is linked to a specific owner_id in your system
        # (e.g., from a database lookup based on user_id)
        # specific_owner_ids = get_owner_ids_for_user(user_id) # Hypothetical function
        # if specific_owner_ids:
        #     owner_filters = [f"owner_id eq '{oid}'" for oid in specific_owner_ids]
        #     filters.append(f"({' or '.join(owner_filters)})")

        # Placeholder: If the user is linked to a specific case_id in your system
        # specific_case_ids = get_case_ids_for_user(user_id) # Hypothetical function
        # if specific_case_ids:
        #     case_filters = [f"case_id eq '{cid}'" for cid in specific_case_ids]
        #     filters.append(f"({' or '.join(case_filters)})")

        if not filters:
            # If no roles or specific associations are found, restrict access
            logger.warning(f"No valid RBAC filters generated for user: {user_id}. Restricting access.")
            return "id eq 'no_access'" # Effectively returns no results

        return " and ".join(filters)

    def search_documents(self, query: str, user_context: dict, top: int = 10):
        """
        Searches documents in Cognitive Search with RBAC filtering.
        """
        filter_query = self.build_rbac_filter(user_context)

        # If using vector search (RAG)
        # You'd generate embeddings for the query here
        # query_vector = generate_embedding(query) # Hypothetical function

        try:
            results = self.search_client.search(
                search_text=query,
                filter=filter_query,
                top=top,
                # vector=query_vector, # Uncomment for vector search
                # query_type="semantic", # Or "full", depending on your query strategy
                # semantic_configuration_name="my-semantic-config", # If using semantic search
                select=["id", "filename", "summary", "filepath", "document_type", "legal_category"] # Fields to return
            )
            return [doc for doc in results]
        except Exception as e:
            logger.error(f"Error searching Cognitive Search: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Search failed")