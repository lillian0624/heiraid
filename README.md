
# HeirAid: Property Law Chat App with Azure OpenAI + Azure AI Search

HeirAid helps you get legal insights on inheritance, heir property, quiet title actions, and estate administration in Georgia. It uses the RAG (Retrieval Augmented Generation) pattern with Azure OpenAI and Azure AI Search to provide chat and Q&A experiences over your own uploaded legal documents.

## Features

- Natural language chat over estate, probate, and property law documents
- Cited answers with source documents
- Upload your own legal paperwork or property files
- Supports structured and scanned PDFs, Word docs, etc.
- Uses Azure AI Search for vector and keyword retrieval
- Optionally supports GPT-4 Vision for annotated documents
- Speech support and access control (optional)

### Architecture

![Architecture](docs/images/appcomponents.png)

## Prerequisites

To run or deploy HeirAid:

- Azure subscription ([create free](https://azure.microsoft.com/free))
- Permissions to create:
  - Azure OpenAI
  - Azure AI Search
  - Azure Blob Storage
  - Azure Container Apps
  - Optionally: Document Intelligence and Cosmos DB

> See `docs/deploy_lowcost.md` if using a student subscription or minimizing cost.

## Getting Started (Local or Azure Cloud)

### Local environment

1. Install the required tools:

    - [Azure Developer CLI](https://aka.ms/azure-dev/install)
    - [Python 3.9, 3.10, or 3.11](https://www.python.org/downloads/)
      - **Important**: Python and the pip package manager must be in the path in Windows for the setup scripts to work.
      - **Important**: Ensure you can run `python --version` from console. On Ubuntu, you might need to run `sudo apt install python-is-python3` to link `python` to `python3`.
    - [Node.js 20+](https://nodejs.org/download/)
    - [Git](https://git-scm.com/downloads)
    - [Powershell 7+ (pwsh)](https://github.com/powershell/powershell) - For Windows users only.
      - **Important**: Ensure you can run `pwsh.exe` from a PowerShell terminal. If this fails, you likely need to upgrade PowerShell.

2. Create a new folder and switch to it in the terminal.
3. Run this command to download the project code:

    ```shell
    azd init -t azure-search-openai-demo
    ```

    *Note that this command will initialize a git repository, so you do not need to clone this repository*



This will provision all services and index the documents in the `./data` folder.

> ⚠️ Be aware: Azure AI Search and OpenAI incur costs as soon as they are provisioned.

## Deploying

The steps below will provision Azure resources and deploy the application code to Azure Container Apps. To deploy to Azure App Service instead, follow [the app service deployment guide](docs/azure_app_service.md).

1. Login to your Azure account:

    ```shell
    azd auth login
    ```

    For GitHub Codespaces users, if the previous command fails, try:

   ```shell
    azd auth login --use-device-code
    ```

2. Create a new azd environment:

    ```shell
    azd env new
    ```

    Enter a name that will be used for the resource group.
    This will create a new folder in the `.azure` folder, and set it as the active environment for any calls to `azd` going forward.

3. (Optional) This is the point where you can customize the deployment by setting environment variables, in order to [use existing resources](docs/deploy_existing.md), [enable optional features (such as auth or vision)](docs/deploy_features.md), or [deploy low-cost options](docs/deploy_lowcost.md), or [deploy with the Azure free trial](docs/deploy_freetrial.md).
    - [Azure Developer CLI](https://aka.ms/azure-dev/install)
    - [Python 3.9, 3.10, or 3.11](https://www.python.org/downloads/)
      - **Important**: Python and the pip package manager must be in the path in Windows for the setup scripts to work.
      - **Important**: Ensure you can run `python --version` from console. On Ubuntu, you might need to run `sudo apt install python-is-python3` to link `python` to `python3`.
    - [Enabling authentication](docs/login_and_acl.md)
    - [Enabling login and document level access control](docs/login_and_acl.md)
    - [Enabling user document upload](docs/deploy_features.md#enabling-user-document-upload)
    - [Enabling client-side chat history](docs/deploy_features.md#enabling-client-side-chat-history)
    - [Enabling persistent chat history with Azure Cosmos DB](docs/deploy_features.md#enabling-persistent-chat-history-with-azure-cosmos-db)
    - [Enabling language picker](docs/deploy_features.md#enabling-language-picker)
    - [Enabling speech input/output](docs/deploy_features.md#enabling-speech-inputoutput)
    - [Using different chat completion models (Default is gpt-4.1)](docs/deploy_features.md#changing-chat-completion-model)
    - [Using different embedding models (Default is `text-embedding-3-large`)](docs/deploy_features.md#changing-embedding-model)
    - [Enabling Integrated Vectorization](docs/data_ingestion.md#overview-of-integrated-vectorization)
    - [Enabling query rewriting](docs/query_rewriting.md)
    - [Using local parsers](docs/data_ingestion.md#using-local-parsers-for-document-extraction)

4. Run `azd up` - This will provision Azure resources and deploy this sample to those resources, including building the search index based on the files found in the `./data` folder.
    - **Important**: Beware that the resources created by this command will incur immediate costs, primarily from the AI Search resource. These resources may accrue costs even if you interrupt the command before it is fully executed. You can run `azd down` or delete the resources manually to avoid unnecessary spending.
    - You will be prompted to select two locations, one for the majority of resources and one for the OpenAI resource, which is currently a short list. That location list is based on the [OpenAI model availability table](https://learn.microsoft.com/azure/cognitive-services/openai/concepts/models#model-summary-table-and-region-availability) and may become outdated as availability changes.
1. After the application has been successfully deployed you will see a URL printed to the console.  Click that URL to interact with the application in your browser.
It will look like the following:

!['Output from running azd up'](docs/images/endpoint.png)

> NOTE: It may take 5-10 minutes after you see 'SUCCESS' for the application to be fully deployed. If you see a "Python Developer" welcome screen or an error page, then wait a bit and refresh the page.

### Deploying again

If you've only changed the backend/frontend code in the `app` folder, then you don't need to re-provision the Azure resources. You can just run:

```shell
azd deploy
```

If you've changed the infrastructure files (`infra` folder or `azure.yaml`), then you'll need to re-provision the Azure resources. You can do that by running:

```shell
azd up
```

## Running the development server

You can only run a development server locally **after** having successfully run the `azd up` command. If you haven't yet, follow the [deploying](#deploying) steps above.

1. Run `azd auth login` if you have not logged in recently.
2. Start the server:

  Windows:

  ```shell
  ./app/start.ps1
  ```

  Linux/Mac:

  ```shell
  ./app/start.sh
  ```

  VS Code: Run the "VS Code Task: Start App" task.

It's also possible to enable hotloading or the VS Code debugger.
See more tips in [the local development guide](docs/localdev.md).

## Using the App

* Once deployed, visit the app URL printed in the terminal.
* Upload documents related to estate or property law in Georgia.
* Use the chat interface to ask questions like:

  * "How do I transfer title if my father died without a will in Fulton County?"
  * "What is a quiet title action?"
  * "How do I evict tenants if the landlord is deceased?"

## Clean Up

When done:

```bash
azd down
```

This deletes all resources.

## Documentation

See the `docs/` folder for:

* Troubleshooting
* Using Vision and Speech
* Adding access control with Microsoft Entra
* Customizing prompts and retrieval
* Using Cosmos DB for chat history
* Deploying with minimal cost

## Support

This is an open-source demo maintained by contributors and not an official Microsoft product. Post issues in [GitHub Issues](https://github.com/your-repo/issues).

---

> Disclaimer: This application provides information for educational use only and does not constitute legal advice. Consult a licensed attorney for professional guidance.

```
