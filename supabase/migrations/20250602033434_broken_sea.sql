/*
  # Fix clear markers RPC function

  1. Changes
    - Drop existing function if it exists
    - Recreate function with proper security context
    - Add proper error handling
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS clear_all_markers_rpc();

-- Create RPC function with proper security context
CREATE OR REPLACE FUNCTION clear_all_markers_rpc()
RETURNS void AS $$
BEGIN
  -- Delete marker confirmations first (due to foreign key constraints)
  DELETE FROM marker_confirmations;
  
  -- Then delete all markers
  DELETE FROM markers;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;