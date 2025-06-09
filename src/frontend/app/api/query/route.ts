import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const cookieStore = cookies()
    const isGuestMode = cookieStore.get("guest-mode")?.value === "true"

    // Allow access if user is authenticated or in guest mode
    if (!session && !isGuestMode) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Simulate AI response - replace with actual AI service call
    let response = `AI Response to: "${message}". This is a simulated response for the HeirAid legal assistant. I can help you with inheritance law, estate planning, and legal document analysis.`

    // Add a note for guest users
    if (!session && isGuestMode) {
      response +=
        "\n\nNote: You're using HeirAid in guest mode. Sign in for personalized assistance and to save your chat history."
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
