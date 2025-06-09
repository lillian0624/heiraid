import random
import string
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.cognitiveservices import CognitiveServicesManagementClient
from azure.mgmt.cognitiveservices.models import AccountProperties, Sku
from azure.core.exceptions import ResourceNotFoundError # Import for explicit error checking

# --- Configuration Variables ---
SUBSCRIPTION_ID = os.environ.get("AZURE_SUBSCRIPTION_ID", "<YOUR_AZURE_SUBSCRIPTION_ID>")
LOCATION = os.environ.get("AZURE_LOCATION", "eastus")
RESOURCE_GROUP_NAME = os.environ.get("AZURE_RESOURCE_GROUP_NAME", "heiraid-dev-rg")

# Unique names for AI services (or hardcode if you want specific names)
SEARCH_SERVICE_NAME = "heiraidsearch" + "".join(random.choices(string.ascii_lowercase + string.digits, k=5))
OPENAI_SERVICE_NAME = "heiraidoai" + "".join(random.choices(string.ascii_lowercase + string.digits, k=5))
FORM_RECOGNIZER_SERVICE_NAME = "heiraidfr" + "".join(random.choices(string.ascii_lowercase + string.digits, k=5))

# --- Authentication and Client Setup ---
print("Authenticating to Azure...")
credential = DefaultAzureCredential()
cognitiveservices_client = CognitiveServicesManagementClient(credential, SUBSCRIPTION_ID)
print("Cognitive Services client initialized.")

# --- 1. Create Azure Cognitive Search Service ---
print(f"\nCreating Azure Cognitive Search service: {SEARCH_SERVICE_NAME}...")
search_service = None
try:
    # Check if Search Service already exists
    try:
        search_service = cognitiveservices_client.accounts.get(RESOURCE_GROUP_NAME, SEARCH_SERVICE_NAME)
        print(f"Azure Cognitive Search '{search_service.name}' already exists.")
    except ResourceNotFoundError:
        print(f"Azure Cognitive Search '{SEARCH_SERVICE_NAME}' not found. Creating...")
        search_poller = cognitiveservices_client.accounts.begin_create(
            RESOURCE_GROUP_NAME,
            SEARCH_SERVICE_NAME,
            {
                "location": LOCATION,
                "sku": Sku(name="standard"), # Or "basic", "free" for dev/test. Choose based on scale.
                "kind": "search"
            }
        )
        search_service = search_poller.result()
        print(f"Azure Cognitive Search '{search_service.name}' created. Provisioning state: {search_service.properties.provisioning_state}")
except Exception as e:
    print(f"Error creating/checking Azure Cognitive Search service: {e}")
    exit(1)

# --- 2. Create Azure OpenAI Service ---
print(f"\nCreating Azure OpenAI service: {OPENAI_SERVICE_NAME}...")
openai_service = None
try:
    # Check if OpenAI Service already exists
    try:
        openai_service = cognitiveservices_client.accounts.get(RESOURCE_GROUP_NAME, OPENAI_SERVICE_NAME)
        print(f"Azure OpenAI '{openai_service.name}' already exists.")
    except ResourceNotFoundError:
        print(f"Azure OpenAI '{OPENAI_SERVICE_NAME}' not found. Creating...")
        openai_poller = cognitiveservices_client.accounts.begin_create(
            RESOURCE_GROUP_NAME,
            OPENAI_SERVICE_NAME,
            {
                "location": LOCATION,
                "sku": Sku(name="S0"), # Standard tier for OpenAI
                "kind": "OpenAI",
                "properties": AccountProperties(
                     # You can add network ACLs or Private Endpoint configuration here later
                )
            }
        )
        openai_service = openai_poller.result()
        print(f"Azure OpenAI '{openai_service.name}' created. Provisioning state: {openai_service.properties.provisioning_state}")
    if openai_service:
        print("Remember to deploy models (e.g., gpt-4) within the OpenAI service via Azure Portal or SDK/REST API after creation.")
except Exception as e:
    print(f"Error creating/checking Azure OpenAI service: {e}")
    exit(1)

# --- 3. Create Azure AI Document Intelligence (Form Recognizer) Service ---
print(f"\nCreating Azure AI Document Intelligence service: {FORM_RECOGNIZER_SERVICE_NAME}...")
form_recognizer_service = None
try:
    # Check if Form Recognizer Service already exists
    try:
        form_recognizer_service = cognitiveservices_client.accounts.get(RESOURCE_GROUP_NAME, FORM_RECOGNIZER_SERVICE_NAME)
        print(f"Azure AI Document Intelligence '{form_recognizer_service.name}' already exists.")
    except ResourceNotFoundError:
        print(f"Azure AI Document Intelligence '{FORM_RECOGNIZER_SERVICE_NAME}' not found. Creating...")
        fr_poller = cognitiveservices_client.accounts.begin_create(
            RESOURCE_GROUP_NAME,
            FORM_RECOGNIZER_SERVICE_NAME,
            {
                "location": LOCATION,
                "sku": Sku(name="S0"), # Standard tier for Form Recognizer
                "kind": "FormRecognizer"
            }
        )
        form_recognizer_service = fr_poller.result()
        print(f"Azure AI Document Intelligence '{form_recognizer_service.name}' created. Provisioning state: {form_recognizer_service.properties.provisioning_state}")
except Exception as e:
    print(f"Error creating/checking Azure AI Document Intelligence service: {e}")
    exit(1)

print("\nAI-specific Azure services deployment complete.")