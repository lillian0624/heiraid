"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Plus } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Chat Sessions</h2>
              <Button size="sm" className="glass-button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-white/20 cursor-pointer hover:bg-white/30 transition-colors">
                <p className="font-medium text-sm">Estate Planning Query</p>
                <p className="text-xs text-gray-600">2 hours ago</p>
              </div>
              <div className="p-3 rounded-lg hover:bg-white/20 cursor-pointer transition-colors">
                <p className="font-medium text-sm">Inheritance Tax Question</p>
                <p className="text-xs text-gray-600">Yesterday</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <div className="glass-card h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <h3 className="text-lg font-medium mb-2">Welcome to HeirAid</h3>
                  <p>Ask me anything about inheritance law, estate planning, or legal documents.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === "user" ? "bg-blue-500 text-white" : "glass border border-white/30"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="glass border border-white/30 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/20 p-6">
              <form onSubmit={handleSubmit} className="flex space-x-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your legal question..."
                  className="flex-1 glass border-white/30"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()} className="glass-button">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
