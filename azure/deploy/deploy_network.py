import random
import string
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.network import NetworkManagementClient
from azure.mgmt.network.models import VirtualNetwork, Subnet, AddressSpace, PrivateEndpoint, PrivateLinkServiceConnection, PrivateDnsZoneGroup, PrivateDnsZoneConfig
from azure.mgmt.resource import ResourceManagementClient
from azure.mgmt.storage import StorageManagementClient
from azure.mgmt.cognitiveservices import CognitiveServicesManagementClient
from azure.mgmt.keyvault import KeyVaultManagementClient
from azure.core.exceptions import ResourceNotFoundError # Import for explicit error checking

# --- Configuration Variables ---
SUBSCRIPTION_ID = os.environ.get("AZURE_SUBSCRIPTION_ID", "<YOUR_AZURE_SUBSCRIPTION_ID>")
LOCATION = os.environ.get("AZURE_LOCATION", "eastus")
RESOURCE_GROUP_NAME = os.environ.get("AZURE_RESOURCE_GROUP_NAME", "heiraid-dev-rg")

VNET_NAME = "heiraid-vnet"
SUBNET_NAME = "app-subnet"
VNET_ADDRESS_PREFIXES = ["10.0.0.0/16"]
SUBNET_ADDRESS_PREFIX = "10.0.0.0/24" # /24 provides 256 IPs, sufficient for many apps

# --- Authentication and Client Setup ---
print("Authenticating to Azure...")
credential = DefaultAzureCredential()

network_client = NetworkManagementClient(credential, SUBSCRIPTION_ID)
resource_client = ResourceManagementClient(credential, SUBSCRIPTION_ID) # Needed to get resource IDs
storage_client = StorageManagementClient(credential, SUBSCRIPTION_ID)
cognitiveservices_client = CognitiveServicesManagementClient(credential, SUBSCRIPTION_ID)
keyvault_client = KeyVaultManagementClient(credential, SUBSCRIPTION_ID)

print("Network and other clients initialized.")

# --- Helper function to get existing resource IDs (requires prior deployment of services) ---
def get_resource_id(rg_name, resource_type, resource_name):
    """Fetches the resource ID of an existing Azure resource."""
    try:
        if resource_type == "Microsoft.Storage/storageAccounts":
            resource = storage_client.storage_accounts.get_properties(rg_name, resource_name)
        elif resource_type == "Microsoft.KeyVault/vaults":
            resource = keyvault_client.vaults.get(rg_name, resource_name)
        elif resource_type == "Microsoft.CognitiveServices/accounts": # General check for Cognitive Services
            resource = cognitiveservices_client.accounts.get(rg_name, resource_name)
        else:
            print(f"Warning: Unsupported resource type for ID retrieval: {resource_type}. Skipping.")
            return None
        return resource.id
    except ResourceNotFoundError:
        print(f"Resource {resource_type}/{resource_name} not found. Skipping Private Endpoint creation for it.")
        return None
    except Exception as e:
        print(f"Error fetching ID for {resource_type}/{resource_name}: {e}")
        return None

# --- 1. Create Virtual Network (VNet) ---
print(f"\nCreating Virtual Network: {VNET_NAME} in {RESOURCE_GROUP_NAME}...")
try:
    vnet_poller = network_client.virtual_networks.begin_create_or_update(
        RESOURCE_GROUP_NAME,
        VNET_NAME,
        VirtualNetwork(
            location=LOCATION,
            address_space=AddressSpace(address_prefixes=VNET_ADDRESS_PREFIXES)
        )
    )
    vnet = vnet_poller.result()
    print(f"Virtual Network '{vnet.name}' created/updated.")
except Exception as e:
    print(f"Error creating/updating Virtual Network: {e}")
    exit(1)

# --- 2. Create Subnet ---
print(f"\nCreating Subnet: {SUBNET_NAME} in {VNET_NAME}...")
try:
    subnet_poller = network_client.subnets.begin_create_or_update(
        RESOURCE_GROUP_NAME,
        VNET_NAME,
        SUBNET_NAME,
        Subnet(address_prefix=SUBNET_ADDRESS_PREFIX)
    )
    subnet = subnet_poller.result()
    print(f"Subnet '{subnet.name}' created/updated with ID: {subnet.id}")
except Exception as e:
    print(f"Error creating/updating Subnet: {e}")
    exit(1)

# --- 3. Create Private Endpoints (Highly Recommended for Production) ---
# NOTE: This part requires the AI services and Storage Account to be already deployed
# You will need to replace the placeholder names with the *actual names* of your deployed services.
# You can find these names from the deploy_foundations.py and deploy_ai_services.py outputs,
# or by checking the Azure portal.

# REPLACE THESE WITH YOUR ACTUAL RESOURCE NAMES FROM PREVIOUS DEPLOYMENTS
# Example: If deploy_foundations.py created storage account 'heiraidstgabcde', use that name.
EXISTING_STORAGE_ACCOUNT_NAME = "heiraidstg#####"
EXISTING_KEY_VAULT_NAME = "heiraidkv#####"
EXISTING_SEARCH_SERVICE_NAME = "heiraidsearch#####"
EXISTING_OPENAI_SERVICE_NAME = "heiraidoai#####"
EXISTING_FR_SERVICE_NAME = "heiraidfr#####"


