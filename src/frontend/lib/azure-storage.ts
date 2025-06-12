import { BlobServiceClient } from "@azure/storage-blob";

export async function listContainers() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    const containers: string[] = [];
    for await (const container of blobServiceClient.listContainers()) {
        containers.push(container.name);
    }
    return containers;
}

export async function listBlobs(containerName: string) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobs: string[] = [];
    for await (const blob of containerClient.listBlobsFlat()) {
        blobs.push(blob.name);
    }
    return blobs;
}
