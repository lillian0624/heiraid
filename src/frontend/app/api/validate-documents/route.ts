import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
const apiKey = process.env.AZURE_SEARCH_API_KEY;
const indexName = "heiraid-index"; // Update if your index name differs

export async function POST(req: NextRequest) {
    const { query } = await req.json();

    // Only include searchable fields
    const searchBody = {
        search: query,
        searchFields: "title,section", // Removed 'source'
        top: 5
    };

    try {
        const searchRes = await axios.post(
            `${endpoint}/indexes/${indexName}/docs/search?api-version=2023-11-01`,
            searchBody,
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": apiKey,
                },
            }
        );

        return NextResponse.json({ results: searchRes.data.value });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}