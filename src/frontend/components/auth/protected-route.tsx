"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useGuestMode } from "@/hooks/use-guest-mode"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isGuestMode } = useGuestMode()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    // Allow access if user is authenticated or in guest mode
    if (session || isGuestMode) {
      setIsAuthorized(true)
    } else {
      router.push("/auth/signin")
    }
  }, [session, status, router, isGuestMode])

  if (status === "loading" && !isGuestMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthorized && !isGuestMode) {
    return null
  }

  return <>{children}</>
}
