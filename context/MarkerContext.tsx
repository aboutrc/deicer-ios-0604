import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Marker = Database['public']['Tables']['markers']['Row'];

interface MarkerContextType {
  markers: Marker[];
  isAddingMarker: boolean;
  setIsAddingMarker: (value: boolean) => void;
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

const MarkerContext = createContext<MarkerContextType | undefined>(undefined);

export const useMarkers = () => {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error('useMarkers must be used within a MarkerProvider');
  }
  return context;
};

interface MarkerProviderProps {
  children: ReactNode;
}

export const MarkerProvider = ({ children }: MarkerProviderProps) => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setMarkers(data || []);
    } catch (err) {
      console.error('Error fetching markers:', err);
      setError('Failed to load markers');
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `marker-${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('marker-images')
        .upload(filename, blob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('marker-images')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      return null;
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
      
      let imageUrl = null;
      if (imageUri) {
        imageUrl = await uploadImage(imageUri);
      }

      const { data, error } = await supabase
        .from('markers')
        .insert([{
          title: `${category.toUpperCase()} Marker`,
          description: `New ${category} marker`,
          category,
          latitude,
          longitude,
          image_url: imageUrl
        }])
        .select()
        .single();

      if (error) throw error;

      // Fetch all markers to ensure we have the latest data
      await fetchMarkers();
      
      Alert.alert('Success', `${category.toUpperCase()} marker added successfully`);
    } catch (err) {
      console.error('Error adding marker:', err);
      Alert.alert('Error', 'Failed to add marker');
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

      // Refresh markers after confirmation
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