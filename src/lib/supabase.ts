import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { Marker, MarkerCategory } from '../types';

// Get Supabase credentials from environment variables with debugging
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client with proper configuration
export const supabase = createClient<Database>( 
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js/2.39.7'
      }
    }
  }
);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase configuration missing:', {
      hasUrl: Boolean(supabaseUrl),
      hasKey: Boolean(supabaseAnonKey)
    });
    return false;
  }
  return true;
};

// Helper function to test Supabase connection with improved retries
export const testSupabaseConnection = async (retryCount = 0, maxRetries = 5) => {
  try {
    // Check if credentials exist
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, skipping connection test');
      return false;
    }

    // Test connection with a simple query
    const { data, error, status } = await supabase
      .from('markers')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    // Log response details for debugging
    console.debug('Supabase connection test response:', {
      status,
      hasData: Boolean(data),
      hasError: Boolean(error)
    });

    if (error) {
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Supabase connection test error:', err);
    
    // Network-related errors that should trigger retry
    const shouldRetry = (
      err instanceof Error && (
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError') ||
        err.message.includes('network request failed') ||
        err.message.includes('TypeError') ||
        err.message.includes('Network request failed') ||
        err.message.includes('upstream connect error')
      )
    );
    
    // Implement exponential backoff for retries
    if (shouldRetry && retryCount < maxRetries) {
      const baseDelay = 1000; // Start with 1 second
      const maxDelay = 10000; // Cap at 10 seconds
      const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
      
      console.log(`Retrying connection test in ${delay}ms (Attempt ${retryCount + 1}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return testSupabaseConnection(retryCount + 1, maxRetries);
    }
    
    return false;
  }
};

// Fetch existing markers within a radius
export const fetchMarkersWithinRadius = async(
  userLat: number,
  userLng: number,
  radiusMiles: number,
  category?: MarkerCategory
): Promise<{ markers: Marker[]; error: any }> => {
  console.log('fetchMarkersWithinRadius called with:', { userLat, userLng, radiusMiles, category });
  try {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, skipping marker fetch');
      return { markers: [], error: 'Supabase not configured' };
    }
    
    const radiusKm = milesToKm(radiusMiles);
    console.log(`Fetching markers within ${radiusMiles} miles (${radiusKm.toFixed(2)} km) of [${userLat.toFixed(6)}, ${userLng.toFixed(6)}]`);
    
    // Build query
    let query = supabase
      .from('markers')
      .select('*')
      .eq('active', true);
    
    // Add category filter if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    console.log('Supabase query response:', { 
      dataCount: data?.length || 0, 
      error: error ? error.message : null 
    });
    
    if (error) {
      console.error('Error fetching markers:', error);
      return { markers: [], error };
    }
    
    if (!data || data.length === 0) {
      console.log('No markers found in database');
      return { markers: [], error: null };
    }
    
    console.log('Raw marker data:', data);
    
    // Format the data to match the Marker interface
    const markers = data.map(marker => ({
      id: marker.id,
      position: { lat: marker.latitude, lng: marker.longitude },
      category: marker.category as MarkerCategory,
      createdAt: new Date(marker.created_at),
      imageUrl: marker.image_url || null,
      active: marker.active,
      lastConfirmed: marker.last_confirmed ? new Date(marker.last_confirmed) : undefined,
      reliability_score: marker.reliability_score,
      negative_confirmations: marker.negative_confirmations
    }));
    
    console.log('Formatted markers:', markers);
    return { markers, error: null };
  } catch (err) {
    console.error('Error fetching markers within radius:', err);
    return { markers: [], error: err };
  }
};

// Convert miles to kilometers
const milesToKm = (miles: number): number => {
  return miles * 1.60934;
};

// Helper function to get public URL for marker images
export const getMarkerImageUrl = (imageUrl: string | null): string | null => {
  if (!imageUrl) return null;
  
  try {
    // Check if the URL is already a full URL
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    } else {
      const { data } = supabase.storage.from('marker-images').getPublicUrl(imageUrl);
      return data.publicUrl;
    }
  } catch (err) {
    console.error('Error getting image URL:', err);
    return null;
  }
};