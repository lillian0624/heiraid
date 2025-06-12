import { NextRequest, NextResponse } from "next/server";
import { listBlobs } from "@/lib/azure-storage";

export async function POST(req: NextRequest) {
    try {
        const { containerName } = await req.json();
        const blobs = await listBlobs(containerName);
        return NextResponse.json({ blobs });
    } catch (error) {
        return NextResponse.json({ error: "Failed to list blobs" }, { status: 500 });
    }
}