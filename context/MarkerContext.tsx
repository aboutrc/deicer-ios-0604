import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { getMarkerImageUrl } from '@/lib/supabase';

type Marker = Database['public']['Tables']['markers']['Row'];

interface MarkerContextType {
  markers: Marker[];
  isAddingMarker: boolean;
  isUploading: boolean;
  setIsAddingMarker: (value: boolean) => void;
  clearAllMarkers: () => Promise<void>;
  addMarker: (params: {
    latitude: number;
    longitude: number;
    category: 'ice' | 'observer';
    imageUri?: string;
  }) => Promise<void>;
  refreshMarkers: () => Promise<void>;
  confirmMarker: (params: {
    markerId: string;
    isPresent: boolean;
    latitude: number;
    longitude: number;
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const MarkerContext = createContext<MarkerContextType | undefined>(undefined);

export const useMarkers = () => {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error('useMarkers must be used within a MarkerProvider');
  }
  return context;
};

export const MarkerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to calculate distance between two points in miles
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

  const clearAllMarkers = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.rpc('clear_all_markers_rpc');
      if (error) throw error;
      await fetchMarkers(); // Refresh markers after clearing
      Alert.alert('Success', 'All markers have been cleared');
    } catch (err) {
      console.error('Error clearing markers:', err);
      Alert.alert('Error', 'Failed to clear markers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, []);

  const fetchMarkers = async () => {
    try {
      const { data, error } = await supabase
        .from('markers')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the markers to include public URLs for images
      const markersWithPublicUrls = (data || []).map(marker => {
        if (marker.image_url) {
          // Check if the image_url is already a full URL
          if (marker.image_url.startsWith('http')) {
            return marker;
          }
          // Otherwise, get the public URL for the filename
          const { data: { publicUrl } } = supabase.storage
            .from('pin-markers-images')
            .getPublicUrl(marker.image_url);
          return { ...marker, image_url: publicUrl };
        }
        return marker;
      });

      setMarkers(markersWithPublicUrls);
    } catch (err) {
      console.error('Error fetching markers:', err);
      setError('Failed to load markers');
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create a unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const filename = `marker-${timestamp}-${random}.jpg`;

      const { data, error } = await supabase.storage
        .from('pin-markers-images')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pin-markers-images')
        .getPublicUrl(filename);

      return filename; // Return the filename instead of the public URL
    } catch (err) {
      console.error('Image upload error:', err);
      Alert.alert(
        'Error',
        'Failed to upload image. Please try again.'
      );
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const addMarker = async ({
    latitude,
    longitude,
    category,
    imageUri
  }: {
    latitude: number;
    longitude: number;
    category: 'ice' | 'observer';
    imageUri?: string;
  }) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('markers')
        .insert([{
          title: `${category.toUpperCase()} Marker`,
          description: `New ${category} marker`,
          category,
          latitude,
          longitude,
          image_url: imageUri
        }])
        .select()
        .single();

      if (error) throw error;

      // Add the new marker to the local state
      if (data) {
        const newMarker: Marker = {
          ...data,
          image_url: imageUri ? getMarkerImageUrl(imageUri) : null
        };
        setMarkers(prev => [...prev, newMarker]);
      }

      // Refresh markers to ensure we have the latest data
      await fetchMarkers();
    } catch (err) {
      console.error('Error adding marker:', err);
      throw err; // Re-throw the error to be handled by the caller
    } finally {
      setLoading(false);
      setIsAddingMarker(false);
    }
  };

  const confirmMarker = async ({
    markerId,
    isPresent,
    latitude,
    longitude
  }: {
    markerId: string;
    isPresent: boolean;
    latitude: number;
    longitude: number;
  }) => {
    try {
      setLoading(true);

      const { error } = await supabase.rpc('handle_marker_confirmation', {
        marker_id: markerId,
        is_present: isPresent,
        user_ip: 'mobile-app',
        user_lat: latitude,
        user_lng: longitude
      });

      if (error) throw error;

      await fetchMarkers();
      Alert.alert('Success', 'Marker status updated successfully');
    } catch (err) {
      console.error('Error confirming marker:', err);
      Alert.alert('Error', 'Failed to update marker status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarkerContext.Provider
      value={{
        markers,
        isAddingMarker,
        isUploading,
        clearAllMarkers,
        setIsAddingMarker,
        addMarker,
        refreshMarkers: fetchMarkers,
        confirmMarker,
        loading,
        error
      }}
    >
      {children}
    </MarkerContext.Provider>
  );
};