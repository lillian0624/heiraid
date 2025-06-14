"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header"; // Add this import

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);

  const askQuestion = async () => {
    setLoading(true);
    setResponse(null);

    const res = await fetch("/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: question }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error(errorData.error);
      setResponse(null);
      setSources([]);
      setLoading(false);
    } else {
      const data = await res.json();
      setResponse(data.answer);
      setSources(data.sources);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <h1 className="text-2xl font-bold">HeirAid AI Legal Assistant</h1>

          <Textarea
            placeholder="Ask your question about property, probate, or tax issues..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
          />

          <Button onClick={askQuestion} disabled={loading || !question.trim()}>
            {loading ? "Asking..." : "Ask"}
          </Button>

          {response && (
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold mb-2">AI Response:</h2>
                <p className="whitespace-pre-wrap mb-4">{response}</p>
                {Array.isArray(sources) && sources.length > 0 && (
                  <div>
                    <h3 className="font-medium">Sources:</h3>
                    <ul className="list-disc ml-5">
                      {sources.map((src, idx) => (
                        <li key={idx}><strong>{src.title}</strong> ({src.source})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
