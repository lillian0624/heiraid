"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search } from "lucide-react"

export function RiskMap() {
  const [selectedCounty, setSelectedCounty] = useState("")
  const [riskType, setRiskType] = useState("")

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-4">Property Risk Map</h1>
        <p className="text-gray-600">Visualize inheritance risks and property assessments across different regions.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filter Panel */}
        <div className="lg:col-span-1">
          <div className="glass-card">
            <div className="flex items-center mb-6">
              <Filter className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">County</label>
                <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                  <SelectTrigger className="glass border-white/30">
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="los-angeles">Los Angeles</SelectItem>
                    <SelectItem value="orange">Orange County</SelectItem>
                    <SelectItem value="riverside">Riverside</SelectItem>
                    <SelectItem value="san-bernardino">San Bernardino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Risk Type</label>
                <Select value={riskType} onValueChange={setRiskType}>
                  <SelectTrigger className="glass border-white/30">
                    <SelectValue placeholder="Select risk type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flood">Flood Risk</SelectItem>
                    <SelectItem value="fire">Fire Risk</SelectItem>
                    <SelectItem value="earthquake">Earthquake Risk</SelectItem>
                    <SelectItem value="market">Market Volatility</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Search Address</label>
                <div className="relative">
                  <Input placeholder="Enter address..." className="glass border-white/30 pr-10" />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <Button className="w-full glass-button">Apply Filters</Button>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="lg:col-span-3">
          <div className="glass-card h-[600px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Risk Map</h3>
              <p className="text-gray-600 mb-4">Azure Maps integration would be implemented here</p>
              <p className="text-sm text-gray-500">
                This would show property parcels with color-coded risk levels, interactive tooltips, and detailed
                property information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
