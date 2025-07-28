import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

declare global {
  interface Window {
    google: any;
  }
}

interface AgentMarker {
  agentId: string;
  agentFirstName: string;
  agentLastName: string;
  agentMobile: string;
  latitude: number;
  longitude: number;
  connectionStatus: 'ONLINE' | 'OFFLINE' | 'DISCONNECTED';
  lastUpdate: string;
  batteryLevel?: number;
  isOnline: boolean;
}

interface GoogleMapProps {
  agents: AgentMarker[];
  onAgentClick?: (agent: AgentMarker) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  enableSmoothMovement?: boolean;
  autoFitBounds?: boolean;
  preserveZoom?: boolean;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyCelDo4I5cPQ72TfCTQW-arhPZ7ALNcp8w';

// Map component that renders the actual Google Map
const MapComponent: React.FC<GoogleMapProps> = ({
  agents,
  onAgentClick,
  center = { lat: 28.6139, lng: 77.2090 }, // Default to Delhi (only used if no agents)
  zoom = 10,
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers] = useState<Map<string, any>>(new Map());
  const markersRef = useRef<Map<string, any>>(new Map());
  const [infoWindow, setInfoWindow] = useState<any>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const animationFrameRef = useRef<number | null>(null);






  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map && window.google) {
      // Use provided center if available, otherwise use first agent's location, otherwise default
      let initialCenter = center;
      let initialZoom = zoom;

      if (!center && agents.length > 0 && agents[0].latitude && agents[0].longitude) {
        initialCenter = { lat: agents[0].latitude, lng: agents[0].longitude };
        initialZoom = 15;
      }

      const newMap = new window.google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        // Disable map controls that might interfere with smooth tracking
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
      });

      const newInfoWindow = new window.google.maps.InfoWindow();

      setMap(newMap);
      setInfoWindow(newInfoWindow);
    }
  }, [mapRef, map, center, zoom, agents]);

  // Process agents for marker updates
  const processedAgents = agents.map(agent => ({
    ...agent,
    // Round coordinates to reduce precision-based updates
    latitude: Math.round(agent.latitude * 100000) / 100000,
    longitude: Math.round(agent.longitude * 100000) / 100000
  }));

  // SIMPLIFIED marker management - direct updates without complex state tracking
  useEffect(() => {
    if (!map || !infoWindow) return;

    console.log(`🔄 Processing ${processedAgents.length} agents for markers`);

    processedAgents.forEach(agent => {
      if (!agent.latitude || !agent.longitude) return;

      const position = { lat: agent.latitude, lng: agent.longitude };
      const existingMarker = markersRef.current.get(agent.agentId);

      console.log(`🔍 Agent ${agent.agentId}: existing marker = ${!!existingMarker}`);

      // Choose marker color based on connection status
      let markerColor = '#EF4444'; // Red for offline/disconnected
      if (agent.connectionStatus === 'ONLINE' || agent.isOnline) {
        markerColor = '#10B981'; // Green for online
      }

      // Create custom marker icon
      const markerIcon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: markerColor,
        fillOpacity: 0.8,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        scale: 8
      };

      if (existingMarker) {
        // ✅ UPDATE existing marker - simple and direct
        console.log(`✅ UPDATING existing marker for agent ${agent.agentId}`);

        existingMarker.setPosition(position);
        existingMarker.setIcon(markerIcon);
        existingMarker.setTitle(`${agent.agentFirstName} ${agent.agentLastName} (${agent.connectionStatus})`);

      } else {
        // 🆕 CREATE new marker (first time only)
        console.log(`🆕 CREATING new marker for agent ${agent.agentId}`);

        const marker = new window.google.maps.Marker({
          position,
          map,
          icon: markerIcon,
          title: `${agent.agentFirstName} ${agent.agentLastName} (${agent.connectionStatus})`,
          animation: null
        });

        // Add click listener for info window
        marker.addListener('click', () => {
          const infoContent = `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1F2937;">
                ${agent.agentFirstName} ${agent.agentLastName}
              </h3>
              <div style="font-size: 14px; color: #6B7280; margin-bottom: 4px;">
                📱 ${agent.agentMobile}
              </div>
              <div style="font-size: 14px; color: #6B7280; margin-bottom: 4px;">
                📍 ${agent.latitude.toFixed(6)}, ${agent.longitude.toFixed(6)}
              </div>
              <div style="font-size: 14px; margin-bottom: 4px;">
                Status: <span style="color: ${markerColor}; font-weight: bold;">
                  ${agent.connectionStatus}
                </span>
              </div>
              <div style="font-size: 12px; color: #9CA3AF;">
                Last Update: ${new Date(agent.lastUpdate).toLocaleString()}
              </div>
            </div>
          `;
          infoWindow.setContent(infoContent);
          infoWindow.open(map, marker);

          if (onAgentClick) {
            onAgentClick(agent);
          }
        });

        // Store the new marker directly in the ref
        markersRef.current.set(agent.agentId, marker);
      }
    });
  }, [map, agents, infoWindow, onAgentClick]);

  // Smart bounds fitting - always center on agents, not Delhi
  useEffect(() => {
    const currentMarkers = markersRef.current;
    if (!map || currentMarkers.size === 0 || !window.google) return;

    // Center map on agent locations

    const bounds = new window.google.maps.LatLngBounds();
    let validMarkers = 0;

    currentMarkers.forEach(marker => {
      const position = marker.getPosition();
      if (position) {
        bounds.extend(position);
        validMarkers++;
        // Track marker position for bounds calculation
      }
    });

    if (validMarkers === 1) {
      // If only one marker, center on it with a reasonable zoom
      const marker = Array.from(currentMarkers.values())[0];
      const position = marker.getPosition();
      if (position) {
        // Center on single agent location
        map.setCenter(position);
        map.setZoom(15); // Good zoom level for single agent
      }
    } else if (validMarkers > 1) {
      // If multiple markers, fit all markers in view
      // Fit bounds to show all agents
      map.fitBounds(bounds);

      // Ensure minimum zoom level for readability
      window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom() > 16) {
          map.setZoom(16);
        }
      });
    }

    // Mark initial load as complete
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [map, markers, isInitialLoad]);

  // Handle center changes (for focused agent view)
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
      if (zoom !== map.getZoom()) {
        map.setZoom(zoom);
      }
    }
  }, [map, center, zoom]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return <div ref={mapRef} style={{ height, width: '100%' }} />;
};

// Render function for different loading states
const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading Google Maps...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-96 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-2">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-medium">Failed to load Google Maps</p>
            <p className="text-red-500 dark:text-red-500 text-sm mt-1">Please check your internet connection</p>
          </div>
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Initializing map...</p>
          </div>
        </div>
      );
  }
};

// Main GoogleMap component with wrapper
const GoogleMap: React.FC<GoogleMapProps> = (props) => {
  return (
    <Wrapper apiKey={GOOGLE_MAPS_API_KEY} render={render} libraries={['marker', 'geometry']}>
      <MapComponent {...props} />
    </Wrapper>
  );
};

export default GoogleMap;
