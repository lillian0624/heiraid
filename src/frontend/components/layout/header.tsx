"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, X, User, Settings, LogOut, UserX } from "lucide-react"
import { useGuestMode } from "@/hooks/use-guest-mode"
import { useRouter } from "next/navigation"

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isGuestMode, disableGuestMode } = useGuestMode()
  const router = useRouter()

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Chat", href: "/chat" },
    { name: "Risk Map", href: "/map" },
    { name: "Documents", href: "/documents" },
    { name: "Profile", href: "/profile" },
  ]

  const handleExitGuestMode = () => {
    disableGuestMode()
    router.push("/auth/signin")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold gradient-text">HeirAid</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {status === "loading" && !isGuestMode ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback className="uppercase">
                        {session.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 
                         session.user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user?.name && <p className="font-medium text-gray-800">{session.user.name}</p>}
                      {session.user?.email && (
                        <p className="w-[200px] truncate text-sm text-gray-600">{session.user.email}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center text-gray-700">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()} className="text-gray-700">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isGuestMode ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>G</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-gray-800">Guest User</p>
                      <p className="w-[200px] truncate text-sm text-gray-600">Limited access mode</p>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={handleExitGuestMode} className="text-gray-700">
                    <UserX className="mr-2 h-4 w-4" />
                    Exit Guest Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-gray-700">
                    <Link href="/auth/signin">
                      <User className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="glass-button text-blue-600">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button variant="ghost" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