# Function to create a Private Endpoint and link to Private DNS Zone
def create_private_endpoint_and_dns(pe_name, target_resource_id, group_id_name, private_dns_zone_fqdn):
    print(f"\nAttempting to create Private Endpoint '{pe_name}' for {target_resource_id}...")
    try:
        pe_poller = network_client.private_endpoints.begin_create_or_update(
            RESOURCE_GROUP_NAME,
            pe_name,
            PrivateEndpoint(
                location=LOCATION,
                subnet={"id": subnet.id}, # Link to the created subnet
                private_link_service_connections=[
                    PrivateLinkServiceConnection(
                        name=f"{pe_name}-pls-conn",
                        private_link_service_id=target_resource_id,
                        group_ids=[group_id_name] # Specific to each service type
                    )
                ]
            )
        )
        pe = pe_poller.result()
        print(f"Private Endpoint '{pe.name}' created/updated.")

        # Crucial: Link Private Endpoint to Private DNS Zone for name resolution
        # This allows resources in your VNet to resolve the private IP of the service
        private_dns_zone_id = f"/subscriptions/{SUBSCRIPTION_ID}/resourceGroups/{RESOURCE_GROUP_NAME}/providers/Microsoft.Network/privateDnsZones/{private_dns_zone_fqdn}"
        private_dns_zone_group_name = f"{pe_name}-pdns-group" # Name for the group
        print(f"Creating Private DNS Zone Group '{private_dns_zone_group_name}' for Private Endpoint...")

        dns_group_poller = network_client.private_dns_zone_groups.begin_create_or_update(
            RESOURCE_GROUP_NAME,
            pe.name, # Use the PE name here
            private_dns_zone_group_name,
            PrivateDnsZoneGroup(
                private_dns_zone_configs=[
                    PrivateDnsZoneConfig(
                        private_dns_zone_id=private_dns_zone_id # Use the ID of the Private DNS Zone
                    )
                ]
            )
        )
        dns_group_poller.result()
        print(f"Private DNS Zone Group '{private_dns_zone_group_name}' created/updated.")

    except Exception as e:
        print(f"Error creating/updating Private Endpoint or DNS Group for {pe_name}: {e}")


# --- Execute Private Endpoint Creations (only if service names are updated) ---
# Ensure these service names match your actual deployed services for get_resource_id to work
print("\nAttempting to create Private Endpoints for existing services (if names are updated)...")

# Storage Account PE
storage_id = get_resource_id(RESOURCE_GROUP_NAME, "Microsoft.Storage/storageAccounts", EXISTING_STORAGE_ACCOUNT_NAME)
if storage_id:
    create_private_endpoint_and_dns(f"{EXISTING_STORAGE_ACCOUNT_NAME}-pe", storage_id, "blob", "privatelink.blob.core.windows.net")

# Key Vault PE
keyvault_id = get_resource_id(RESOURCE_GROUP_NAME, "Microsoft.KeyVault/vaults", EXISTING_KEY_VAULT_NAME)
if keyvault_id:
    create_private_endpoint_and_dns(f"{EXISTING_KEY_VAULT_NAME}-pe", keyvault_id, "vault", "privatelink.vaultcore.azure.net")

# Azure Cognitive Search PE
search_id = get_resource_id(RESOURCE_GROUP_NAME, "Microsoft.CognitiveServices/accounts", EXISTING_SEARCH_SERVICE_NAME)
if search_id:
    create_private_endpoint_and_dns(f"{EXISTING_SEARCH_SERVICE_NAME}-pe", search_id, "search", "privatelink.search.windows.net")

# Azure OpenAI PE
openai_id = get_resource_id(RESOURCE_GROUP_NAME, "Microsoft.CognitiveServices/accounts", EXISTING_OPENAI_SERVICE_NAME)
if openai_id:
    create_private_endpoint_and_dns(f"{EXISTING_OPENAI_SERVICE_NAME}-pe", openai_id, "openai", "privatelink.openai.azure.com")

# Azure AI Document Intelligence (Form Recognizer) PE
fr_id = get_resource_id(RESOURCE_GROUP_NAME, "Microsoft.CognitiveServices/accounts", EXISTING_FR_SERVICE_NAME)
if fr_id:
    # Note: The group_id for Document Intelligence can sometimes be 'formrecognizer' or 'documentintelligence'
    # And the FQDN might be privatelink.cognitiveservices.azure.com or privatelink.appliedai.azure.com
    # depending on how the resource was deployed and specific API versions.
    # It's best to verify this from the Azure portal for your specific resource.
    create_private_endpoint_and_dns(f"{EXISTING_FR_SERVICE_NAME}-pe", fr_id, "documentintelligence", "privatelink.appliedai.azure.com")


print("\nNetwork infrastructure deployment complete (VNet, Subnet, and Private Endpoints if configured).")