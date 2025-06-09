import random
import string
import time
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.resource import ResourceManagementClient
from azure.mgmt.storage import StorageManagementClient
from azure.mgmt.keyvault import KeyVaultManagementClient
from azure.mgmt.monitor import MonitorManagementClient
from azure.mgmt.keyvault.models import VaultProperties, Sku, SkuName, AccessPolicyEntry, Permissions, KeyPermissions, SecretPermissions, VaultCreateOrUpdateParameters
from azure.storage.blob import BlobServiceClient
from azure.core.exceptions import ResourceNotFoundError # Import for explicit error checking

# --- Configuration Variables ---
SUBSCRIPTION_ID = os.environ.get("AZURE_SUBSCRIPTION_ID", "<YOUR_AZURE_SUBSCRIPTION_ID>")
LOCATION = os.environ.get("AZURE_LOCATION", "eastus") # Recommended Azure region (e.g., "eastus", "westeurope")
RESOURCE_GROUP_NAME = os.environ.get("AZURE_RESOURCE_GROUP_NAME", "heiraid-dev-rg")


# Unique names for resources (or hardcode if you want specific names)
STORAGE_ACCOUNT_NAME = "heiraidstg" + "".join(random.choices(string.ascii_lowercase + string.digits, k=5))
KEY_VAULT_NAME = "heiraidkv" + "".join(random.choices(string.ascii_lowercase + string.digits, k=5))
LOG_ANALYTICS_WORKSPACE_NAME = "heiraidlaw" + "".join(random.choices(string.ascii_lowercase + string.digits, k=5))

# Your Azure AD User Object ID for Key Vault access (for development/testing)
# Find it using `az ad signed-in-user show --query id -o tsv`
YOUR_AZURE_AD_USER_OBJECT_ID = "<YOUR_AZURE_AD_USER_OBJECT_ID>"

# --- Authentication and Client Setup ---
print("Authenticating to Azure...")
credential = DefaultAzureCredential()

resource_client = ResourceManagementClient(credential, SUBSCRIPTION_ID)
storage_client = StorageManagementClient(credential, SUBSCRIPTION_ID)
keyvault_client = KeyVaultManagementClient(credential, SUBSCRIPTION_ID)
monitor_client = MonitorManagementClient(credential, SUBSCRIPTION_ID)

print("Azure clients initialized.")

# --- 1. Create Resource Group ---
print(f"\nCreating Resource Group: {RESOURCE_GROUP_NAME} in {LOCATION}...")
resource_group_params = {'location': LOCATION, 'tags': {'resource-type': RESOURCE_GROUP_NAME}}
try:
    resource_group = resource_client.resource_groups.create_or_update(
        RESOURCE_GROUP_NAME,
        resource_group_params
    )
    print(f"Resource Group '{resource_group.name}' created/updated successfully.")
except Exception as e:
    print(f"Error creating Resource Group: {e}")
    exit(1)

# --- 2. Create Storage Account and Blob Containers ---
print(f"\nCreating Storage Account: {STORAGE_ACCOUNT_NAME}...")
storage_account = None
try:
    # Check if storage account already exists
    try:
        storage_account = storage_client.storage_accounts.get_properties(RESOURCE_GROUP_NAME, STORAGE_ACCOUNT_NAME)
        print(f"Storage Account '{storage_account.name}' already exists.")
        
    except ResourceNotFoundError:
        print(f"Storage Account '{STORAGE_ACCOUNT_NAME}' not found. Creating...")
        poller = storage_client.storage_accounts.begin_create(
            RESOURCE_GROUP_NAME,
            STORAGE_ACCOUNT_NAME,
            {
                "location": LOCATION,
                "sku": {"name": "Standard_LRS"}, # Standard_LRS (Locally-Redundant) or Standard_GRS (Geo-Redundant)
                "kind": "StorageV2"
            }
        )
        storage_account = poller.result()
        print(f"Storage Account '{storage_account.name}' created. Provisioning state: {storage_account.provisioning_state}")
        # Wait a bit for the account to be fully ready before getting keys if just created
        time.sleep(10)

    # Proceed with container creation only if storage_account object is valid
    if storage_account:
        # Get connection string for BlobServiceClient
        keys = storage_client.storage_accounts.list_keys(RESOURCE_GROUP_NAME, STORAGE_ACCOUNT_NAME)
        connection_string = f"DefaultEndpointsProtocol=https;AccountName={STORAGE_ACCOUNT_NAME};AccountKey={keys.keys[0].value};EndpointSuffix=core.windows.net"

        blob_service_client = BlobServiceClient.from_connection_string(connection_string)

        # Define containers based on your data types
        container_names = [
            "legal-statutes",
            "gpcsf-forms",
            "tax-data",
            "sensitive-heir-data",
            "processed-data-output" # For output from data processing pipeline
        ]

        print("Creating Blob Containers...")
        for container_name in container_names:
            try:
                blob_service_client.create_container(container_name)
                print(f"  Container '{container_name}' created.")
            except Exception as e:
                # Catch specific errors like "Conflict" (409) if the container already exists
                if "Conflict" in str(e): # Example for specific error string
                    print(f"  Container '{container_name}' already exists. Skipping creation.")
                else:
                    print(f"  Could not create container '{container_name}': {e}")
        print("Storage account and containers readiness check complete.")

