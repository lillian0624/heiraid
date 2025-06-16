<!--
---
name: RAG chat with document security
description: This guide demonstrates how to add an optional login and document level access control system to a RAG chat app for your domain data. This system can be used to restrict access to indexed data to specific users.
languages:
- python
- typescript
- bicep
- azdeveloper
products:
- azure-openai
- azure-cognitive-search
- azure-app-service
- azure
page_type: sample
urlFragment: azure-search-openai-demo-document-security
---
-->

# RAG chat: Setting up optional login and document level access control

[📺 Watch: (RAG Deep Dive series) Login and access control](https://www.youtube.com/watch?v=GwEiYJgM8Vw)

The [azure-search-openai-demo](/) project can set up a full RAG chat app on Azure AI Search and OpenAI so that you can chat on custom data, like internal enterprise data or domain-specific knowledge sets. For full instructions on setting up the project, consult the [main README](/README.md), and then return here for detailed instructions on configuring login and access control.

## Table of Contents

- [Requirements](#requirements)
- [Setting up Microsoft Entra applications](#setting-up-microsoft-entra-applications)
  - [Automatic Setup](#automatic-setup)
  - [Troubleshooting](#troubleshooting)
- [Adding data with document level access control](#adding-data-with-document-level-access-control)
  - [Using the Add Documents API](#using-the-add-documents-api)
  - [Azure Data Lake Storage Gen2 and prepdocs](#azure-data-lake-storage-gen2-setup)
- [Environment variables reference](#environment-variables-reference)
  - [Authentication behavior by environment](#authentication-behavior-by-environment)

This guide demonstrates how to add an optional login and document level access control system to the sample. This system can be used to restrict access to indexed data to specific users based on what [Microsoft Entra groups](https://learn.microsoft.com/entra/fundamentals/how-to-manage-groups) they are a part of, or their [user object id](https://learn.microsoft.com/partner-center/find-ids-and-domain-names#find-the-user-object-id).

![AppLoginArchitecture](/docs/images/applogincomponents.png)

## Requirements

**IMPORTANT:** In order to add optional login and document level access control, you'll need the following in addition to the normal sample requirements

- **Azure account permissions**: Your Azure account must have [permission to manage applications in Microsoft Entra](https://learn.microsoft.com/entra/identity/role-based-access-control/permissions-reference#cloud-application-administrator).

## Setting up Microsoft Entra applications

Two Microsoft Entra applications must be registered in order to make the optional login and document level access control system work correctly. One app is for the client UI. The client UI is implemented as a [single page application](https://learn.microsoft.com/entra/identity-platform/scenario-spa-app-registration). The other app is for the API server. The API server uses a [confidential client](https://learn.microsoft.com/entra/identity-platform/msal-client-applications) to call the [Microsoft Graph API](https://learn.microsoft.com/graph/use-the-api).

### Automatic Setup

The easiest way to setup the two apps is to use the `azd` CLI. We've written scripts that will automatically create the two apps and configure them for use with the sample. To trigger the automatic setup, run the following commands:

1. **Enable authentication for the app**
  Run the following command to show the login UI and use Entra authentication by default:

    ```shell
    azd env set AZURE_USE_AUTHENTICATION true
    ```

1. **Enable access control on your search index**

    - **If the index does not exist yet:**
      Run the `prepdocs` script.

    - **If the index already exists:**
      Execute this command to enable ACLs:

      ```shell
      python ./scripts/manageacl.py --acl-action enable_acls
      ```

1. **Enforce access control**
  To ensure that the app restricts search results to only documents that the user has access to, run the following command:

    ```shell
    azd env set AZURE_ENFORCE_ACCESS_CONTROL true
    ```

1. **Allow global document access**
  To allow users to search on documents that have no access controls assigned, even when access control is required, run the following command:

    ```shell
    azd env set AZURE_ENABLE_GLOBAL_DOCUMENT_ACCESS true
    ```

1. **Allow unauthenticated access**
  To allow unauthenticated users to use the app, even when access control is enforced, run the following command:

    ```shell
    azd env set AZURE_ENABLE_UNAUTHENTICATED_ACCESS true
    ```

    Note: These users will not be able to search on documents that have access control assigned, so `AZURE_ENABLE_GLOBAL_DOCUMENT_ACCESS` should also be set to true to give them access to the remaining documents.

1. **Set the authentication tenant ID** Go to Azure portal Microsoft Entra ID: Overview
  Specify the tenant ID associated with authentication by running:

    ```shell
    azd env set AZURE_AUTH_TENANT_ID <YOUR-TENANT-ID>
    ```

1. **Login to the authentication tenant (if needed)**
  If your auth tenant ID is different from your currently logged in tenant ID, run:

    ```shell
    azd auth login --tenant-id <YOUR-TENANT-ID>
    ```

1. **Deploy the app**
  Finally, run the following command to provision and deploy the app:

    ```shell
    azd up
    ```

### Troubleshooting

- If your primary tenant restricts the ability to create Entra applications, you'll need to use a separate tenant to create the Entra applications. You can create a new tenant by following [these instructions](https://learn.microsoft.com/entra/identity-platform/quickstart-create-new-tenant). Then run `azd env set AZURE_AUTH_TENANT_ID <YOUR-AUTH-TENANT-ID>` before running `azd up`.
- If any Entra apps need to be recreated, you can avoid redeploying the app by [changing the app settings in the portal](https://learn.microsoft.com/azure/app-service/configure-common?tabs=portal#configure-app-settings). Any of the [required environment variables](#environment-variables-reference) can be changed. Once the environment variables have been changed, restart the web app.
- It's possible a consent dialog will not appear when you log into the app for the first time. If this consent dialog doesn't appear, you will be unable to use the security filters because the API server app does not have permission to read your authorization information. A consent dialog can be forced to appear by adding `"prompt": "consent"` to the `loginRequest` property in [`authentication.py`](/app/backend/core/authentication.py)
- It's possible that your tenant admin has placed a restriction on consent to apps with [unverified publishers](https://learn.microsoft.com/entra/identity-platform/publisher-verification-overview). In this case, only admins may consent to the client and server apps, and normal user accounts are unable to use the login system until the admin consents on behalf of the entire organization.
- It's possible that your tenant admin requires [admin approval of all new apps](https://learn.microsoft.com/entra/identity/enterprise-apps/manage-consent-requests). Regardless of whether you select the delegated or admin permissions, the app will not work without tenant admin consent. See this guide for [granting consent to an app](https://learn.microsoft.com/entra/identity/enterprise-apps/grant-admin-consent?pivots=portal).

## Adding data with document level access control

The sample supports strategy for adding data with document level access control.

- [Using prepdocs and Azure Data Lake Storage Gen 2](#azure-data-lake-storage-gen2-setup). Sample scripts are provided which set up an [Azure Data Lake Storage Gen 2](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-introduction) account, set the [access control information](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-access-control) on files and folders stored there, and ingest those documents into the search index with their  access control information.

### Azure Data Lake Storage Gen2 Setup

[Azure Data Lake Storage Gen2](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-introduction) implements an [access control model](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-access-control) that can be used for document level access control. The [adlsgen2setup.py](/scripts/adlsgen2setup.py) script uploads the sample data included in the [data](./data) folder to a Data Lake Storage Gen2 storage account. The [Storage Blob Data Owner](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-access-control-model#role-based-access-control-azure-rbac) role is required to use the script.

In order to use this script, an existing Data Lake Storage Gen2 storage account is required. Run `azd env set AZURE_ADLS_GEN2_STORAGE_ACCOUNT <your-storage-account>` prior to running the script.

Then run the script inside your Python environment:

```shell
python /scripts/adlsgen2setup.py './data/*' --data-access-control './scripts/sampleacls.json' -v
```

The script performs the following steps:

- Creates example [groups](https://learn.microsoft.com/entra/fundamentals/how-to-manage-groups) listed in the [sampleacls.json](/scripts/sampleacls.json) file.
- Creates a filesystem / container `gptkbcontainer` in the storage account.
- Creates the directories listed in the [sampleacls.json](/scripts/sampleacls.json) file.
- Uploads the sample PDFs referenced in the [sampleacls.json](/scripts/sampleacls.json) file into the appropriate directories.
- [Recursively sets Access Control Lists (ACLs)](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-acl-cli) using the information from the [sampleacls.json](/scripts/sampleacls.json) file.

In order to use the sample access control, you need to join these groups in your Microsoft Entra tenant.

Note that this optional script may not work in Codespaces if your administrator has applied a [Conditional Access policy](https://learn.microsoft.com/entra/identity/conditional-access/overview) to your tenant.

#### Azure Data Lake Storage Gen2 Prep Docs

Once a Data Lake Storage Gen2 storage account has been setup with sample data and access control lists, [prepdocs.py](/app/backend/prepdocs.py) can be used to automatically process PDFs in the storage account and store them with their [access control lists in the search index](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-access-control).

To run this script with a Data Lake Storage Gen2 account, first set the following environment variables:

- `AZURE_ADLS_GEN2_STORAGE_ACCOUNT`: Name of existing [Data Lake Storage Gen2 storage account](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-introduction).
- (Optional) `AZURE_ADLS_GEN2_FILESYSTEM`: Name of existing Data Lake Storage Gen2 filesystem / container in the storage account. If empty, `gptkbcontainer` is used.
- (Optional) `AZURE_ADLS_GEN2_FILESYSTEM_PATH`: Specific path in the Data Lake Storage Gen2 filesystem / container to process. Only PDFs contained in this path will be processed.

Once the environment variables are set, run the script using the following command: `/scripts/prepdocs.ps1` or `/scripts/prepdocs.sh`.

## Environment variables reference

The following environment variables are used to setup the optional login and document level access control:

- `AZURE_USE_AUTHENTICATION`: Enables Entra ID login and document level access control. Set to true before running `azd up`.
- `AZURE_ENFORCE_ACCESS_CONTROL`: Enforces Entra ID based login and document level access control on documents with access control assigned. Set to true before running `azd up`. If `AZURE_ENFORCE_ACCESS_CONTROL` is enabled and `AZURE_ENABLE_UNAUTHENTICATED_ACCESS` is not enabled, then authentication is required to use the app.
- `AZURE_ENABLE_GLOBAL_DOCUMENT_ACCESS`: Allows users to search on documents that have no access controls assigned
- `AZURE_ENABLE_UNAUTHENTICATED_ACCESS`: Allows unauthenticated users to access the chat app, even when `AZURE_ENFORCE_ACCESS_CONTROL` is enabled. `AZURE_ENABLE_GLOBAL_DOCUMENT_ACCESS` should be set to true to allow unauthenticated users to search on documents that have no access control assigned. Unauthenticated users cannot search on documents with access control assigned.
- `AZURE_DISABLE_APP_SERVICES_AUTHENTICATION`: Disables [use of built-in authentication for App Services](https://learn.microsoft.com/azure/app-service/overview-authentication-authorization). An authentication flow based on the MSAL SDKs is used instead. Useful when you want to provide programmatic access to the chat endpoints with authentication.
- `AZURE_SERVER_APP_ID`: (Required) Application ID of the Microsoft Entra app for the API server.
- `AZURE_SERVER_APP_SECRET`: [Client secret](https://learn.microsoft.com/entra/identity-platform/v2-oauth2-client-creds-grant-flow) used by the API server to authenticate using the Microsoft Entra server app.
- `AZURE_CLIENT_APP_ID`: Application ID of the Microsoft Entra app for the client UI.
- `AZURE_AUTH_TENANT_ID`: [Tenant ID](https://learn.microsoft.com/entra/fundamentals/how-to-find-tenant) associated with the Microsoft Entra tenant used for login and document level access control. Defaults to `AZURE_TENANT_ID` if not defined.
- `AZURE_ADLS_GEN2_STORAGE_ACCOUNT`: (Optional) Name of existing [Data Lake Storage Gen2 storage account](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-introduction) for storing sample data with [access control lists](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-access-control). Only used with the optional Data Lake Storage Gen2 [setup](#azure-data-lake-storage-gen2-setup) and [prep docs](#azure-data-lake-storage-gen2-prep-docs) scripts.
- `AZURE_ADLS_GEN2_FILESYSTEM`: (Optional) Name of existing [Data Lake Storage Gen2 filesystem](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-introduction) for storing sample data with [access control lists](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-access-control). Only used with the optional Data Lake Storage Gen2 [setup](#azure-data-lake-storage-gen2-setup) and [prep docs](#azure-data-lake-storage-gen2-prep-docs) scripts.
- `AZURE_ADLS_GEN2_FILESYSTEM_PATH`: (Optional) Name of existing path in a [Data Lake Storage Gen2 filesystem](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-introduction) for storing sample data with [access control lists](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-access-control). Only used with the optional Data Lake Storage Gen2 [prep docs](#azure-data-lake-storage-gen2-prep-docs) script.

### Authentication behavior by environment

This application uses an in-memory token cache. User sessions are only available in memory while the application is running. When the application server is restarted, all users will need to log-in again.

The following table describes the impact of the `AZURE_USE_AUTHENTICATION` and `AZURE_ENFORCE_ACCESS_CONTROL` variables depending on the environment you are deploying the application in:

| AZURE_USE_AUTHENTICATION | AZURE_ENFORCE_ACCESS_CONTROL | Environment | Default Behavior |
|-|-|-|-|
| True | False | App Services | Use integrated auth <br /> Login page blocks access to app <br /> User can opt-into access control in developer settings <br /> Allows unrestricted access to sources |
| True | True | App Services | Use integrated auth <br /> Login page blocks access to app <br /> User must use access control |
| True | False | Local or Codespaces | Do not use integrated auth <br /> Can use app without login <br /> User can opt-into access control in developer settings <br /> Allows unrestricted access to sources |
| True | True | Local or Codespaces | Do not use integrated auth <br /> Cannot use app without login <br /> Behavior is chat box is greyed out with default “Please login message” <br /> User must use login button to make chat box usable <br /> User must use access control when logged in |
| False | False | All | No login or access control |
| False | True | All | Invalid setting |
