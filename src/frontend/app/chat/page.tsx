import { Header } from "@/components/layout/header"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <ChatInterface />
        </main>
      </div>
    </ProtectedRoute>
  )
}
