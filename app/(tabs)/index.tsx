import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, Image, Alert, Modal, ScrollView, useColorScheme, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import Animated, { withSpring, withRepeat, withSequence } from 'react-native-reanimated';
import * as Location from 'expo-location';
import MapView, { Marker as RNMarker, Region, LatLng, Callout, CalloutSubview } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MapPin, CircleAlert as AlertCircle, Loader as Loader2, Eye, Shield, Search, Plus, RotateCw, Clock, X, GraduationCap, Trash2, Navigation, Camera } from 'lucide-react-native';
import { useLanguage } from '@/context/LanguageContext';
import SearchLocationModal from '@/components/SearchLocationModal';
import { useMarkers } from '@/context/MarkerContext';
import UniversitiesModal from '@/components/UniversitiesModal';
import type { MarkerType } from '@/types/marker';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import * as ImageManipulator from 'expo-image-manipulator';
import { getMarkerImageUrl } from '@/lib/supabase';

const DEFAULT_ZOOM = 15.5;
const DEFAULT_CENTER = {
  longitude: -76.13459,
  latitude: 43.03643
};

interface NewMarker {
  latitude: number;
  longitude: number;
  type: 'ice' | 'info';
  imageFilename?: string;
}

export default function MapScreen() {
  const { t } = useLanguage();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const markerRef = useRef<RNMarker>(null);
  const router = useRouter();
  const { markers, refreshMarkers, isAddingMarker, setIsAddingMarker, addMarker } = useMarkers();
  const colorScheme = useColorScheme();
  const [showSearchLocationModal, setShowSearchLocationModal] = useState(false);
  const [showUniversitiesModal, setShowUniversitiesModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showPinTypeModal, setShowPinTypeModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const [newMarker, setNewMarker] = useState<NewMarker | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setInitialRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMarkers();
    } catch (error) {
      console.error('Error refreshing markers:', error);
      Alert.alert(t('error'), t('errorRefreshingMarkers'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddMarkerPress = () => {
    setIsAddingMarker(!isAddingMarker);
  };

  const handleMapPress = (event: any) => {
    if (!isAddingMarker) return;
    
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    setShowPinTypeModal(true);
  };

  const handleLocationPress = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error'), t('locationPermissionDenied'));
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.00137,  // Approximately 500 feet view
          longitudeDelta: 0.00173, // Approximately 500 feet view
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(t('error'), t('errorGettingLocation'));
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1.0,
        base64: false,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        console.log('Selected image asset:', {
          uri: selectedAsset.uri,
          width: selectedAsset.width,
          height: selectedAsset.height,
          type: selectedAsset.type,
        });

        // Log original image info
        const originalInfo = await FileSystem.getInfoAsync(selectedAsset.uri);
        console.log('Original image info:', originalInfo);

        if (!originalInfo.exists) {
          throw new Error('Selected image file does not exist');
        }

        // Read the file to verify it's valid
        try {
          const fileContent = await FileSystem.readAsStringAsync(selectedAsset.uri, {
            encoding: FileSystem.EncodingType.Base64,
            length: 10, // Just read first 10 bytes to verify file is readable
          });
          console.log('File is readable, first 10 bytes length:', fileContent.length);
        } catch (readError) {
          console.error('Error reading file:', readError);
          throw new Error('Selected image file is not readable');
        }

        // Store the full image info
        setSelectedImage(selectedAsset.uri);
        console.log('Selected image URI:', selectedAsset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('error'), t('errorPickingImage'));
    }
  };

  const handleCreateMarker = async (category: 'ice' | 'observer') => {
    if (!selectedLocation) return;

    try {
      setIsUploading(true);
      let imageUrl = null;

      if (selectedImage) {
        try {
          // Generate a unique filename
          const fileName = `marker-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          console.log('Starting upload process with filename:', fileName);

          // First compression step using ImageManipulator
          console.log('Starting image compression...');
          const manipResult = await ImageManipulator.manipulateAsync(
            selectedImage,
            [{ resize: { width: 1600 } }],
            { 
              compress: 0.9,
              format: ImageManipulator.SaveFormat.JPEG
            }
          );
          console.log('Image compression complete, uri:', manipResult.uri);

          // Create FormData
          const formData = new FormData();
          formData.append('file', {
            uri: manipResult.uri,
            type: 'image/jpeg',
            name: fileName
          } as any);

          console.log('FormData created, uploading...');

          // Upload to pin-markers-images bucket using fetch directly
          const supabaseUrl = 'https://dqklgrcelslhpvnemlze.supabase.co';
          const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
          
          const response = await fetch(
            `${supabaseUrl}/storage/v1/object/pin-markers-images/${fileName}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'x-upsert': 'true'
              },
              body: formData
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload failed:', response.status, errorText);
            throw new Error(`Upload failed: ${response.status} ${errorText}`);
          }

          console.log('Upload complete, response:', response.status);

          // Get the public URL for the uploaded image
          const { data: { publicUrl } } = supabase.storage
            .from('pin-markers-images')
            .getPublicUrl(fileName);

          console.log('Image uploaded successfully, public URL:', publicUrl);
          imageUrl = fileName;

        } catch (error) {
          console.error('Error during image upload:', error);
          Alert.alert(
            t('error'),
            'Failed to upload image. Please try again with a smaller image or take a new photo.'
          );
          // Reset states on error
          setIsUploading(false);
          setSelectedImage(null);
          return;
        }
      }

      // Create the marker
      try {
        await addMarker({
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          category,
          imageUri: imageUrl || undefined,
        });

        // Reset all states after successful marker creation
        setSelectedLocation(null);
        setSelectedImage(null);
        setShowPinTypeModal(false);
        setIsAddingMarker(false);
        setIsUploading(false);

        // Show success message
        Alert.alert(
          t('success'),
          t('marker_added_successfully'),
          [
            {
              text: 'OK',
              onPress: () => {
                // Additional cleanup after user acknowledges
                setNewMarker(null);
              }
            }
          ]
        );
      } catch (error) {
        console.error('Error creating marker:', error);
        Alert.alert(
          t('error'),
          t('failed_to_add_marker')
        );
        // Reset upload state but keep other states for retry
        setIsUploading(false);
      }
    } catch (error) {
      console.error('Error during image upload:', error);
      Alert.alert(
        t('error'),
        'Failed to upload image. Please try again with a smaller image or take a new photo.'
      );
      // Reset states on error
      setIsUploading(false);
      setSelectedImage(null);
    }
  };

  // Add a type guard function
  const isValidMarker = (marker: any): marker is MarkerType => {
    return marker && 
           typeof marker.id === 'string' && 
           (marker.category === 'ice' || marker.category === 'observer');
  };

  // Load image URLs when markers change
  useEffect(() => {
    markers.forEach(marker => {
      if (isValidMarker(marker) && marker.image_url) {
        loadImageUrl(marker);
      }
    });
  }, [markers]);

  // Add a function to load image URL
  const loadImageUrl = async (marker: MarkerType) => {
    if (!marker.image_url) return;
    
    try {
      // Skip if we already have the URL
      if (imageUrls[marker.id]) return;
      
      // Skip if we already tried and failed
      if (imageLoadErrors[marker.id]) return;
      
      console.log('Loading image URL for marker:', marker.id);
      const url = await getMarkerImageUrl(marker.image_url);
      
      if (!url) {
        console.error('Failed to get URL for marker:', marker.id);
        setImageLoadErrors(prev => ({
          ...prev,
          [marker.id]: true
        }));
        return;
      }
      
      setImageUrls(prev => ({
        ...prev,
        [marker.id]: url
      }));
    } catch (error) {
      console.error('Error loading image URL:', error);
      setImageLoadErrors(prev => ({
        ...prev,
        [marker.id]: true
      }));
    }
  };

  const handleMarkerPress = (marker: any) => {
    setSelectedMarker(marker);
  };

  const handleCloseCallout = () => {
    setSelectedMarker(null);
    setImageLoadErrors({});
  };

  return (
    <View style={styles.container}>
      {initialRegion && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
          showsCompass
          showsScale
          showsBuildings
          loadingEnabled
          loadingIndicatorColor="#2563eb"
          loadingBackgroundColor="#000000"
          userInterfaceStyle={colorScheme === 'dark' ? 'dark' : 'light'}
          onPress={handleMapPress}
        >
          {markers.map((marker: MarkerType) => (
            <RNMarker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude
              }}
              onPress={() => {
                if (marker.category === 'ice' || marker.category === 'observer') {
                  setSelectedMarker({
                    ...marker,
                    category: marker.category
                  } as MarkerType);
                }
              }}
            />
          ))}
          {selectedLocation && (
            <RNMarker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude
              }}
              pinColor="#FF3B30"
            />
          )}
        </MapView>
      )}

      {/* Marker Viewing Modal */}
      {selectedMarker && (
        <Modal
          visible={!!selectedMarker}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setSelectedMarker(null);
            setImageLoadErrors({});
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>ICE Marker</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => {
                    setSelectedMarker(null);
                    setImageLoadErrors({});
                  }}
                >
                  <X size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>

              {selectedMarker.image_url && (
                <View style={styles.imageContainer}>
                  {imageLoadErrors[selectedMarker.id] ? (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>Failed to load image</Text>
                    </View>
                  ) : imageUrls[selectedMarker.id] ? (
                    <Image 
                      source={{ uri: imageUrls[selectedMarker.id] }}
                      style={styles.selectedImage}
                      resizeMode="contain"
                      onError={(e) => {
                        console.error('Error loading image:', e.nativeEvent.error);
                        setImageLoadErrors(prev => ({
                          ...prev,
                          [selectedMarker.id]: true
                        }));
                      }}
                    />
                  ) : (
                    <ActivityIndicator size="large" color="#007AFF" />
                  )}
                </View>
              )}

              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateTimeText}>
                  {new Date(selectedMarker.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: '2-digit',
                    year: 'numeric'
                  })}
                </Text>
                <Text style={styles.dateTimeText}>
                  {new Date(selectedMarker.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZoneName: 'short'
                  })}
                </Text>
              </View>

              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
                  onPress={() => {/* Twitter share implementation */}}
                >
                  <Text style={styles.socialButtonText}>Twitter</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.socialButton, { backgroundColor: '#E1306C' }]}
                  onPress={() => {/* Instagram share implementation */}}
                >
                  <Text style={styles.socialButtonText}>Instagram</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={() => setShowSearchLocationModal(true)}
        >
          <Search size={24} color="#FFFFFF" />
          <Text style={styles.bottomNavText}>{t('search')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={handleAddMarkerPress}
        >
          <Plus size={24} color={isAddingMarker ? "#FF3B30" : "#FFFFFF"} />
          <Text style={[
            styles.bottomNavText,
            isAddingMarker && { color: "#FF3B30" }
          ]}>{t('addMark')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={handleLocationPress}
        >
          <Navigation size={24} color="#FFFFFF" />
          <Text style={styles.bottomNavText}>{t('location')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={handleRefresh}
        >
          <RotateCw 
            size={24} 
            color="#FFFFFF"
            style={isRefreshing ? styles.rotating : undefined}
          />
          <Text style={styles.bottomNavText}>{t('refresh')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={() => setShowUniversitiesModal(true)}
        >
          <GraduationCap size={24} color="#FFFFFF" />
          <Text style={styles.bottomNavText}>{t('universities')}</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <SearchLocationModal
        visible={showSearchLocationModal}
        onClose={() => setShowSearchLocationModal(false)}
        onSelectLocation={(latitude: number, longitude: number) => {
          mapRef.current?.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }, 1000);
          setShowSearchLocationModal(false);
        }}
      />

      <UniversitiesModal
        visible={showUniversitiesModal}
        onClose={() => setShowUniversitiesModal(false)}
        onSelectUniversity={(latitude: number, longitude: number) => {
          mapRef.current?.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.00362,  // Quarter mile view (approximately 1,320 feet)
            longitudeDelta: 0.00458, // Quarter mile view (approximately 1,320 feet)
          }, 1000);
          setShowUniversitiesModal(false);
        }}
      />

      {/* Creation Modal */}
      <Modal
        visible={showPinTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPinTypeModal(false);
          setSelectedLocation(null);
          setSelectedImage(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ICE Marker</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowPinTypeModal(false);
                  setSelectedLocation(null);
                  setSelectedImage(null);
                }}
              >
                <X size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {selectedImage && (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                  resizeMode="contain"
                />
                {isUploading && (
                  <View style={styles.uploadingOverlay}>
                    <Loader2 size={24} color="#FFFFFF" />
                    <Text style={styles.uploadingText}>{t('uploading')}</Text>
                  </View>
                )}
              </View>
            )}

            {selectedImage && (
              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateTimeText}>
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    day: '2-digit',
                    year: 'numeric'
                  })}
                </Text>
                <Text style={styles.dateTimeText}>
                  {new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZoneName: 'short'
                  })}
                </Text>
              </View>
            )}

            <View style={styles.pinTypeContainer}>
              <TouchableOpacity 
                style={[styles.pinTypeButton, styles.iceButton]}
                onPress={() => handleCreateMarker('ice')}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 size={24} color="#FFFFFF" />
                ) : (
                  <>
                    <AlertCircle size={24} color="#FFFFFF" />
                    <Text style={styles.pinTypeText}>{t('ice')}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.pinTypeButton, styles.observerButton]}
                onPress={() => handleCreateMarker('observer')}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 size={24} color="#FFFFFF" />
                ) : (
                  <>
                    <Eye size={24} color="#FFFFFF" />
                    <Text style={styles.pinTypeText}>{t('observer')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[
                styles.imageButton,
                isUploading && { opacity: 0.5 }
              ]}
              onPress={handleImagePick}
              disabled={isUploading}
            >
              <Camera size={24} color="#007AFF" />
              <Text style={styles.imageButtonText}>{t('addImage')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Marker Indicator */}
      {isAddingMarker && (
        <View style={styles.addMarkIndicator}>
          <Text style={styles.addMarkText}>{t('tapOnMapToAddMark')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  map: {
    width: '100%',
    height: '100%'
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
  rotating: {
    transform: [{ rotate: '360deg' }],
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
    marginTop: -8,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#2C2C2E',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  dateTimeContainer: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    marginBottom: 12,
  },
  dateTimeText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 2,
  },
  pinTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
    gap: 8,
  },
  pinTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iceButton: {
    backgroundColor: '#FF3B30',
  },
  observerButton: {
    backgroundColor: '#007AFF',
  },
  pinTypeText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  imageButtonText: {
    color: '#007AFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 14,
  },
  calloutWrapper: {
    flex: 1,
    position: 'relative',
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  calloutContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    width: 300,
    maxWidth: '90%',
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calloutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  calloutImageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#2C2C2E',
  },
  calloutImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  socialButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  calloutTouchable: {
    width: '100%',
  },
});