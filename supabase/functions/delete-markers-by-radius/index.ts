import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Calculate distance between two points in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Convert miles to kilometers
function milesToKm(miles: number): number {
  return miles * 1.60934;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow DELETE method
    if (req.method !== 'DELETE') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Parse request body to get parameters
    const { latitude, longitude, radiusMiles, limit, dryRun } = await req.json();
    
    // Validate parameters
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      return new Response(
        JSON.stringify({ error: 'Valid latitude and longitude are required' }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    const radius = radiusMiles && !isNaN(radiusMiles) ? parseFloat(radiusMiles) : 1.0; // Default to 1 mile
    const radiusKm = milesToKm(radius);
    const deleteLimit = limit && !isNaN(limit) ? parseInt(limit) : 100;
    const isDryRun = dryRun === true;
    
    console.log(`Deleting markers within ${radius} miles (${radiusKm.toFixed(2)} km) of [${latitude}, ${longitude}]`);
    
    // First, get all markers
    const { data: allMarkers, error: fetchError } = await supabase
      .from('pin-markers')
      .select('id, category, created_at, latitude, longitude')
      .limit(1000); // Get a large batch to filter locally
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!allMarkers || allMarkers.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No markers found in the database',
          markers: [],
          dryRun: isDryRun
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Filter markers within the radius
    const markersInRadius = allMarkers.filter(marker => {
      const distance = calculateDistance(
        latitude, 
        longitude, 
        marker.latitude, 
        marker.longitude
      );
      return distance <= radiusKm;
    }).slice(0, deleteLimit); // Apply limit after filtering
    
    console.log(`Found ${markersInRadius.length} markers within ${radius} miles radius`);
    
    // If it's a dry run, just return the markers that would be deleted
    if (isDryRun) {
      return new Response(
        JSON.stringify({
          message: `Dry run - would delete ${markersInRadius.length} markers within ${radius} miles of your location`,
          markers: markersInRadius,
          dryRun: true
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // If not a dry run, actually delete the markers
    if (markersInRadius.length > 0) {
      const markerIds = markersInRadius.map(marker => marker.id);
      
      const { error: deleteError } = await supabase
        .from('pin-markers')
        .delete()
        .in('id', markerIds);
      
      if (deleteError) {
        throw deleteError;
      }
      
      return new Response(
        JSON.stringify({
          message: `Successfully deleted ${markersInRadius.length} markers within ${radius} miles of your location`,
          deletedMarkers: markersInRadius,
          dryRun: false
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          message: `No markers found within ${radius} miles of your location`,
          deletedMarkers: [],
          dryRun: false
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});