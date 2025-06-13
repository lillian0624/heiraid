"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search, Info } from "lucide-react"
import AzureMap from "./azure-map"

// Sample GeoJSON data with risk levels for Atlanta, GA (Fulton County)
const sampleGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        parcelid: "17 000900010541",
        index_right: 117.0,
        name: "Ridgedale Park",
        address: "123 Peachtree St NE, Atlanta, GA 30303",
        ownerren_1: 44.46,
        vacant_v_1: 12.54,
        unitsins_1: 71.36,
        homevalue_: 644531.0,
        populati_1: 2178.0,
        gender_med: 75.8,
        householdt: 1046.0,
        households: 7.46,
        housinguni: 1196.0,
        educationa: 1.94,
        raceandh_3: 9.78,
        hispanic_1: 6.47,
        risk_level: "High",
        risk_score: 0.82,
        value: 1450000,
        details: "High flood risk due to proximity to Peachtree Creek",
        neigh_risk_score: 5
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-84.354007064226906, 33.851207593395202],
            [-84.3542385587902, 33.851209518032697],
            [-84.3542240066879, 33.8518122650149],
            [-84.353992536491901, 33.851809871462699],
            [-84.354007064226906, 33.851207593395202]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        parcelid: "17 000900010541",
        index_right: 117.0,
        name: "Ridgedale Park",
        address: "123 Peachtree St NE, Atlanta, GA 30303",
        ownerren_1: 44.46,
        vacant_v_1: 12.54,
        unitsins_1: 71.36,
        homevalue_: 644531.0,
        populati_1: 2178.0,
        gender_med: 75.8,
        householdt: 1046.0,
        households: 7.46,
        housinguni: 1196.0,
        educationa: 1.94,
        raceandh_3: 9.78,
        hispanic_1: 6.47,
        risk_level: "High",
        neigh_risk_score: 5,
        risk_score: 0.82,
        value: 1450000,
        details: "High flood risk due to proximity to Peachtree Creek",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-84.354007064226906, 33.851207593395202],
            [-84.3542385587902, 33.851209518032697],
            [-84.3542240066879, 33.8518122650149],
            [-84.353992536491901, 33.851809871462699],
            [-84.354007064226906, 33.851207593395202]
          ]
        ]
      }
    },

  ]
};

export function RiskMap() {
  const [selectedCounty, setSelectedCounty] = useState("");
  const [riskType, setRiskType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Filter GeoJSON data based on selected filters
  const filteredGeoJson = useMemo(() => {
    if (!selectedCounty && !riskType && !searchQuery) return sampleGeoJson;

    return {
      ...sampleGeoJson,
      features: sampleGeoJson.features.filter(feature => {
        const matchesCounty = !selectedCounty ||
          (selectedCounty === "fulton" && feature.properties.address.includes("Fulton"));

        const matchesRisk =
          riskType === "all" ||
          (riskType === "flood" && feature.properties.risk_level === "High") ||
          (riskType === "fire" && feature.properties.risk_level === "Medium") ||
          (riskType === "earthquake" && feature.properties.risk_level === "Low");

        const matchesSearch = !searchQuery ||
          feature.properties.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feature.properties.address.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCounty && matchesRisk && matchesSearch;
      })
    };
  }, [selectedCounty, riskType, searchQuery]);

  const handleFeatureClick = useCallback((feature: any) => {
    setSelectedProperty(feature);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is handled by the filteredGeoJson dependency on searchQuery
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Property Risk Map</h1>
        <p className="text-gray-600">Visualize property risks and assessments across different regions.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Filter Panel */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6 sticky top-24">
            <div className="flex items-center mb-6">
              <Filter className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">County</label>
                <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                  <SelectTrigger className="glass border-white/30">
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fulton">Fulton</SelectItem>
                    <SelectItem value="clayton">Clayton</SelectItem>
                    <SelectItem value="douglas">Douglas</SelectItem>
                    <SelectItem value="dekalb">DeKalb</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Risk Type</label>
                <Select value={riskType} onValueChange={setRiskType}>
                  <SelectTrigger className="glass border-white/30">
                    <SelectValue placeholder="All risk types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="flood">Flood Risk</SelectItem>
                    <SelectItem value="fire">Fire Risk</SelectItem>
                    <SelectItem value="earthquake">Earthquake Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Input
                    placeholder="Search by address or name..."
                    className="glass border-white/30 pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 mt-4">
                <h3 className="text-sm font-medium mb-2">Risk Legend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-[#FF4D4F] rounded-sm mr-2"></span>
                    <span>High Risk</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-[#FAAD14] rounded-sm mr-2"></span>
                    <span>Medium Risk</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-[#52C41A] rounded-sm mr-2"></span>
                    <span>Low Risk</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Map Area */}
        <div className="lg:col-span-9">
          <div className="glass-card overflow-hidden h-[600px] relative">
            <AzureMap
              geoJsonData={filteredGeoJson}
              onFeatureClick={handleFeatureClick}
              center={[-84.3880, 33.7490]}
              zoom={11}
            />
          </div>

          {/* Property Details Panel */}
          {selectedProperty && (
            <div className="glass-card mt-6 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">Neighborhood: {selectedProperty.properties.name}</h3>
                  <p className="text-gray-400 text-sm">Address: {selectedProperty.properties.address}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${selectedProperty.properties.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                  selectedProperty.properties.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                  {selectedProperty.properties.risk_level} Risk
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Neighborhood Risk Score</p>
                  <p className="font-medium">
                    {(selectedProperty.properties.neigh_risk_score / 9 * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Property Value</p>
                  <p className="font-medium">
                    ${selectedProperty.properties.value.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Vacant Housing Units %</p>
                  <p className="font-medium">
                    {selectedProperty.properties.vacant_v_1}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Housing Units (50+ units) %</p>
                  <p className="font-medium">
                    {selectedProperty.properties.unitsins_1}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Median Home Value</p>
                  <p className="font-medium">
                    {selectedProperty.properties.homevalue_}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Population</p>
                  <p className="font-medium">
                    {selectedProperty.properties.populati_1}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Median Age</p>
                  <p className="font-medium">
                    {selectedProperty.properties.gender_med}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Median Household Income</p>
                  <p className="font-medium">
                    {selectedProperty.properties.householdt}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Households Below Poverty</p>
                  <p className="font-medium">
                    {selectedProperty.properties.households}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Housing Units</p>
                  <p className="font-medium">
                    {selectedProperty.properties.housinguni}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Black Population %</p>
                  <p className="font-medium">
                    {selectedProperty.properties.raceandh_3}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hispanic Population %</p>
                  <p className="font-medium">
                    {selectedProperty.properties.hispanic_1}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" className="mt-4">
                <Info className="h-4 w-4 mr-2" />
                View Full Report
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
