"use client"

import { useState, useEffect } from "react"

export function useGuestMode() {
  const [isGuestMode, setIsGuestMode] = useState(false)

  useEffect(() => {
    // Check if guest mode cookie exists
    const cookies = document.cookie.split(";")
    const guestModeCookie = cookies.find((cookie) => cookie.trim().startsWith("guest-mode="))
    setIsGuestMode(guestModeCookie?.includes("true") || false)
  }, [])

  const enableGuestMode = () => {
    document.cookie = "guest-mode=true; path=/; max-age=86400" // 24 hours
    setIsGuestMode(true)
  }

  const disableGuestMode = () => {
    document.cookie = "guest-mode=false; path=/; max-age=0" // Delete cookie
    setIsGuestMode(false)
  }

  return { isGuestMode, enableGuestMode, disableGuestMode }
}
