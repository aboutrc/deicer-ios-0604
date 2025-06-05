import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, Image, Alert, Modal, ScrollView } from 'react-native';
import Animated, { withSpring, withRepeat, withSequence } from 'react-native-reanimated';
import * as Location from 'expo-location';
import MapView, { Marker as RNMarker, Region, LatLng } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MapPin, CircleAlert as AlertCircle, Loader as Loader2, Eye, Shield, Search, Plus, RotateCw, Clock, X, GraduationCap, Trash2, Navigation, Camera } from 'lucide-react-native';
import { useLanguage } from '@/context/LanguageContext';
import SearchLocationModal from '@/components/SearchLocationModal';
import { useMarkers } from '@/context/MarkerContext';
import UniversitiesModal from '@/components/UniversitiesModal';
import type { MarkerType } from '@/types/marker';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

const MAPTILER_KEY = 'SuHEhypMCIOnIZIVbC95';

const DEFAULT_ZOOM = 15.5;
const DEFAULT_CENTER = {
  longitude: -76.13459,
  latitude: 43.03643
};

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

export default function MapScreen() {
  const { t, isInitialized } = useLanguage();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showPinTypeModal, setShowPinTypeModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [showUniversitiesModal, setShowUniversitiesModal] = useState(false);
  const [showSearchLocationModal, setShowSearchLocationModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const params = useLocalSearchParams();
  const { markers, isAddingMarker, isUploading = false, setIsAddingMarker, addMarker, loading: markersLoading, refreshMarkers } = useMarkers();

  const handleMapPress = (event: any) => {
    if (!isAddingMarker) return;
    
    if (!event?.nativeEvent?.coordinate?.latitude || !event?.nativeEvent?.coordinate?.longitude) {
      console.error('Invalid map press event:', event);
      Alert.alert('Error', 'Could not determine tap location. Please try again.');
      return;
    }
    
    setSelectedLocation({
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude
    });
    setShowPinTypeModal(true);
  };

  const renderMap = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.webMapPlaceholder}>
          <AlertCircle size={24} color="#007AFF" />
          <Text style={styles.webMapText}>{t('mapNotAvailableWeb')}</Text>
          <Text style={styles.webMapSubText}>{t('useNativePlatform')}</Text>
        </View>
      );
    }

    return (
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton
        initialRegion={initialRegion || {
          // Center of continental US (approximately Kansas)
          latitude: 39.8283,
          longitude: -98.5795,
          // Zoom level to show most of continental US
          latitudeDelta: 50,
          longitudeDelta: 60,
        }}
        minZoomLevel={3}  // Prevent zooming out too far
        maxZoomLevel={20} // Allow detailed zoom
        onPress={handleMapPress}
        // Restrict map boundaries
        onRegionChangeComplete={(region) => {
          // Keep latitude between bounds of continental US
          const newLat = Math.min(Math.max(region.latitude, 24.396308), 49.384358);
          // Keep longitude between bounds of continental US
          const newLng = Math.min(Math.max(region.longitude, -125.000000), -66.934570);
          
          if (newLat !== region.latitude || newLng !== region.longitude) {
            mapRef.current?.animateToRegion({
              latitude: newLat,
              longitude: newLng,
              latitudeDelta: region.latitudeDelta,
              longitudeDelta: region.longitudeDelta,
            }, 100);
          }
        }}
      >
        {selectedLocation && (
          <RNMarker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude
            }}
            pinColor="#FF3B30"
          >
            <MapPin size={28} color="#007AFF" />
          </RNMarker>
        )}
        
        {markers.map((marker) => (
          <RNMarker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude
            }}
            onPress={() => setSelectedMarker(marker)}
          >
            <MapPin 
              size={28} 
              color={marker.category === 'ice' ? '#FF3B30' : '#007AFF'} 
            />
          </RNMarker>
        ))}
      </MapView>
    );
  };

  // ... rest of the component code ...
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  map: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1C1C1E',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  errorText: {
    marginTop: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  addMarkIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addMarkText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  webMapText: {
    marginTop: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
  webMapSubText: {
    marginTop: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerPopup: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  locationAlertModal: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 24,
  },
  locationAlertTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  locationAlertMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 24,
    lineHeight: 22,
  },
  locationAlertButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  locationAlertButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  markerImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#2C2C2E',
  },
  markerPopupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  iceBadge: {
    backgroundColor: '#FF3B30',
  },
  observerBadge: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    padding: 8,
  },
  markerInfo: {
    padding: 16,
  },
  markerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  markerDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 16,
  },
  markerMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metadataText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginLeft: 8,
  },
  markerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  modal: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FF3B30',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    marginBottom: 16,
  },
  imageButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  pinTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pinTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  iceButton: {
    backgroundColor: '#FF3B30',
  },
  observerButton: {
    backgroundColor: '#007AFF',
  },
  pinTypeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFF',
    marginLeft: 8,
    zIndex: 1,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pinTypeNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  mapControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  mapControlButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapControlText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
});