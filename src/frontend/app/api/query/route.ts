import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
const apiKey = process.env.AZURE_SEARCH_API_KEY;
const indexName = "heiraid-index";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    // Make sure query is a string
    if (typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Query must be a non-empty string." }, { status: 400 });
    }

    // Azure Cognitive Search expects { search: "..." }
    const searchRes = await axios.post(
      `${endpoint}/indexes/${indexName}/docs/search?api-version=2023-11-01`,
      {
        
        searchFields: "title,section",
        top: 3
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );

    return NextResponse.json({ results: searchRes.data.value });
  } catch (error: any) {
    console.error("Azure Search error:", error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data?.error?.message || "Internal Server Error" }, { status: 500 });
  }
}
