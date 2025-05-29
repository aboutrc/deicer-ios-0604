import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MapPin, CircleAlert as AlertCircle, Loader as Loader2, Camera, Eye, Shield, Search, School, Plus, RotateCw } from 'lucide-react-native';
import { useLanguage } from '@/context/LanguageContext';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPinTypeModal, setShowPinTypeModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const mapRef = useRef<any>(null);
  const router = useRouter();
  const { t, isInitialized } = useLanguage();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.action === 'addMark') {
      setIsAddingPin(true);
    }
  }, [params.action]);

  const handleMapPress = (event: any) => {
    if (!isAddingPin) return;
    
    setSelectedLocation(event.coordinates);
    setShowPinTypeModal(true);
    setIsAddingPin(false);
  };

  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePinType = async (type: 'ice' | 'observer') => {
    if (!selectedLocation) return;

    // Here you would normally send this to your backend
    const pin = {
      type,
      location: selectedLocation,
      image: selectedImage,
      timestamp: new Date().toISOString()
    };

    console.log('New pin:', pin);
    
    // Show success message
    Alert.alert(
      'Success',
      `${type.toUpperCase()} marker added successfully`,
      [{ text: 'OK' }]
    );

    // Reset state
    setSelectedImage(null);
    setShowPinTypeModal(false);
    setSelectedLocation(null);
  };

  useEffect(() => {
    if (!isInitialized) return;

    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg(t('locationPermissionDenied') || 'Location permission denied');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        
        // Fetch events from API
      } catch (error) {
        setErrorMsg(t('errorFetchingLocation') || 'Error fetching location');
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [isInitialized, t]);

  const handleReportEvent = () => {
    router.push('/report');
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
        initialRegion={location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        } : undefined}
        onPress={(e) => {
          if (isAddingPin) {
            setSelectedLocation({
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude
            });
            setShowPinTypeModal(true);
            setIsAddingPin(false);
          }
        }}
      >
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude
            }}
          >
            <MapPin size={28} color="#007AFF" />
          </Marker>
        )}
      </MapView>
    );
  };

  const renderPinTypeModal = () => {
    if (!showPinTypeModal) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add New Pin</Text>
          
          <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
            <Camera size={24} color="#007AFF" />
            <Text style={styles.imageButtonText}>
              {selectedImage ? 'Change Photo' : 'Add Photo (Optional)'}
            </Text>
          </TouchableOpacity>

          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          )}

          <View style={styles.pinTypeContainer}>
            <TouchableOpacity 
              style={[styles.pinTypeButton, styles.iceButton]}
              onPress={() => handlePinType('ice')}
            >
              <Shield size={24} color="#FFF" />
              <Text style={styles.pinTypeText}>ICE</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.pinTypeButton, styles.observerButton]}
              onPress={() => handlePinType('observer')}
            >
              <Eye size={24} color="#FFF" />
              <Text style={styles.pinTypeText}>Observer</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.pinTypeNote}>
            Observer markers expire after 1 hour{'\n'}
            ICE markers remain active for 24 hours
          </Text>
        </View>
      </View>
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
            <TouchableOpacity style={styles.mapControlButton}>
              <Search size={24} color="#FFFFFF" />
              <Text style={styles.mapControlText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControlButton}>
              <School size={24} color="#FFFFFF" />
              <Text style={styles.mapControlText}>University</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={() => router.push('/(tabs)/index?action=addMark')}
            >
              <Plus size={24} color="#FFFFFF" />
              <Text style={styles.mapControlText}>Add Mark</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControlButton}>
              <RotateCw size={24} color="#FFFFFF" />
              <Text style={styles.mapControlText}>Refresh</Text>
            </TouchableOpacity>
          </View>
          {renderPinTypeModal()}
          {isAddingPin && (
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
  modal: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
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
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
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
});