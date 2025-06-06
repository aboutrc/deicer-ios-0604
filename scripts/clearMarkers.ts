import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lrhqwvkxjrfbqvzxcwlr.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearMarkers() {
  try {
    // Delete all records from marker_confirmations first (due to foreign key constraints)
    const { error: confirmationsError } = await supabase
      .from('marker_confirmations')
      .delete()
      .neq('id', ''); // This will match all records

    if (confirmationsError) {
      console.error('Error deleting marker confirmations:', confirmationsError);
      return;
    }

    // Delete all records from the markers table
    const { error: markersError } = await supabase
      .from('markers')
      .delete()
      .neq('id', ''); // This will match all records

    if (markersError) {
      console.error('Error deleting markers:', markersError);
      return;
    }

    // Delete all records from map2_marker_confirmations (due to foreign key constraints)
    const { error: map2ConfirmationsError } = await supabase
      .from('map2_marker_confirmations')
      .delete()
      .neq('id', ''); // This will match all records

    if (map2ConfirmationsError) {
      console.error('Error deleting map2 marker confirmations:', map2ConfirmationsError);
      return;
    }

    // Delete all records from the map2_markers table
    const { error: map2MarkersError } = await supabase
      .from('map2_markers')
      .delete()
      .neq('id', ''); // This will match all records

    if (map2MarkersError) {
      console.error('Error deleting map2 markers:', map2MarkersError);
      return;
    }

    // Delete all images from the storage buckets
    const { data: pinMarkersImagesFiles, error: pinMarkersImagesListError } = await supabase
      .storage
      .from('pin-markers-images')
      .list();

    if (pinMarkersImagesListError) {
      console.error('Error listing pin-markers-images files:', pinMarkersImagesListError);
    } else if (pinMarkersImagesFiles.length > 0) {
      const { error: deleteError } = await supabase
        .storage
        .from('pin-markers-images')
        .remove(pinMarkersImagesFiles.map(file => file.name));

      if (deleteError) {
        console.error('Error deleting pin-markers-images files:', deleteError);
      }
    }

    console.log('Successfully cleared all markers and associated images');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

clearMarkers(); 