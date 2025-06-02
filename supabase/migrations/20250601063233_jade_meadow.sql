/*
  # Add marker clearing functionality
  
  1. Functions
    - `clear_all_markers`: Cleans up all markers and their confirmations
    - `verify_markers_cleared`: Verifies cleanup was successful
    - `clear_all_markers_rpc`: RPC function for client calls
    
  2. Changes
    - Drop existing function if it exists
    - Create new functions with proper security
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS clear_all_markers_rpc();
DROP FUNCTION IF EXISTS clear_all_markers();
DROP FUNCTION IF EXISTS verify_markers_cleared();

-- Function to clear all markers and their confirmations
CREATE OR REPLACE FUNCTION clear_all_markers()
RETURNS void AS $$
BEGIN
  -- First disable all triggers temporarily to prevent any side effects
  ALTER TABLE markers DISABLE TRIGGER ALL;
  ALTER TABLE marker_confirmations DISABLE TRIGGER ALL;

  -- Delete all marker confirmations first (due to foreign key constraints)
  DELETE FROM marker_confirmations;
  
  -- Then delete all markers
  DELETE FROM markers;

  -- Re-enable all triggers
  ALTER TABLE markers ENABLE TRIGGER ALL;
  ALTER TABLE marker_confirmations ENABLE TRIGGER ALL;
END;
$$ LANGUAGE plpgsql;

-- Function to verify markers are cleared
CREATE OR REPLACE FUNCTION verify_markers_cleared()
RETURNS TABLE (
  markers_count bigint,
  confirmations_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::bigint FROM markers) as markers_count,
    (SELECT COUNT(*)::bigint FROM marker_confirmations) as confirmations_count;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function that can be called from the client
CREATE OR REPLACE FUNCTION clear_all_markers_rpc()
RETURNS TABLE (
  success boolean,
  markers_remaining bigint,
  confirmations_remaining bigint
) AS $$
DECLARE
  verification record;
BEGIN
  -- Clear all markers
  PERFORM clear_all_markers();
  
  -- Verify cleanup
  SELECT * FROM verify_markers_cleared() INTO verification;
  
  RETURN QUERY
  SELECT 
    verification.markers_count = 0 AND verification.confirmations_count = 0,
    verification.markers_count,
    verification.confirmations_count;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;