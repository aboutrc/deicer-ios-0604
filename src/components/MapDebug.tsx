import React, { useState, useRef, useEffect } from 'react';
import { Map as MapGL, NavigationControl, GeolocateControl, ViewStateChangeEvent } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapControls from './MapControls';
import { addAlert } from './AlertSystem';
import LocationSearch from './LocationSearch';
import UniversitySelector from './UniversitySelector';
import type { University } from '../lib/universities';
import { supabase, fetchMarkersWithinRadius, testSupabaseConnection, getMarkerImageUrl } from '../lib/supabase';
import type { Marker as MarkerType, MarkerCategory } from '../types';
import { ScanEye, Plus, AlertTriangle, X, Bell, Eye, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { calculateDistance, formatDistance, calculateBearing } from '../lib/distanceUtils';
import Modal from './Modal';
import BottomMenu from './BottomMenu';

const Marker = React.lazy(() => import('react-map-gl/maplibre').then(module => ({ default: module.Marker })));
const Popup = React.lazy(() => import('react-map-gl/maplibre').then(module => ({ default: module.Popup })));

const MAPTILER_KEY = 'SuHEhypMCIOnIZIVbC95';

const DEFAULT_ZOOM = 15.5;
const DEFAULT_CENTER = {
  longitude: -76.13459,
  latitude: 43.03643
};

const MapDebug: React.FC = () => {
  const [viewState, setViewState] = useState({
    longitude: DEFAULT_CENTER.longitude,
    latitude: DEFAULT_CENTER.latitude,
    zoom: DEFAULT_ZOOM,
    pitch: 0,
    bearing: 0
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<{
    zoom: number;
    lat: number;
    lng: number;
    lastMoveTime: number;
    moveCount: number;
  }>({
    zoom: DEFAULT_ZOOM,
    lat: DEFAULT_CENTER.latitude,
    lng: DEFAULT_CENTER.longitude,
    lastMoveTime: Date.now(),
    moveCount: 0
  });
  
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingMarker, setPendingMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MarkerCategory>('ice');
  const [showIceAlert, setShowIceAlert] = useState(false);
  const [iceAlertMessage, setIceAlertMessage] = useState('');
  const [nearestIceMarker, setNearestIceMarker] = useState<MarkerType | null>(null);
  const [markerToPreserve, setMarkerToPreserve] = useState<MarkerType | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean | null>(null);
  
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDryRun, setIsDryRun] = useState(true);
  const [deleteResult, setDeleteResult] = useState<any>(null);
  const [isDeleteAll, setIsDeleteAll] = useState(false);
  const [isDeleteByRadius, setIsDeleteByRadius] = useState(false);
  const [deleteRadius, setDeleteRadius] = useState(1.0);
  const moveCountRef = useRef(0);
  const [debugStats, setDebugStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get user location and fetch initial markers on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setViewState(prev => ({
            ...prev,
            latitude,
            longitude,
            zoom: DEFAULT_ZOOM
          }));
          
          // Check Supabase connection before fetching
          checkConnectionAndFetchMarkers(latitude, longitude);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Could not get your location');
        }
      );
    } 
  }, []);

  // Check Supabase connection and fetch markers
  const checkConnectionAndFetchMarkers = async (lat: number, lng: number) => {
    try {
      const isConnected = await testSupabaseConnection();
      setIsSupabaseConnected(isConnected);
      
      if (isConnected) {
        fetchInitialMarkers(lat, lng);
      } else {
        setError('Database connection failed. Please try again later.');
      }
    } catch (err) {
      console.error('Connection check error:', err);
      setError('Failed to connect to database');
    }
  };

  // Function to fetch markers once on component mount
  const fetchInitialMarkers = async (lat: number, lng: number) => {
    try {
      const { markers: nearbyMarkers } = await fetchMarkersWithinRadius(lat, lng, 50);
      
      if (nearbyMarkers.length > 0) {
        // Find ICE markers
        const iceMarkers = nearbyMarkers.filter(marker => marker.category === 'ice');
        
        setMarkers(nearbyMarkers);
        
        // Show alert for ICE markers if any exist
        if (iceMarkers.length > 0) {
          // Find the closest ICE marker
          let closestMarker = iceMarkers[0];
          let closestDistance = calculateDistance(
            lat, lng, 
            closestMarker.position.lat, closestMarker.position.lng
          );
          
          iceMarkers.forEach(marker => {
            const distance = calculateDistance(
              lat, lng, 
              marker.position.lat, marker.position.lng
            );
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestMarker = marker;
            }
          });
          
          // Convert to miles and format
          const distanceInMiles = closestDistance / 1.60934;
          const formattedDistance = formatDistance(distanceInMiles);
          
          // Get direction
          const direction = calculateBearing(
            lat, lng,
            closestMarker.position.lat, closestMarker.position.lng
          );
          
          // Set alert message and show alert
          const message = `ICE marker detected ${formattedDistance} ${direction ? `to the ${direction}` : 'away'}`;
          setIceAlertMessage(message);
          setNearestIceMarker(closestMarker);
          setMarkerToPreserve(closestMarker);
          setShowIceAlert(true);
          
          // Auto-hide alert after 10 seconds
          if (alertTimeoutRef.current) {
            clearTimeout(alertTimeoutRef.current);
          }
          alertTimeoutRef.current = setTimeout(() => {
            setShowIceAlert(false);
          }, 10000);
        }
      }
    } catch (err) {
      console.error('Error fetching markers:', err);
      setError('Failed to fetch markers');
    }
  };
  
  // Handle map click for adding markers
  const handleMapClick = (e: maplibregl.MapLayerMouseEvent) => {
    if (isAddingMarker) {
      const { lng, lat } = e.lngLat;
      setPendingMarker({ lat, lng });
      setShowCategoryDialog(true);
    }
  };

  // Function to navigate to the nearest ICE marker
  const navigateToIceMarker = () => {
    if (nearestIceMarker && mapRef.current) {
      // Store the marker to preserve it
      setMarkerToPreserve(nearestIceMarker);
      
      // First zoom out to give context
      mapRef.current.flyTo({
        center: [mapRef.current.getCenter().lng, mapRef.current.getCenter().lat],
        zoom: 12,
        duration: 800,
        // When zoom out is complete, then zoom in to the marker
        complete: () => {
          // Set the selected marker to show popup
          setSelectedMarker(nearestIceMarker);
          
          // Then fly to the marker location
          mapRef.current?.flyTo({
            center: [nearestIceMarker.position.lng, nearestIceMarker.position.lat],
            zoom: 16,
            duration: 1200
          });
        }
      });
      
      // Close the alert
      setShowIceAlert(false);
    }
  };

  // Function to manually refresh markers
  const refreshMarkers = async () => {
    try {
      setIsRefreshing(true);
      
      if (!userLocation) {
        addAlert({
          message: "Location not available. Please enable location services.",
          type: 'warning',
          duration: 3000
        });
        setIsRefreshing(false);
        return;
      }
      
      // Fetch markers within radius
      const { markers: nearbyMarkers } = await fetchMarkersWithinRadius(
        userLocation.lat, 
        userLocation.lng, 
        50
      );
      
      if (nearbyMarkers.length > 0) {
        // Update markers state with new data
        setMarkers(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMarkers = nearbyMarkers.filter(m => !existingIds.has(m.id));
          
          if (newMarkers.length > 0) {
            return [...prev, ...newMarkers];
          }
          
          return prev;
        });
      }
      
      // Check for ICE markers
      const iceMarkers = nearbyMarkers.filter(marker => marker.category === 'ice');
      if (iceMarkers.length > 0 && userLocation) {
        // Find the closest ICE marker
        let closestMarker = iceMarkers[0];
        let closestDistance = calculateDistance(
          userLocation.lat, userLocation.lng, 
          closestMarker.position.lat, closestMarker.position.lng
        );
        
        iceMarkers.forEach(marker => {
          const distance = calculateDistance(
            userLocation.lat, userLocation.lng, 
            marker.position.lat, marker.position.lng
          );
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestMarker = marker;
          }
        });
        
        // Convert to miles and format
        const distanceInMiles = closestDistance / 1.60934;
        const formattedDistance = formatDistance(distanceInMiles);
        
        // Get direction
        const direction = calculateBearing(
          userLocation.lat, userLocation.lng,
          closestMarker.position.lat, closestMarker.position.lng
        );
        
        // Set alert message and show alert
        const message = `ICE marker detected ${formattedDistance} ${direction ? `to the ${direction}` : 'away'}`;
        setIceAlertMessage(message);
        setNearestIceMarker(closestMarker);
        setMarkerToPreserve(closestMarker);
        setShowIceAlert(true);
        
        // Auto-hide alert after 10 seconds
        if (alertTimeoutRef.current) {
          clearTimeout(alertTimeoutRef.current);
        }
        alertTimeoutRef.current = setTimeout(() => {
          setShowIceAlert(false);
        }, 10000);
      }
    } catch (err) {
      console.error('Error refreshing markers:', err);
      addAlert({
        message: "Failed to refresh markers",
        type: 'error',
        duration: 5000
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to add a new marker
  const handleAddMarker = async () => {
    if (!pendingMarker) return;
    
    try {
      const { data, error } = await supabase
        .from('pin-markers')
        .insert([
          {
            latitude: pendingMarker.lat,
            longitude: pendingMarker.lng,
            category: selectedCategory,
            title: `${selectedCategory.toUpperCase()} Sighting`,
            description: `${selectedCategory.toUpperCase()} sighting reported by community member`,
            active: true
          }
        ])
        .select();

      if (error) throw error;

      // Add the new marker to the local state
      if (data && data[0]) {
        const newMarker: MarkerType = {
          id: data[0].id,
          position: { lat: data[0].latitude, lng: data[0].longitude },
          category: data[0].category as MarkerCategory,
          createdAt: new Date(data[0].created_at),
          active: data[0].active
        };

        setMarkers(prev => [...prev, newMarker]);
        
        // Show success message
        addAlert({
          message: `${selectedCategory.toUpperCase()} marker added successfully`,
          type: 'success',
          duration: 3000
        });
      }

      // Reset state
      setPendingMarker(null);
      setShowCategoryDialog(false);
      setIsAddingMarker(false);
    } catch (err) {
      console.error('Error adding marker:', err);
      addAlert({
        message: 'Failed to add marker',
        type: 'error',
        duration: 5000
      });
    }
  };

  // Function to clean up old markers
  const cleanupMarkers = async (dryRun = true) => {
    try {
      setIsDeleting(true);
      setError(null);
      setDeleteResult(null);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cleanup-markers`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          days: 1, // Delete markers older than 1 day
          limit: 100, // Limit to 100 markers per operation
          dryRun: dryRun // Whether to actually delete or just simulate
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to cleanup markers: ${response.statusText}`);
      }
      
      const result = await response.json();
      setDeleteResult(result);
      
      if (dryRun) {
        addAlert({
          message: `Dry run completed. Would delete ${result.markers.length} markers.`,
          type: 'info',
          duration: 5000
        });
      } else {
        addAlert({
          message: `Deleted ${result.deletedMarkers.length} markers.`,
          type: 'success',
          duration: 5000
        });
      }
      
      // Refresh marker stats after deletion
      if (!dryRun) {
        await fetchDebugStats();
      }
    } catch (err) {
      console.error('Error during marker cleanup:', err);
      setError(err instanceof Error ? err.message : 'Unknown error during cleanup');
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to delete all markers (not just old ones)
  const deleteAllMarkers = async (dryRun = true) => {
    try {
      setIsDeleting(true);
      setError(null);
      setDeleteResult(null);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-all-markers`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          limit: 1000, // Higher limit to delete more markers at once
          dryRun: dryRun // Whether to actually delete or just simulate
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete markers: ${response.statusText}`);
      }
      
      const result = await response.json();
      setDeleteResult(result);
      
      if (dryRun) {
        addAlert({
          message: `Dry run completed. Would delete ALL ${result.markers.length} markers.`,
          type: 'info',
          duration: 5000
        });
      } else {
        addAlert({
          message: `Deleted ALL ${result.deletedMarkers.length} markers.`,
          type: 'success',
          duration: 5000
        });
        
        // Clear local markers state after successful deletion
        setMarkers([]);
      }
      
      // Refresh marker stats after deletion
      if (!dryRun) {
        await fetchDebugStats();
      }
    } catch (err) {
      console.error('Error during marker deletion:', err);
      setError(err instanceof Error ? err.message : 'Unknown error during deletion');
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to delete markers within radius of current location
  const deleteMarkersByRadius = async (dryRun = true) => {
    try {
      if (!userLocation) {
        addAlert({
          message: "Location not available. Please enable location services.",
          type: 'warning',
          duration: 3000
        });
        return;
      }
      
      setIsDeleting(true);
      setError(null);
      setDeleteResult(null);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-markers-by-radius`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radiusMiles: deleteRadius,
          limit: 1000, // Higher limit to delete more markers at once
          dryRun: dryRun // Whether to actually delete or just simulate
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete markers: ${response.statusText}`);
      }
      
      const result = await response.json();
      setDeleteResult(result);
      
      if (dryRun) {
        addAlert({
          message: `Dry run completed. Would delete ${result.markers.length} markers within ${deleteRadius} miles of your location.`,
          type: 'info',
          duration: 5000
        });
      } else {
        addAlert({
          message: `Deleted ${result.deletedMarkers.length} markers within ${deleteRadius} miles of your location.`,
          type: 'success',
          duration: 5000
        });
        
        // Update local markers state after successful deletion
        if (result.deletedMarkers.length > 0) {
          const deletedIds = new Set(result.deletedMarkers.map((m: any) => m.id));
          setMarkers(prev => prev.filter(marker => !deletedIds.has(marker.id)));
        }
      }
      
      // Refresh marker stats after deletion
      if (!dryRun) {
        await fetchDebugStats();
      }
    } catch (err) {
      console.error('Error during radius-based marker deletion:', err);
      setError(err instanceof Error ? err.message : 'Unknown error during deletion');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle map movement
  const handleMapMove = (evt: ViewStateChangeEvent) => {
    // Skip updates during transitions to avoid jitter
    if (mapRef.current?.isEasing()) {
      return;
    }
    
    // Update view state
    setViewState(evt.viewState);
    
    // Update debug info
    moveCountRef.current += 1;
    setDebugInfo({
      zoom: evt.viewState.zoom,
      lat: evt.viewState.latitude,
      lng: evt.viewState.longitude,
      lastMoveTime: Date.now(),
      moveCount: moveCountRef.current
    });
  };

  // Function to fetch debug statistics
  const fetchDebugStats = async () => {
    try {
      setIsLoadingStats(true);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/debug-markers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch debug stats: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDebugStats(data);
      
      // Log the data for debugging
      console.log('Debug stats:', data);
      
      // Show alert with summary
      if (data.recentMarkers && data.recentMarkers.length > 0) {
        addAlert({
          message: `Found ${data.recentMarkers.length} markers in the last 24 hours`,
          type: 'info',
          duration: 5000
        });
      } else {
        addAlert({
          message: 'No markers found in the last 24 hours',
          type: 'info',
          duration: 3000
        });
      }
    } catch (err) {
      console.error('Error fetching debug stats:', err);
      addAlert({
        message: 'Failed to fetch debug statistics',
        type: 'error',
        duration: 5000
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-screen w-screen relative">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <p className="text-white">Loading map...</p>
        </div>
      )}

      {/* ICE Alert */}
      {showIceAlert && (
        <div className="absolute top-10 left-1/8 transform -translate-x-1/2 z-50 bg-red-900/90 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between max-w-md w-full animate-fade-in">
          <div className="flex items-center flex-1 mr-2 font-medium">
            <Bell size={20} className="mr-2 flex-shrink-0 text-yellow-300" />
            <span className="line-clamp-2">{iceAlertMessage}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={navigateToIceMarker}
              className="p-2 bg-green-600 hover:bg-green-500 rounded-full text-white flex items-center justify-center min-w-[36px] min-h-[36px] transition-colors"
              title="Show Me"
            >
              <Eye size={18} />
            </button>
            <button 
              onClick={() => setShowIceAlert(false)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white flex items-center justify-center min-w-[36px] min-h-[36px] transition-colors" 
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
      
      {/* Debug Info Panel */}
      <div className="absolute top-4 left-4 z-20 bg-black/70 text-white p-4 rounded-lg text-sm font-mono">
        <h3 className="font-bold mb-2">Map Debug Info</h3>
        <div>Zoom: {debugInfo.zoom.toFixed(4)}</div>
        <div>Lat: {debugInfo.lat.toFixed(6)}</div>
        <div>Lng: {debugInfo.lng.toFixed(6)}</div>
        <div className="mt-2 pt-2 border-t border-gray-700">
          <button 
            onClick={fetchDebugStats}
            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center"
            disabled={isLoadingStats}
          >
            {isLoadingStats ? (
              <Loader2 size={12} className="mr-1 animate-spin" />
            ) : (
              <RefreshCw size={12} className="mr-1" />
            )}
            Fetch Marker Stats
          </button>
        </div>
        
        <div className="mt-4 border-t border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-white mb-2">Marker Cleanup</h4>
          <div className="flex items-center mb-2">
            <div className="flex flex-col space-y-2 w-full">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="cleanupOldMarkers"
                  name="cleanupType"
                  checked={!isDeleteAll && !isDeleteByRadius}
                  onChange={() => {
                    setIsDeleteAll(false);
                    setIsDeleteByRadius(false);
                  }}
                  className="mr-2"
                />
                <label htmlFor="cleanupOldMarkers" className="text-gray-300 text-sm">Clean up old markers (24h+)</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="deleteAllMarkers"
                  name="cleanupType"
                  checked={isDeleteAll}
                  onChange={() => {
                    setIsDeleteAll(true);
                    setIsDeleteByRadius(false);
                  }}
                  className="mr-2"
                />
                <label htmlFor="deleteAllMarkers" className="text-gray-300 text-sm">Delete ALL markers</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="deleteByRadius"
                  name="cleanupType"
                  checked={isDeleteByRadius}
                  onChange={() => {
                    setIsDeleteAll(false);
                    setIsDeleteByRadius(true);
                  }}
                  className="mr-2"
                />
                <label htmlFor="deleteByRadius" className="text-gray-300 text-sm">Delete by radius</label>
              </div>
              
              {isDeleteByRadius && (
                <div className="ml-6 mt-1 flex items-center">
                  <label htmlFor="radiusInput" className="text-gray-300 text-xs mr-2">Radius (miles):</label>
                  <input
                    type="number"
                    id="radiusInput"
                    value={deleteRadius}
                    onChange={(e) => setDeleteRadius(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    min="0.1"
                    step="0.1"
                    className="w-16 bg-gray-700 text-white text-xs px-2 py-1 rounded"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="dryRunToggle"
              checked={isDryRun}
              onChange={(e) => setIsDryRun(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="dryRunToggle" className="text-gray-300 text-sm">Dry Run (simulate only)</label>
          </div>
          <button
            onClick={() => {
              if (isDeleteByRadius) {
                deleteMarkersByRadius(isDryRun);
              } else if (isDeleteAll) {
                deleteAllMarkers(isDryRun);
              } else {
                cleanupMarkers(isDryRun);
              }
            }}
            disabled={isDeleting || !isSupabaseConnected}
            className={`px-3 py-1.5 text-white rounded text-sm flex items-center ${
              isDeleting || !isSupabaseConnected ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isDeleting ? (
              <Loader2 size={16} className="mr-1.5 animate-spin" />
            ) : (
              <Trash2 size={16} className="mr-1.5 flex-shrink-0" />
            )}
            {isDeleting ? 'Processing...' : 
             isDryRun ? 'Simulate Cleanup' : 
             isDeleteAll ? 'Delete ALL Markers' : 
             isDeleteByRadius ? `Delete Markers (${deleteRadius} mile radius)` : 
             'Delete Old Markers'}
          </button>
        </div>
        
        {debugStats && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <h4 className="font-bold text-xs mb-1">Last 24h Markers: {debugStats.recentMarkers?.length || 0}</h4>
            {debugStats.categoryCounts?.map((cat: any) => (
              <div key={cat.category} className="text-xs">
                {cat.category}: {cat.last_24h_count} recent / {cat.active_count} active
              </div>
            ))}
          </div>
        )}
      </div>
      
      <MapGL
        {...viewState}
        ref={(ref) => {
          if (ref) {
            mapRef.current = ref.getMap();
          }
        }}
        onMove={handleMapMove}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`}
        mapLib={maplibregl}
        onLoad={() => setMapLoaded(true)}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
        touchZoomRotate={true}
        dragRotate={false}
        touchPitch={false}
        scrollZoom={{
          speed: 0.01,
          smooth: true
        }}
        attributionControl={false}
      >
        <NavigationControl 
          position="top-right" 
          showCompass={false} 
          visualizePitch={false}
        />
        <GeolocateControl
          position="top-right"
          trackUserLocation={true}
          showUserHeading={true}
          showUserLocation={true}
          showAccuracyCircle={true}
          onGeolocate={(e) => {
            setUserLocation({ 
              lat: e.coords.latitude, 
              lng: e.coords.longitude 
            });
          }}
          positionOptions={{
            enableHighAccuracy: true,
            timeout: 6000,
            maximumAge: 0
          }}
        />
        
        {/* Display user location */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></div>
          </Marker>
        )}
        
        {/* Display markers */}
        {markers.map(marker => (
          <Marker
            key={marker.id}
            longitude={marker.position.lng}
            latitude={marker.position.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedMarker(marker);
              
              // If user has location, show distance and direction
              if (userLocation) {
                const distance = calculateDistance(
                  userLocation.lat, userLocation.lng,
                  marker.position.lat, marker.position.lng
                );
                
                const distanceInMiles = distance / 1.60934; // Convert km to miles
                const formattedDistance = formatDistance(distanceInMiles);
                
                const direction = calculateBearing(
                  userLocation.lat, userLocation.lng,
                  marker.position.lat, marker.position.lng
                );
                
                addAlert({
                  message: `This marker is ${formattedDistance} to the ${direction} from your location`,
                  type: 'info',
                  duration: 3000
                });
              }
            }}
          >
            <div 
              className={`relative ${!marker.active ? 'marker-archived' : ''}`}
              data-marker-id={marker.id}
            >
              {marker.category === 'ice' ? (
                <img src="/ice-button.svg" alt="ICE" className="w-9 h-9" />
              ) : (
                <div className="bg-blue-500 p-2 rounded-full">
                  <ScanEye size={20} className="text-white" />
                </div>
              )}
            </div>
          </Marker>
        ))}
        
        {/* Display selected marker popup */}
        {selectedMarker && (
          <Popup
            longitude={selectedMarker.position.lng}
            latitude={selectedMarker.position.lat}
            anchor="top"
            onClose={() => setSelectedMarker(null)}
            className="marker-popup"
            closeButton={true}
            closeOnClick={false}
            maxWidth="300px"
          >
            <div className="bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {selectedMarker.category === 'ice' ? (
                    <img src="/ice-button.svg" alt="ICE" className="w-6 h-6 mr-2" />
                  ) : (
                    <ScanEye size={18} className="text-blue-400 mr-2" />
                  )}
                  <h3 className="text-lg font-semibold">
                    {selectedMarker.category.toUpperCase()}
                  </h3>
                </div>
                {!selectedMarker.active && (
                  <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full">
                    Archived
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-300 mb-3">
                <div className="flex items-center mb-1">
                  <span className="text-gray-400 mr-2">Created:</span>
                  <span>
                    {new Date(selectedMarker.createdAt).toLocaleString()}
                  </span>
                </div>
                
                {/* Add distance and direction information if user location is available */}
                {userLocation && (
                  <div className="flex items-center mt-2 text-blue-300">
                    <span className="mr-2">Distance:</span>
                    <span>
                      {formatDistance(
                        calculateDistance(
                          userLocation.lat, userLocation.lng,
                          selectedMarker.position.lat, selectedMarker.position.lng
                        ) / 1.60934 // Convert km to miles
                      )}
                      {' '}
                      {calculateBearing(
                        userLocation.lat, userLocation.lng,
                        selectedMarker.position.lat, selectedMarker.position.lng
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Popup>
        )}
        {/* Map Controls */}
        <div className="absolute bottom-48 left-4 z-10 flex flex-col gap-2 buttonControls">
          <MapControls
            isAddingMarker={isAddingMarker}
            setIsAddingMarker={setIsAddingMarker}
            isRefreshing={isRefreshing}
            refreshMarkers={refreshMarkers}
            language="en"
          />
        </div>
        
        {/* Hidden components for functionality */}
        <div className="hidden">
          <LocationSearch 
            id="location-search-button"
            onLocationSelect={(lat, lng) => {
              setViewState(prev => ({
                ...prev,
                latitude: lat,
                longitude: lng,
                zoom: 14
              }));
            }}
            language="en"
          />
          
          <UniversitySelector
            id="university-selector-button"
            onSelect={(university: University) => {
              setViewState(prev => ({
                ...prev,
                latitude: university.geofence_coordinates.center.latitude,
                longitude: university.geofence_coordinates.center.longitude,
                zoom: 14
              }));
            }}
            language="en"
          />
        </div>
        
        {/* Bottom Menu */}
        <BottomMenu 
          language="en"
          onAddMarkClick={() => {
            setIsAddingMarker(true);
            addAlert({
              message: 'Click on the map to place a marker',
              type: 'info',
              duration: 5000
            });
          }}
          onRefreshClick={refreshMarkers}
          onSearchClick={() => document.getElementById('location-search-button')?.click()}
          onUniversityClick={() => document.getElementById('university-selector-button')?.click()}
        />
      </MapGL>
    </div>
  );
};

export default MapDebug;