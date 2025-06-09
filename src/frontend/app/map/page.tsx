import { Header } from "@/components/layout/header"
import { RiskMap } from "@/components/map/risk-map"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function MapPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <RiskMap />
        </main>
      </div>
    </ProtectedRoute>
  )
}