except Exception as e:
    print(f"General error during Storage Account or Containers creation/check: {e}")
    exit(1)


# --- 3. Create Azure Key Vault ---
print(f"\nCreating Azure Key Vault: {KEY_VAULT_NAME}...")
key_vault = None
try:
    # Check if Key Vault already exists
    try:
        key_vault = keyvault_client.vaults.get(RESOURCE_GROUP_NAME, KEY_VAULT_NAME)
        print(f"Key Vault '{key_vault.name}' already exists.")
    except ResourceNotFoundError:
        print(f"Key Vault '{KEY_VAULT_NAME}' not found. Creating...")
        # Access policies for Key Vault
        access_policies = []
        if YOUR_AZURE_AD_USER_OBJECT_ID and YOUR_AZURE_AD_USER_OBJECT_ID != "<YOUR_AZURE_AD_USER_OBJECT_ID>":
            access_policies.append(
                AccessPolicyEntry(
                    tenant_id=credential.get_token("https://vault.azure.net/.default").tenant_id,
                    object_id=YOUR_AZURE_AD_USER_OBJECT_ID,
                    permissions=Permissions(
                        keys=[p.value for p in KeyPermissions],
                        secrets=[p.value for p in SecretPermissions]
                    )
                )
            )
        else:
            print("WARNING: YOUR_AZURE_AD_USER_OBJECT_ID not set. Key Vault will be created, but you'll need to manually add access policies to use it.")
            print("Use `az ad signed-in-user show --query id -o tsv` to get your object ID.")

        # Create Key Vault parameters
        vault_params = VaultCreateOrUpdateParameters(
            location=LOCATION,
            properties=VaultProperties(
                tenant_id=credential.get_token("https://vault.azure.net/.default").tenant_id,
                sku=Sku(name=SkuName.STANDARD),
                access_policies=access_policies,
                public_network_access="Enabled", # For demonstration. For production, disable and use Private Endpoints.
                enable_rbac_authorization=False # Use vault access policies for this example
            )
        )

        poller = keyvault_client.vaults.begin_create_or_update(
            RESOURCE_GROUP_NAME,
            KEY_VAULT_NAME,
            vault_params
        )
        key_vault = poller.result()
        print(f"Key Vault '{key_vault.name}' created.")

    if key_vault: # Print URI whether created or existing
        print(f"Key Vault URI: {key_vault.properties.vault_uri}")

except Exception as e:
    print(f"Error creating/checking Key Vault: {e}")
    exit(1)


# --- 4. Create Log Analytics Workspace ---
print(f"\nCreating Log Analytics Workspace: {LOG_ANALYTICS_WORKSPACE_NAME}...")
from azure.mgmt.monitor.models import WorkspaceSku, WorkspaceSkuName
log_analytics_workspace = None
try:
    # Check if Log Analytics Workspace already exists
    try:
        log_analytics_workspace = monitor_client.workspaces.get(RESOURCE_GROUP_NAME, LOG_ANALYTICS_WORKSPACE_NAME)
        print(f"Log Analytics Workspace '{log_analytics_workspace.name}' already exists.")
    except ResourceNotFoundError:
        print(f"Log Analytics Workspace '{LOG_ANALYTICS_WORKSPACE_NAME}' not found. Creating...")
        log_analytics_workspace_params = {
            "location": LOCATION,
            "sku": WorkspaceSku(name=WorkspaceSkuName.PER_GB2018) # Choose an appropriate SKU
        }

        poller = monitor_client.workspaces.begin_create_or_update(
            RESOURCE_GROUP_NAME,
            LOG_ANALYTICS_WORKSPACE_NAME,
            log_analytics_workspace_params
        )
        log_analytics_workspace = poller.result()
        print(f"Log Analytics Workspace '{log_analytics_workspace.name}' created.")

except Exception as e:
    print(f"Error creating/checking Log Analytics Workspace: {e}")
    exit(1)

print("\nFoundational Azure resources deployment complete.")