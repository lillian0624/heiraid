"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header"
import { DocumentsGrid } from "@/components/documents/documents-grid"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DocumentsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchDocs = async () => {
    setLoading(true);
    setResults([]);
    const res = await fetch("/api/validate-documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <div className="max-w-2xl mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-bold">Document Search</h1>
            <input
              className="w-full border p-2"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title, section, or source..."
            />
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={searchDocs}
              disabled={loading || !query.trim()}
            >
              {loading ? "Searching..." : "Search"}
            </button>
            <ul className="mt-4 space-y-2">
              {results.map((doc, idx) => (
                <li key={idx} className="border p-2 rounded">
                  <strong>{doc.title}</strong> ({doc.section}, {doc.source})
                  <div className="text-sm text-gray-600">{doc.content?.slice(0, 200)}...</div>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
