import { Header } from "@/components/layout/header"
import { DocumentsGrid } from "@/components/documents/documents-grid"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <DocumentsGrid />
        </main>
      </div>
    </ProtectedRoute>
  )
}
