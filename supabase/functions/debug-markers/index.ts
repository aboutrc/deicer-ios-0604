import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    // Get recent markers (last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { data: recentMarkers, error: markersError } = await supabase
      .from('pin-markers')
      .select('*')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false });
      
    if (markersError) {
      throw markersError;
    }
    
    // Get recent confirmations
    const { data: recentConfirmations, error: confirmationsError } = await supabase
      .from('marker_confirmations')
      .select('*')
      .gte('confirmed_at', twentyFourHoursAgo.toISOString())
      .order('confirmed_at', { ascending: false });
      
    if (confirmationsError) {
      throw confirmationsError;
    }
    
    // Get marker counts by category
    const { data: categoryCounts, error: categoryError } = await supabase
      .rpc('get_marker_counts_by_category');
      
    if (categoryError) {
      throw categoryError;
    }
    
    // Get active vs inactive counts
    const { data: activeCount, error: activeError } = await supabase
      .from('pin-markers')
      .select('count')
      .eq('active', true);
      
    const { data: inactiveCount, error: inactiveError } = await supabase
      .from('pin-markers')
      .select('count')
      .eq('active', false);
      
    if (activeError || inactiveError) {
      throw activeError || inactiveError;
    }

    return new Response(
      JSON.stringify({
        recentMarkers: recentMarkers || [],
        recentConfirmations: recentConfirmations || [],
        categoryCounts: categoryCounts || [],
        activeCount: activeCount?.[0]?.count || 0,
        inactiveCount: inactiveCount?.[0]?.count || 0,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
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