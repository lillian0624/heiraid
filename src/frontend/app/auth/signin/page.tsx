"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if Azure AD is configured
  const isAzureConfigured = !!(process.env.NEXT_PUBLIC_AZURE_CONFIGURED === "true")

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push("/chat")
      }
    })
  }, [router])

  const handleSignIn = async () => {
    if (!isAzureConfigured) {
      setError("Azure AD is not configured. Please check your environment variables.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const result = await signIn("azure-ad", {
        callbackUrl: "/chat",
        redirect: false,
      })

      if (result?.error) {
        setError("Failed to sign in. Please try again.")
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const continueAsGuest = () => {
    // Set a cookie to enable guest mode
    document.cookie = "guest-mode=true; path=/; max-age=86400" // 24 hours
    router.push("/chat")
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">HeirAid</h1>
          <p className="text-gray-600">Sign in to access your legal assistant</p>
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg flex items-center"
            style={{ backgroundColor: "rgba(254, 226, 226, 0.8)" }}
          >
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {isAzureConfigured && (
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full glass-button text-blue-600 font-semibold"
            >
              {isLoading ? "Signing in..." : "Sign in with Microsoft"}
            </Button>
          )}

          <Button onClick={continueAsGuest} className="w-full glass-button text-gray-600" variant="outline">
            Continue as Guest
          </Button>
        </div>

        {!isAzureConfigured && process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: "rgba(254, 243, 199, 0.8)" }}>
            <p className="text-sm text-yellow-800">
              <strong>Development Mode:</strong> Set up your Azure AD environment variables in .env.local
            </p>
            <ul className="text-xs text-yellow-700 mt-2 space-y-1">
              <li>• AZURE_AD_CLIENT_ID</li>
              <li>• AZURE_AD_CLIENT_SECRET</li>
              <li>• AZURE_AD_TENANT_ID</li>
              <li>• NEXTAUTH_SECRET</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
