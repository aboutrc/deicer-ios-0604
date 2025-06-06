import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// The filename of the working image
const workingImage = 'marker-1749019123580-1eedl9d8gih.jpg';

async function moveImageToPinMarkersImages(filename) {
  try {
    console.log('Downloading from pin-markers bucket...');
    // Download from source bucket
    const { data, error: downloadError } = await supabase.storage
      .from('pin-markers')
      .download(`/${filename}`);

    if (downloadError || !data) {
      console.error('Error downloading image:', downloadError);
      return false;
    }

    console.log('Uploading to pin-markers-images bucket...');
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

    console.log('Deleting from pin-markers bucket...');
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
}

async function moveImages() {
  console.log('Moving images from pin-markers to pin-markers-images...');
  
  const success = await moveImageToPinMarkersImages(workingImage);
  
  if (success) {
    console.log('Successfully moved image:', workingImage);
  } else {
    console.error('Failed to move image:', workingImage);
  }
}

moveImages().catch(console.error); 