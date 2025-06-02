import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, Image, Alert, Modal, ScrollView } from 'react-native';
import Animated, { withSpring, withRepeat, withSequence } from 'react-native-reanimated';
import * as Location from 'expo-location';
import MapView, { Marker as RNMarker, PROVIDER_GOOGLE, Region, LatLng } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MapPin, CircleAlert as AlertCircle, Loader as Loader2, Eye, Shield, Search, Plus, RotateCw, Clock, X, GraduationCap, Trash2, Navigation, Camera } from 'lucide-react-native';
import { useLanguage } from '@/context/LanguageContext';
import SearchLocationModal from '@/components/SearchLocationModal';
import { useMarkers } from '@/context/MarkerContext';
import UniversitiesModal from '@/components/UniversitiesModal';
import type { Marker } from '@/context/MarkerContext';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export default function MapScreen() {
  const { t, isInitialized } = useLanguage();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showPinTypeModal, setShowPinTypeModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showUniversitiesModal, setShowUniversitiesModal] = useState(false);
  const [showSearchLocationModal, setShowSearchLocationModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const mapRef = useRef<any>(null);
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const params = useLocalSearchParams();
  const { markers, isAddingMarker, isUploading = false, setIsAddingMarker, addMarker, loading: markersLoading, refreshMarkers } = useMarkers();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      try {
        if (status !== 'granted') {
          Alert.alert(
            'Location Required',
            'As a security feature, pins are not allowed to be placed if we cannot see your location. Please ensure you have location services turned on.',
            [{ text: 'OK' }]
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        
        // Set initial region to user's location with 1-mile radius
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          // These deltas approximately show a 1-mile radius
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        };
        setInitialRegion(region);
        
        // Animate map to user's location
        if (mapRef.current) {
          mapRef.current.animateToRegion(region, 1000);
        }
      } catch (err) {
        console.error('Error getting location:', err);
        Alert.alert(
          'Location Required',
          'As a security feature, pins are not allowed to be placed if we cannot see your location. Please ensure you have location services turned on.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

  const centerOnUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      
      if (mapRef.current && location) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    } catch (err) {
      console.error('Error getting location:', err);
      Alert.alert('Error', 'Could not get your location');
    }
  };

  // Refresh markers on initial load
  useEffect(() => {
    refreshMarkers();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshMarkers();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (params.action === 'addMark') {
      setIsAddingMarker(true);
    }
  }, [params.action]);

  const handleMapPress = (event: any) => {
    if (!isAddingMarker) return;
    
    if (!event?.nativeEvent?.coordinate?.latitude || !event?.nativeEvent?.coordinate?.longitude) {
      console.error('Invalid map press event:', event);
      Alert.alert('Error', 'Could not determine tap location. Please try again.');
      return;
    }
    
    // Use existing userLocation instead of requesting again
    if (!userLocation) {
      Alert.alert(
        'Location Required',
        'As a security feature, pins are not allowed to be placed if we cannot see your location. Please ensure you have location services turned on.',
        [
          {
            text: 'OK',
            style: 'default',
            onPress: () => setIsAddingMarker(false)
          }
        ],
        { userInterfaceStyle: 'dark' }
      );
      return;
    }

    const distance = calculateDistance(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      event.nativeEvent.coordinate.latitude,
      event.nativeEvent.coordinate.longitude
    );
    
    if (distance > 0.5) {
      // Show styled modal instead of alert
      Alert.alert('Location Too Far',
        'You can only create markers within 1/2 mile of your current location.',
        [
          {
            text: 'OK',
            style: 'default',
            onPress: () => setIsAddingMarker(false)
          }
        ],
        {
          userInterfaceStyle: 'dark',
        }
      );
      return;
    }
    
    setSelectedLocation({
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude
    });
    setShowPinTypeModal(true);
  };

  // Helper function to calculate distance between two points in miles
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleAddMarker = async (category: 'ice' | 'observer') => {
    if (!selectedLocation) return;

    setUploadProgress(0);
    try {
      setIsAddingMarker(false);
      
      // Start progress animation
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 0.1;
        if (progress > 0.9) {
          clearInterval(progressInterval);
        }
        setUploadProgress(progress);
      }, 100);

      await addMarker({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        category,
        imageUri: selectedImage
      });

      setUploadProgress(1);
      setUploadingImage(false);
      setSelectedImage(null);
      setShowPinTypeModal(false);
      setSelectedLocation(null);
    } catch (err) {
      console.error('Error adding marker:', err);
      Alert.alert('Error', 'Failed to add marker');
    }
  };

  const handleUniversitySelect = (coordinates: { latitude: number; longitude: number }) => {
    if (!mapRef.current) return;

    const region: Region = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };

    mapRef.current.animateToRegion(region, 1500);
    setShowUniversitiesModal(false);
    setShowSearchLocationModal(false);
  };

  const handleClearMarkers = async () => {
    Alert.alert(
      'Clear All Markers',
      'Are you sure you want to delete all markers? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              setClearing(true);
              await supabase.rpc('clear_all_markers_rpc');
              await refreshMarkers();
              Alert.alert('Success', 'All markers have been cleared');
            } catch (err) {
              console.error('Error clearing markers:', err);
              Alert.alert('Error', 'Failed to clear markers');
            } finally {
              setClearing(false);
            }
          }
        }
      ]
    );
  };

  const handleSelectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error selecting image:', err);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const renderPinTypeModal = () => {
    if (!showPinTypeModal) return null;

    return (
      <Modal
        visible={showPinTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPinTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectPinType')}</Text>
              <TouchableOpacity
                onPress={() => setShowPinTypeModal(false)}
                style={styles.cancelButton}
                onPress={() => {
                  setShowPinTypeModal(false);
                  setIsAddingMarker(false);
                  setSelectedLocation(null);
                }}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleSelectImage}
            >
              <Camera size={24} color="#007AFF" />
              <Text style={styles.imageButtonText}>
                {selectedImage ? t('changeImage') : t('addImage')}
              </Text>
            </TouchableOpacity>

            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
                resizeMode="cover"
              />
            )}

            <View style={styles.pinTypeContainer}>
              <TouchableOpacity
                style={[styles.pinTypeButton, styles.iceButton]}
                disabled={isUploading}
                onPress={() => handleAddMarker('ice')}>
                <Shield size={24} color="#FFFFFF" />
                <Text style={styles.pinTypeText}>{t('ice')}</Text>
                {isUploading && (
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${uploadProgress * 100}%` }]} />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pinTypeButton, styles.observerButton]}
                disabled={isUploading}
                onPress={() => handleAddMarker('observer')}>
                <Eye size={24} color="#FFFFFF" />
                <Text style={styles.pinTypeText}>{t('observer')}</Text>
                {isUploading && (
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${uploadProgress * 100}%` }]} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.pinTypeNote}>
              {t('selectPinTypeDesc')}
            </Text>
          </View>
        </View>
      </Modal>
    );
  };

  const renderMarkerPopup = () => {
    if (!selectedMarker) return null;

    const formatDate = (date: string) => {
      return new Date(date).toLocaleString();
    };

    return (
      <Modal
        visible={!!selectedMarker}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMarker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.markerPopup}>
            <View style={styles.markerPopupHeader}>
              <View style={[
                styles.categoryBadge,
                selectedMarker.category === 'ice' ? styles.iceBadge : styles.observerBadge
              ]}>
                <Text style={styles.categoryText}>
                  {selectedMarker.category.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedMarker(null)}
              >
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {selectedMarker.image_url && (
              <Image
                source={{ uri: selectedMarker.image_url }}
                style={styles.markerImage}
                resizeMode="cover"
              />
            )}

            <View style={styles.markerInfo}>
              <Text style={styles.markerTitle}>{selectedMarker.title}</Text>
              <Text style={styles.markerDescription}>{selectedMarker.description}</Text>

              <View style={styles.markerMetadata}>
                <Clock size={16} color="#8E8E93" />
                <Text style={styles.metadataText}>
                  Created: {formatDate(selectedMarker.created_at)}
                </Text>
              </View>

              <View style={styles.markerStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Confirmations</Text>
                  <Text style={styles.statValue}>{selectedMarker.confirmations_count}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Reliability</Text>
                  <Text style={styles.statValue}>
                    {Math.round(selectedMarker.reliability_score * 100)}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
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
        provider={PROVIDER_GOOGLE}
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
        // Limit the boundries to continental US
        region={{
          latitude: 39.8283,
          longitude: -98.5795,
          latitudeDelta: 50,
          longitudeDelta: 60,
        }}
        // Set map boundaries
        mapPadding={{
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }}
        // Limit scrollable area to continental US
        legalLabelInsets={{
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }}
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

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Loader2 size={24} color="#007AFF" />
        <Text style={styles.loadingText}>{t('initializing') || 'Initializing...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Loader2 size={24} color="#007AFF" />
          <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={24} color="#FF3B30" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : (
        <>
          {renderMap()}
          <View style={styles.mapControls}>
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={centerOnUserLocation}
            >
              <Navigation size={24} color="#FFFFFF" />
              <Text style={styles.mapControlText}>{t('location')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={() => setShowSearchLocationModal(true)}
            >
              <Search size={24} color="#FFFFFF" />
              <Text style={styles.mapControlText}>{t('search')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={() => setShowUniversitiesModal(true)}
            >
              <GraduationCap size={24} color="#FFFFFF" />
              <Text style={styles.mapControlText}>{t('university')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={() => setIsAddingMarker(true)}
            >
              <Plus size={24} color="#FFFFFF" />
              <Text style={styles.mapControlText}>{t('addMark')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <RotateCw 
                size={24} 
                color="#FFFFFF"
                style={refreshing ? styles.rotating : undefined}
              />
              <Text style={styles.mapControlText}>{t('refresh')}</Text>
            </TouchableOpacity>
          </View>
          {renderPinTypeModal()}
          {renderMarkerPopup()}
          <SearchLocationModal
            visible={showSearchLocationModal}
            onClose={() => setShowSearchLocationModal(false)}
            onSelectLocation={handleUniversitySelect}
          />
          <UniversitiesModal
            visible={showUniversitiesModal}
            onClose={() => setShowUniversitiesModal(false)}
            onSelectUniversity={handleUniversitySelect}
          />
          {isAddingMarker && (
            <View style={styles.addMarkIndicator}>
              <Text style={styles.addMarkText}>{t('tapOnMapToAddMark')}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
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