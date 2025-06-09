import { Header } from "@/components/layout/header"
import { ProfileInfo } from "@/components/profile/profile-info"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <ProfileInfo />
        </main>
      </div>
    </ProtectedRoute>
  )
}
