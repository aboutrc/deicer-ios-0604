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
    const { days, limit, dryRun } = await req.json();
    
    // Validate parameters
    const daysAgo = days && !isNaN(days) ? parseInt(days) : 7;
    const deleteLimit = limit && !isNaN(limit) ? parseInt(limit) : 100;
    const isDryRun = dryRun === true;
    
    // Calculate the cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    
    // First, get the markers that will be deleted
    const { data: markersToDelete, error: fetchError } = await supabase
      .from('pin-markers')
      .select('id, category, created_at, latitude, longitude')
      .lt('created_at', cutoffDate.toISOString())
      .limit(deleteLimit);
    
    if (fetchError) {
      throw fetchError;
    }
    
    // If it's a dry run, just return the markers that would be deleted
    if (isDryRun) {
      return new Response(
        JSON.stringify({
          message: `Dry run - would delete ${markersToDelete.length} markers older than ${daysAgo} days`,
          markers: markersToDelete,
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
    if (markersToDelete.length > 0) {
      const markerIds = markersToDelete.map(marker => marker.id);
      
      const { error: deleteError } = await supabase
        .from('pin-markers')
        .delete()
        .in('id', markerIds);
      
      if (deleteError) {
        throw deleteError;
      }
      
      return new Response(
        JSON.stringify({
          message: `Successfully deleted ${markersToDelete.length} markers older than ${daysAgo} days`,
          deletedMarkers: markersToDelete,
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
          message: `No markers found older than ${daysAgo} days`,
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