"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration."
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in."
      case "Verification":
        return "The verification token has expired or has already been used."
      default:
        return "An error occurred during authentication."
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Error</h1>
          <p className="text-gray-600">{getErrorMessage(error)}</p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full glass-button text-blue-600">
            <Link href="/auth/signin">Try Again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go Home</Link>
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: "rgba(254, 243, 199, 0.8)" }}>
            <p className="text-sm text-yellow-800">
              <strong>Development Error:</strong> {error || "Unknown error"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
