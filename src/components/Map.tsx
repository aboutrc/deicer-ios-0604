import React, { useState, useRef, useEffect } from 'react';
import { Map as MapGL, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import { Marker, Popup } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ScanEye, Plus, AlertTriangle, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import LocationSearch from './LocationSearch';
import UniversitySelector from './UniversitySelector';
import BottomMenu from './BottomMenu';
import Modal from './Modal';
import { supabase, fetchMarkersWithinRadius, getMarkerImageUrl } from '../lib/supabase';
import { addAlert } from './AlertSystem';
import type { Marker as MarkerType, MarkerCategory } from '../types';
import { compressImage } from '../lib/imageUtils';

const MAPTILER_KEY = 'SuHEhypMCIOnIZIVbC95';

const DEFAULT_ZOOM = 15.5;
const DEFAULT_CENTER = {
  longitude: -76.13459,
  latitude: 43.03643
};

interface MapViewProps {
  language?: 'en' | 'es' | 'zh' | 'hi' | 'ar';
  selectedUniversity: University | null;
  onUniversitySelect: (university: University) => void;
}

const MapView: React.FC<MapViewProps> = ({ 
  language = 'en', 
  selectedUniversity, 
  onUniversitySelect 
}) => { 
  const [viewState, setViewState] = useState({
    longitude: DEFAULT_CENTER.longitude,
    latitude: DEFAULT_CENTER.latitude,
    zoom: DEFAULT_ZOOM,
    pitch: 0,
    bearing: 0
  });
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [pendingMarker, setPendingMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MarkerCategory>('ice');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processingCategory, setProcessingCategory] = useState<MarkerCategory | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const mapRef = useRef<maplibregl.Map | null>(null);

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
          
          // Initial fetch of markers
          refreshMarkers();
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Could not get your location');
        }
      );
    }
  }, []);

  // Handle map click for adding markers
  const handleMapClick = (e: maplibregl.MapLayerMouseEvent) => {
    if (isAddingMarker) {
      const { lng, lat } = e.lngLat;
      setPendingMarker({ lat, lng });
      setShowCategoryDialog(true);
    }
  };

  // Completely separate functions for each marker type
  const addIceMarker = async () => {
    if (!pendingMarker) return;
    
    // Set the category explicitly
    const markerCategory: MarkerCategory = 'ice';
    setProcessingCategory(markerCategory);
    console.log(`Creating ICE marker at ${pendingMarker.lat}, ${pendingMarker.lng}`);
    
    try {
      setIsUploading(true);
      setError(null);
      
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        try {
          // Compress the image before uploading
          const compressedImage = await compressImage(selectedImage, 1200, 0.7);
          
          // Create a unique filename with timestamp to avoid collisions
          const timestamp = Date.now();
          const safeFileName = selectedImage.name.replace(/[^a-zA-Z0-9.-]/g, '');
          const fileName = `${timestamp}-${safeFileName}`;
          
          // Upload the compressed image
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('pin-markers-images')
            .upload(fileName, compressedImage, {
              contentType: 'image/jpeg', // Force content type to be JPEG
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) {
            console.error('Image upload error:', uploadError);
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }
          
          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('pin-markers-images')
            .getPublicUrl(fileName);
            
          imageUrl = publicUrl;
          console.log('Image uploaded successfully:', imageUrl);
        } catch (imgError) {
          console.error('Image processing error:', imgError);
          throw new Error(`Image processing failed: ${imgError instanceof Error ? imgError.message : 'Unknown error'}`);
        }
      }
      
      // Insert marker into database
      const { data, error } = await supabase
        .from('pin-markers')
        .insert([
          {
            latitude: pendingMarker.lat,
            longitude: pendingMarker.lng,
            category: markerCategory,
            title: `${markerCategory.toUpperCase()} Sighting`,
            description: `${markerCategory.toUpperCase()} sighting reported by community member`,
            image_url: imageUrl,
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
          active: data[0].active,
          imageUrl: data[0].image_url
        };

        setMarkers(prev => [...prev, newMarker]);
        
        // Show success message
        addAlert({
          message: 'Thank you for adding a marker. Please make sure to refresh your screen to see any recent marker updates.',
          type: 'success',
          duration: 5000
        });
      }

      // Reset state only on success (move outside of try/catch)
      setShowCategoryDialog(false);
      setPendingMarker(null);
      setIsAddingMarker(false);
      setSelectedImage(null);
      setImagePreview(null);
      setProcessingCategory(null);
    } catch (err) {
      console.error('Error adding marker:', err);
      addAlert({
        message: 'Failed to add marker',
        type: 'error',
        duration: 5000
      });
      return; // Add return statement to prevent further execution
    } finally {
      setIsUploading(false);
    }
  };

  // Separate function for observer markers
  const addObserverMarker = async () => {
    if (!pendingMarker) return;
    
    // Set the category explicitly
    const markerCategory: MarkerCategory = 'observer';
    setProcessingCategory(markerCategory);
    console.log(`Creating Observer marker at ${pendingMarker.lat}, ${pendingMarker.lng}`);
    
    try {
      setIsUploading(true);
      setError(null);
      
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        try {
          // Compress the image before uploading
          const compressedImage = await compressImage(selectedImage, 1200, 0.7);
          
          // Create a unique filename with timestamp to avoid collisions
          const timestamp = Date.now();
          const safeFileName = selectedImage.name.replace(/[^a-zA-Z0-9.-]/g, '');
          const fileName = `${timestamp}-${safeFileName}`;
          
          // Upload the compressed image
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('pin-markers-images')
            .upload(fileName, compressedImage, {
              contentType: 'image/jpeg', // Force content type to be JPEG
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) {
            console.error('Image upload error:', uploadError);
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }
          
          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('pin-markers-images')
            .getPublicUrl(fileName);
            
          imageUrl = publicUrl;
          console.log('Image uploaded successfully:', imageUrl);
        } catch (imgError) {
          console.error('Image processing error:', imgError);
          throw new Error(`Image processing failed: ${imgError instanceof Error ? imgError.message : 'Unknown error'}`);
        }
      }
      
      // Insert marker into database
      const { data, error } = await supabase
        .from('pin-markers')
        .insert([
          {
            latitude: pendingMarker.lat,
            longitude: pendingMarker.lng,
            category: markerCategory,
            title: `${markerCategory.toUpperCase()} Sighting`,
            description: `${markerCategory.toUpperCase()} sighting reported by community member`,
            image_url: imageUrl,
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
          active: data[0].active,
          imageUrl: data[0].image_url
        };

        setMarkers(prev => [...prev, newMarker]);
        
        // Show success message
        addAlert({
          message: 'Thank you for adding a marker. Please make sure to refresh your screen to see any recent marker updates.',
          type: 'success',
          duration: 5000
        });
      }

      // Reset state only on success (move outside of try/catch)
      setShowCategoryDialog(false);
      setPendingMarker(null);
      setIsAddingMarker(false);
      setSelectedImage(null);
      setImagePreview(null);
      setProcessingCategory(null);
    } catch (err) {
      console.error('Error adding marker:', err);
      addAlert({
        message: 'Failed to add marker',
        type: 'error',
        duration: 5000
      });
      return; // Add return statement to prevent further execution
    } finally {
      setIsUploading(false);
    }
  };

  const refreshMarkers = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      if (!userLocation) {
        addAlert({
          message: 'Unable to get your location',
          type: 'error',
          duration: 3000
        });
        return;
      }
      
      // Fetch markers within radius
      const { markers: nearbyMarkers } = await fetchMarkersWithinRadius(
        userLocation.lat, 
        userLocation.lng, 
        50
      );
      
      setLastFetchTime(Date.now());
      
      if (nearbyMarkers.length > 0) {
        // Replace all markers with new data
        setMarkers(nearbyMarkers);
        addAlert({
          message: `Found ${nearbyMarkers.length} markers in your area`,
          type: 'info',
          duration: 3000
        });
      } else {
        addAlert({
          message: 'No markers found in your area',
          type: 'info',
          duration: 3000
        });
      }
    } catch (err) {
      console.error('Error refreshing markers:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle image selection and preview
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Selected file must be an image');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-screen w-screen relative bg-gray-900 overflow-hidden">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <p className="text-white">Loading map...</p>
        </div>
      )}
      
      <MapGL
        {...viewState}
        ref={(ref) => {
          if (ref) {
            mapRef.current = ref.getMap();
          }
        }}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`}
        mapLib={maplibregl}
        onClick={handleMapClick}
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'absolute'
        }}
        onLoad={() => setMapLoaded(true)}
        touchZoomRotate={true}
        dragRotate={false}
        touchPitch={false}
        dragPan={true}
        scrollZoom={{
          speed: 0.01,
          smooth: true
        }}
        attributionControl={false}
        reuseMaps={true}
        cooperativeGestures={false}
        preserveDrawingBuffer={true}
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
            }}
          >
            <div 
              className={`relative ${!marker.active ? 'marker-archived' : ''}`}
              data-marker-id={marker.id}
            >
              {marker.category === 'ice' ? (
                <img src="/ice-button.svg" alt="ICE" className="w-9 h-9" />
              ) : (
                <div className="bg-blue-600 p-2 rounded-full">
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
                    <ScanEye size={18} className="text-blue-500 mr-2" />
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
              
              {/* Display image if available */}
              {selectedMarker.imageUrl && (
                <div className="mb-3">
                  <img 
                    src={getMarkerImageUrl(selectedMarker.imageUrl)} 
                    alt="Marker image" 
                    className="w-full h-auto rounded-lg object-cover max-h-48"
                    onError={(e) => {
                      // Hide image on error
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="text-sm text-gray-300 mb-3">
                <div className="flex items-center mb-1">
                  <span className="text-gray-400 mr-2">Created:</span>
                  <span>
                    {new Date(selectedMarker.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </MapGL>

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
          onSelect={(university) => {
            onUniversitySelect(university);
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
        language={language}
        onAddMarkClick={() => {
          setIsAddingMarker(true);
          addAlert({
            message: language === 'es' ? 'Haz clic en el mapa para colocar un marcador' : 
                     language === 'zh' ? '点击地图放置标记' : 
                     language === 'hi' ? 'मार्कर रखने के लिए मानचित्र पर क्लिक करें' : 
                     language === 'ar' ? 'انقر على الخريطة لوضع علامة' : 
                     'Click on the map to place a marker',
            type: 'info',
            duration: 5000
          });
        }}
        onRefreshClick={refreshMarkers}
        onSearchClick={() => document.getElementById('location-search-button')?.click()}
        onUniversityClick={() => document.getElementById('university-selector-button')?.click()}
      />

      {showCategoryDialog && (
        <Modal
          isOpen={showCategoryDialog}
          title={language === 'es' ? 'Añadir Nuevo Marcador' : 
                language === 'zh' ? '添加新标记' : 
                language === 'hi' ? 'नया मार्कर जोड़ें' : 
                language === 'ar' ? 'إضافة علامة جديدة' : 
                'Add New Pin'}
          onClose={() => {
            setShowCategoryDialog(false);
            setPendingMarker(null);
            setIsAddingMarker(false);
            setSelectedImage(null);
            setImagePreview(null);
          }}
        >
          <div className="p-4 space-y-4">
            <div className="mt-4 mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <ImageIcon size={16} className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                {language === 'es' ? 'Añadir Foto (Opcional)' : 
                 language === 'zh' ? '添加照片（可选）' : 
                 language === 'hi' ? 'फोटो जोड़ें (वैकल्पिक)' : 
                 language === 'ar' ? 'إضافة صورة (اختياري)' : 
                 'Add Photo (Optional)'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {imagePreview && (
                <div className="mt-3 relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-black/70"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-medium text-white mb-2">
              {language === 'es' ? 'Seleccionar Tipo de Marcador' : 
               language === 'zh' ? '选择标记类型' : 
               language === 'hi' ? 'पिन प्रकार चुनें' : 
               language === 'ar' ? 'اختر نوع العلامة' : 
               'Select Pin Type'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedCategory('ice');
                  addIceMarker();
                }}
                className="p-4 bg-red-900/70 hover:bg-red-800 text-white rounded-lg flex flex-col items-center"
                disabled={isUploading || processingCategory !== null}
              >
                {isUploading && processingCategory === 'ice' ? (
                  <Loader2 size={32} className="mb-2 animate-spin" />
                ) : (
                <img src="/ice-button.svg" alt="ICE" className="w-12 h-12 mb-2" />
                )}
                <span>ICE</span>
              </button>
              
              <button
                onClick={() => {
                  setSelectedCategory('observer');
                  addObserverMarker();
                }}
                className="p-4 bg-blue-900/70 hover:bg-blue-800 text-white rounded-lg flex flex-col items-center"
                disabled={isUploading || processingCategory !== null}
              >
                {isUploading && processingCategory === 'observer' ? (
                  <Loader2 size={32} className="mb-2 animate-spin" />
                ) : (
                  <ScanEye size={32} className="mb-2" />
                )}
                <span>
                  {language === 'es' ? 'Observador' : 
                   language === 'zh' ? '观察者' : 
                   language === 'hi' ? 'पर्यवेक्षक' : 
                   language === 'ar' ? 'مراقب' : 
                   'Observer'}
                </span>
              </button>
            </div>
            
            {error && (
              <div className="bg-red-900/50 text-red-100 px-4 py-3 rounded-lg flex items-center">
                <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="text-center text-gray-400 text-sm mt-4">
              <p>
                {language === 'es' ? 'Los marcadores de observador expirarán automáticamente después de 1 hora' : 
                 language === 'zh' ? '观察者标记将在1小时后自动过期' : 
                 language === 'hi' ? 'पर्यवेक्षक मार्कर 1 घंटे के बाद स्वचालित रूप से समाप्त हो जाएंगे' : 
                 language === 'ar' ? 'ستنتهي صلاحية علامات المراقب تلقائيًا بعد ساعة واحدة' : 
                 'Observer markers will automatically expire after 1 hour'}
              </p>
              <p>
                {language === 'es' ? 'Los marcadores de ICE permanecerán activos durante 24 horas' : 
                 language === 'zh' ? 'ICE标记将保持活跃24小时' : 
                 language === 'hi' ? 'ICE मार्कर 24 घंटे तक सक्रिय रहेंगे' : 
                 language === 'ar' ? 'ستظل علامات ICE نشطة لمدة 24 ساعة' : 
                 'ICE markers will remain active for 24 hours'}
              </p>
              <p className="mt-2 text-yellow-400">
                {language === 'es' ? 'Recuerda usar el botón Actualizar para ver nuevos marcadores' : 
                 language === 'zh' ? '记得使用刷新按钮查看新标记' : 
                 language === 'hi' ? 'नए मार्कर देखने के लिए रिफ्रेश बटन का उपयोग करना याद रखें' : 
                 language === 'ar' ? 'تذكر استخدام زر التحديث للتحقق من العلامات الجديدة' : 
                 'Remember to use the Refresh button to check for new markers'}
              </p>
            </div>
            
            {isUploading && (
              <div className="flex justify-center items-center py-2">
                <Loader2 size={24} className="animate-spin text-blue-500 mr-2" />
                <span className="text-gray-300">
                  {language === 'es' ? 'Subiendo datos del marcador...' : 
                   language === 'zh' ? '上传标记数据...' : 
                   language === 'hi' ? 'पिन डेटा अपलोड हो रहा है...' : 
                   language === 'ar' ? 'جاري تحميل بيانات العلامة...' : 
                   'Uploading pin data...'}
                </span>
              </div>
            )}
          </div>
        </Modal>
      )}
      
      {/* Error Display */}
      {error && !showCategoryDialog && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/80 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="ml-3 p-1 rounded-full hover:bg-red-800"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MapView;