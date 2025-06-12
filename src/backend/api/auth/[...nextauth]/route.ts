import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { AuthOptions } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

const endpoint = process.env.AZURE_SEARCH_ENDPOINT
const apiKey = process.env.AZURE_SEARCH_API_KEY
const indexName = "heiraid-index" // Update if your index name differs

export async function POST(req: NextRequest) {
  const { query } = await req.json()

  // 1. Query Azure Cognitive Search
  const searchRes = await axios.post(
    `${endpoint}/indexes/${indexName}/docs/search?api-version=2023-07-01`,
    { search: query, top: 3 },
    {
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
    }
  )

  const docs = searchRes.data.value.map((doc: any) => doc.content).join("\n---\n")

  // 2. Pass to GPT (OpenAI API)
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a legal assistant helping users resolve property issues." },
        { role: "user", content: `${query}\n\nContext:\n${docs}` }
      ]
    })
  })

  const gptResult = await response.json()

  return NextResponse.json({
    answer: gptResult.choices[0].message.content,
    sources: searchRes.data.value,
  })
}