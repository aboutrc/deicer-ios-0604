import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file and ensure both EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.');
}

// Create Supabase client with storage-only configuration and additional security options
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'deicer-ios-app'
    }
  },
  db: {
    schema: 'public'
  }
});

// Function to get the public URL for a marker image
export const getMarkerImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) return '';
  
  // If it's already a full URL, try to extract the filename
  if (imageUrl.startsWith('http')) {
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1];
    // Get the public URL from Supabase storage using the pin-markers-images bucket
    const { data: { publicUrl } } = supabase.storage
      .from('pin-markers-images')
      .getPublicUrl(filename);
    return publicUrl;
  }
  
  // Get the public URL from Supabase storage using the pin-markers-images bucket
  const { data: { publicUrl } } = supabase.storage
    .from('pin-markers-images')
    .getPublicUrl(imageUrl);
    
  return publicUrl;
};

// Function to move an image from pin-markers to pin-markers-images
export const moveImageToPinMarkersImages = async (filename: string): Promise<boolean> => {
  try {
    // Download from source bucket
    const { data, error: downloadError } = await supabase.storage
      .from('pin-markers')
      .download(`/${filename}`);

    if (downloadError || !data) {
      console.error('Error downloading image:', downloadError);
      return false;
    }

    // Upload to destination bucket
    const { error: uploadError } = await supabase.storage
      .from('pin-markers-images')
      .upload(filename, data, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading to new bucket:', uploadError);
      return false;
    }

    // Delete from source bucket (only if upload was successful)
    const { error: deleteError } = await supabase.storage
      .from('pin-markers')
      .remove([`/${filename}`]);

    if (deleteError) {
      console.error('Error deleting from old bucket:', deleteError);
      // Don't return false here as the move was technically successful
    }

    return true;
  } catch (error) {
    console.error('Error moving image:', error);
    return false;
  }
};