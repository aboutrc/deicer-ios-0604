import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get the public URL for a marker image
export const getMarkerImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) return '';
  
  // If it's already a full URL, return it
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Get the public URL from Supabase storage
  const { data: { publicUrl } } = supabase.storage
    .from('pin-markers-images')
    .getPublicUrl(imageUrl);
    
  return publicUrl;
};

// Function to fetch markers within a radius
export const fetchMarkersWithinRadius = async (
  lat: number,
  lng: number,
  radiusMiles: number = 50
) => {
  try {
    const { data, error } = await supabase.rpc('get_markers_within_radius', {
      p_latitude: lat,
      p_longitude: lng,
      p_radius_miles: radiusMiles
    });

    if (error) throw error;

    return {
      markers: data.map((marker: any) => ({
        id: marker.id,
        position: {
          lat: marker.latitude,
          lng: marker.longitude
        },
        category: marker.category,
        createdAt: new Date(marker.created_at),
        active: marker.active,
        imageUrl: marker.image_url,
        lastConfirmed: marker.last_confirmed ? new Date(marker.last_confirmed) : undefined,
        reliability_score: marker.reliability_score,
        negative_confirmations: marker.negative_confirmations
      }))
    };
  } catch (err) {
    console.error('Error fetching markers:', err);
    throw err;
  }
};