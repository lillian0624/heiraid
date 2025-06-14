# src/backend/services/cognitive_search_service.py
from dotenv import load_dotenv
load_dotenv()

import os
import logging
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential

logger = logging.getLogger(__name__)

class CognitiveSearchService:
    def __init__(self, endpoint=None, index_name=None, credential=None):
        # Use provided values or fall back to environment variables
        self.endpoint = endpoint or os.getenv("AZURE_SEARCH_ENDPOINT")
        self.index_name = index_name or os.getenv("AZURE_SEARCH_INDEX")
        self.credential = credential or os.getenv("AZURE_SEARCH_KEY")
        logger.debug(f"Initializing SearchClient with endpoint: {self.endpoint}, index: {self.index_name}")

        self.search_client = SearchClient(
            endpoint=self.endpoint,
            index_name=self.index_name,
            credential=AzureKeyCredential(self.credential)
        )

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

    def search_documents(self, query, top=5, user_context=None):
        """
        Search documents in Azure Cognitive Search index.
        :param query: The search query string.
        :param top: Number of top results to return.
        :param user_context: Optional user context for RBAC or filtering.
        :return: List of documents matching the query.
        """
        try:
            search_results = self.search_client.search(
                search_text=query,
                top=top,
                select=["id", "title", "section", "source", "content"]
            )
            docs = []
            for result in search_results:
                doc = {
                    "id": result.get("id"),
                    "title": result.get("title"),
                    "section": result.get("section"),
                    "source": result.get("source"),
                    "content": result.get("content"),
                }
                docs.append(doc)
            return docs
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Error searching documents: {e}", exc_info=True)
            return []