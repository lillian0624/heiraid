"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Shield, LogOut } from "lucide-react"

export function ProfileInfo() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-4">Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="glass-card">
          <h2 className="text-xl font-semibold mb-6">Account Information</h2>

          <div className="flex items-center mb-6">
            <Avatar className="h-20 w-20 mr-4">
              <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
              <AvatarFallback className="text-2xl">
                {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{session.user?.name || "User"}</h3>
              <p className="text-gray-600">{session.user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium">Full Name</p>
                <p className="text-gray-600">{session.user?.name || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium">Email Address</p>
                <p className="text-gray-600">{session.user?.email}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium">Account Type</p>
                <p className="text-gray-600">Professional User</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="glass-card">
          <h2 className="text-xl font-semibold mb-6">Account Actions</h2>

          <div className="space-y-4">
            <div className="p-4 border border-white/20 rounded-lg">
              <h3 className="font-medium mb-2">Assigned Cases</h3>
              <p className="text-gray-600 mb-3">You have access to 3 active cases</p>
              <div className="space-y-2">
                <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded">CASE-2024-001</div>
                <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded">CASE-2024-002</div>
                <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded">CASE-2024-003</div>
              </div>
            </div>

            <div className="p-4 border border-white/20 rounded-lg">
              <h3 className="font-medium mb-2">User Role</h3>
              <p className="text-gray-600">Legal Professional</p>
              <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Verified
              </span>
            </div>

            <Button onClick={() => signOut()} variant="destructive" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
