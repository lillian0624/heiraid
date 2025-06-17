import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
const apiKey = process.env.AZURE_SEARCH_API_KEY;
const indexName = "heiraid-index";
const openaiApiKey = process.env.OPENAI_API_KEY; // Or your Azure OpenAI key

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    // Make sure query is a string
    if (typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Query must be a non-empty string." }, { status: 400 });
    }

    // 1. Search Azure Cognitive Search
    const searchRes = await axios.post(
      `${endpoint}/indexes/${indexName}/docs/search?api-version=2023-11-01`,
      { search: query, top: 3 },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );

    const docs = searchRes.data.value.map((doc: any) => doc.content).join("\n---\n");

    // 2. Call Azure OpenAI (or OpenAI API)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4", // or your Azure OpenAI deployment name
        messages: [
          { role: "system", content: "You are a legal assistant helping users resolve property issues." },
          { role: "user", content: `${query}\n\nContext:\n${docs}` }
        ]
      })
    });

    const gptResult = await response.json();

    return NextResponse.json({
      answer: gptResult.choices[0].message.content,
      sources: searchRes.data.value,
    });
  } catch (error: any) {
    console.error("API error:", error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data?.error?.message || "Internal Server Error" }, { status: 500 });
  }
}
