import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";

export async function GET() {
    try {
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containers = [];
        for await (const container of blobServiceClient.listContainers()) {
            containers.push(container.name);
        }
        return NextResponse.json({ success: true, containers });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to validate storage connection" },
            { status: 500 }
        );
    }
}
