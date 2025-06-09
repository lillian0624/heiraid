"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FileText, Download, Eye } from "lucide-react"

interface Document {
  id: string
  title: string
  caseId: string
  summary: string
  type: string
  date: string
}

const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Estate Planning Will - Johnson Family",
    caseId: "CASE-2024-001",
    summary: "Comprehensive will document outlining asset distribution and beneficiary designations.",
    type: "Will",
    date: "2024-01-15",
  },
  {
    id: "2",
    title: "Trust Agreement - Smith Estate",
    caseId: "CASE-2024-002",
    summary: "Revocable living trust with detailed provisions for property management.",
    type: "Trust",
    date: "2024-01-10",
  },
  {
    id: "3",
    title: "Power of Attorney - Davis Family",
    caseId: "CASE-2024-003",
    summary: "Durable power of attorney for financial and healthcare decisions.",
    type: "POA",
    date: "2024-01-08",
  },
]

export function DocumentsGrid() {
  const [searchTerm, setSearchTerm] = useState("")
  const [documents] = useState<Document[]>(mockDocuments)

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.caseId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-4">Legal Documents</h1>
        <p className="text-gray-600">Manage and analyze your legal documents with AI-powered insights.</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass border-white/30 pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => (
          <div key={document.id} className="glass-card hover:scale-105 transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
              <FileText className="h-8 w-8 text-blue-500" />
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{document.type}</span>
            </div>

            <h3 className="font-semibold mb-2">{document.title}</h3>
            <p className="text-sm text-gray-600 mb-2">Case ID: {document.caseId}</p>
            <p className="text-sm text-gray-600 mb-4">{document.summary}</p>
            <p className="text-xs text-gray-500 mb-4">Last updated: {document.date}</p>

            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1 glass-button">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline" className="flex-1 glass-button">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">Try adjusting your search terms or upload new documents.</p>
        </div>
      )}
    </div>
  )
}
