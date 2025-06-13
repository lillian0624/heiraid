'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as atlas from 'azure-maps-control';

interface AzureMapProps {
  center?: [number, number];
  zoom?: number;
  geoJsonData?: any;
  onMapReady?: (map: atlas.Map) => void;
  onFeatureClick?: (feature: any) => void;
}

const AzureMap: React.FC<AzureMapProps> = ({
  center = [-84.3880, 33.7490], // Atlanta, GA coordinates
  zoom = 10,
  geoJsonData,
  onMapReady,
  onFeatureClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<atlas.Map | null>(null);
  const dataSourceRef = useRef<atlas.source.DataSource | null>(null);
  const popupRef = useRef<atlas.Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Function to create popup content with better styling
  const createPopupContent = useCallback((properties: any) => {
    if (!properties) return '';
    
    // Calculate risk level based on score if not provided
    const riskScore = properties.risk_score || 0;
    const riskLevel = properties.risk_level || 
                     riskScore > 0.7 ? 'High' : 
                     riskScore > 0.4 ? 'Medium' : 'Low';
    
    // Format address if available
    const address = properties.address || 'Address not available';
    
    return `
      <div style="padding: 12px; max-width: 250px; font-family: Arial, sans-serif;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">
          Parcel ID: ${properties.parcelid || 'N/A'}
        </h3>
        <div style="font-size: 13px; color: #333;">
          <p style="margin: 4px 0;">
            <span style="font-weight: 500;">Address:</span> ${address}
          </p>
          <p style="margin: 4px 0;">
            <span style="font-weight: 500;">Risk Level:</span> 
            <span style="color: ${
              riskLevel === 'High' ? '#ff4d4f' : 
              riskLevel === 'Medium' ? '#faad14' : '#52c41a'
            };">
              ${riskLevel}
            </span>
          </p>
          <p style="margin: 4px 0;">
            <span style="font-weight: 500;">Risk Score:</span> 
            <span style="font-weight: 600;">
              ${(riskScore * 100).toFixed(1)}%
            </span>
          </p>
          ${properties.details ? `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #f0f0f0;">
              <p style="margin: 0; font-style: italic;">${properties.details}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }, []);

  // Function to calculate bounds from GeoJSON features
  const calculateBounds = useCallback((features: any[]) => {
    if (!features || features.length === 0) return null;

    try {
      const positions = features.flatMap((f: any) => {
        if (f.geometry?.type === 'Polygon') {
          return f.geometry.coordinates[0].map((coord: [number, number]) => 
            new atlas.data.Position(coord[0], coord[1])
          );
        }
        return [];
      });

      if (positions.length > 0) {
        return atlas.data.BoundingBox.fromPositions(positions);
      }
    } catch (error) {
      console.error('Error calculating bounds:', error);
    }
    return null;
  }, []);

  // Function to update the data source with new GeoJSON data
  const updateDataSource = useCallback((map: atlas.Map, data: any) => {
    if (!data || !dataSourceRef.current) return;

    try {
      const features = data.features || [];
      dataSourceRef.current.clear();
      dataSourceRef.current.add(features);

      // Calculate and set the map view to show all features
      const bounds = calculateBounds(features);
      if (bounds) {
        map.setCamera({
          bounds: bounds,
          padding: 50
        });
      }
    } catch (error) {
      console.error('Error updating data source:', error);
    }
  }, [calculateBounds]);

  // Initialize map and data source
  useEffect(() => {
    if (!mapContainer.current) return;

    let isMounted = true;
    let mapInstance: atlas.Map | null = null;

    // Function to initialize the data source and layers
    const initializeDataSourceAndLayers = (map: atlas.Map) => {
      if (!isMounted) return;

      // Create a data source and add it to the map
      const dataSource = new atlas.source.DataSource();
      map.sources.add(dataSource);
      dataSourceRef.current = dataSource;
      
      // Add polygon layer
      const polygonLayer = new atlas.layer.PolygonLayer(dataSource, undefined, {
        fillColor: [
          'match',
          ['get', 'risk_level'],
          'High', '#FF4D4F',
          'Medium', '#FAAD14',
          'Low', '#52C41A',
          '#D9D9D9' // Default color
        ],
        fillOpacity: 0.7,
        strokeColor: '#fff',
        strokeWidth: 1
      });

      // Add symbol layer for labels
      const symbolLayer = new atlas.layer.SymbolLayer(dataSource, undefined, {
        textOptions: {
          textField: ['get', 'name'],
          offset: [0, 0.5],
          color: '#000',
          haloColor: '#fff',
          haloWidth: 1
        }
      });

      // Add layers to the map
      map.layers.add([polygonLayer, symbolLayer]);
      
      // Create popup with better styling
      popupRef.current = new atlas.Popup({
        pixelOffset: [0, -18],
        closeButton: false,
        fillColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: '4px',
        padding: '8px',
        pointerOptions: {
          pointerStyle: 'default'
        },
        closeButtonOffset: [8, 8]
      });
      
      // Add some basic styles for the popup content
      const style = document.createElement('style');
      style.textContent = `
        .atlas-map-popup {
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          border-radius: 4px;
          overflow: hidden;
        }
        .atlas-map-popup-content {
          font-family: Arial, sans-serif;
          line-height: 1.4;
        }
      `;
      document.head.appendChild(style);
      
      // Set map as loaded
      setMapLoaded(true);
      
      // Add hover events for popup with debounce
      let hoverTimeout: NodeJS.Timeout;
      
      const handleMouseMove = (e: any) => {
        if (!e.shapes || e.shapes.length === 0) {
          if (popupRef.current) {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
              if (popupRef.current) {
                popupRef.current.close();
              }
            }, 100);
          }
          return;
        }
        
        clearTimeout(hoverTimeout);
        const shape = e.shapes[0];
        
        if (shape.getProperties) {
          const properties = shape.getProperties();
          const position = e.position;
          
          // Only update if properties exist
          if (Object.keys(properties).length > 0) {
            if (popupRef.current) {
              popupRef.current.setOptions({
                content: createPopupContent(properties),
                position: position
              });
              
              if (!popupRef.current.isOpen()) {
                popupRef.current.open(map);
              }
            }
          }
        }
      };
      
      // Add the event listener
      map.events.add('mousemove', [polygonLayer, symbolLayer], handleMouseMove);
      
      // Close popup when mouse leaves the shape
      map.events.add('mouseout', [polygonLayer, symbolLayer], () => {
        if (popupRef.current) {
          popupRef.current.close();
        }
      });
      
      // Add click event to the layers
      map.events.add('click', [polygonLayer, symbolLayer], (e: any) => {
        if (!e.shapes || e.shapes.length === 0) return;
        
        const shape = e.shapes[0];
        if (shape.getProperties) {
          const properties = shape.getProperties();
          onFeatureClick?.({ properties });
          
          // Show popup on click as well
          if (popupRef.current) {
            popupRef.current.setOptions({
              content: createPopupContent(properties),
              position: e.position
            });
            popupRef.current.open(map);
          }
        }
      });
      
      // Initial data load
      if (geoJsonData) {
        updateDataSource(map, geoJsonData);
      }
      
      // Call the onMapReady callback if provided
      if (onMapReady) {
        onMapReady(map);
      }
    };

    try {
      // Initialize Azure Maps
      mapInstance = new atlas.Map(mapContainer.current, {
        center: center as atlas.data.Position,
        zoom: zoom,
        view: 'Auto',
        authOptions: {
          authType: atlas.AuthenticationType.subscriptionKey,
          subscriptionKey: process.env.NEXT_PUBLIC_AZURE_MAPS_KEY || ''
        },
        style: 'road',
        showFeedbackLink: false,
        showBuildingModels: true
      });

      // Add zoom control
      mapInstance.controls.add([
        new atlas.control.ZoomControl(),
        new atlas.control.StyleControl()
      ], { position: 'top-right' as any });

      // When the map is ready, initialize data source and layers
      mapInstance.events.add('ready', () => {
        if (isMounted) {
          initializeDataSourceAndLayers(mapInstance!);
        }
      });

      // Store the map instance
      mapRef.current = mapInstance;
    } catch (error) {
      console.error('Error initializing Azure Maps:', error);
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (mapInstance) {
        mapInstance.dispose();
        mapRef.current = null;
        dataSourceRef.current = null;
        popupRef.current = null;
      }
    };
  }, [center, zoom, geoJsonData, onMapReady, onFeatureClick, createPopupContent, updateDataSource]);

  // Update data when geoJsonData changes
  useEffect(() => {
    if (mapLoaded && geoJsonData && mapRef.current && dataSourceRef.current) {
      updateDataSource(mapRef.current, geoJsonData);
    }
  }, [geoJsonData, mapLoaded, updateDataSource]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default AzureMap;
