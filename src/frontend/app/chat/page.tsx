"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Configuration, OpenAIApi } from "openai";  


export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [storageStatus, setStorageStatus] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [validationLoading, setValidationLoading] = useState(false);

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

  const validateStorage = async () => {
    setStorageStatus("Checking...");
    const res = await fetch("/api/validate-storage");
    if (!res.ok) {
      const errorData = await res.json();
      console.error(errorData.error);
      setStorageStatus(null);
    } else {
      const data = await res.json();
      if (data.success) {
        setStorageStatus(`Connected! Containers: ${data.containers.join(", ")}`);
      } else {
        setStorageStatus(`Error: ${data.error}`);
      }
    }
  };

  const validateDocuments = async () => {
    setValidationLoading(true);
    setValidationResults([]);
    try {
      const res = await fetch("/api/validate-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error(errorData.error);
        setValidationResults([]);
      } else {
        const data = await res.json();
        setValidationResults(data.results || []);
      }
    } catch (err) {
      setValidationResults([]);
    }
    setValidationLoading(false);
  };

  return (
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

      <Button onClick={validateStorage}>Validate Azure Storage</Button>
      {storageStatus && <div>{storageStatus}</div>}

      <Button onClick={validateDocuments} disabled={validationLoading || !question.trim()}>
        {validationLoading ? "Validating..." : "Validation"}
      </Button>

      {response && (
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-2">AI Response:</h2>
            <p className="whitespace-pre-wrap mb-4">{response}</p>
            {sources.length > 0 && (
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

      {validationResults.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-2">Validation Results:</h2>
            <ul className="list-disc ml-5">
              {validationResults.map((doc, idx) => (
                <li key={idx}>
                  <strong>{doc.title}</strong> ({doc.section}, {doc.source})
                  <div className="text-sm text-gray-600">{doc.content?.slice(0, 200)}...</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
