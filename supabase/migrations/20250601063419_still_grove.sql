/*
  # Fix test markers cleanup and add clear markers function

  1. Changes
    - Add function to clear all test markers
    - Add function to clear all markers with proper trigger handling
    - Add RPC function for client access
    - Add verification functions

  2. Security
    - Maintain existing RLS policies
    - Use SECURITY DEFINER for RPC functions
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS clear_all_markers_rpc();
DROP FUNCTION IF EXISTS clear_all_markers();
DROP FUNCTION IF EXISTS verify_markers_cleared();
DROP FUNCTION IF EXISTS cleanup_test_markers();

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

-- Function to clear test markers specifically
CREATE OR REPLACE FUNCTION cleanup_test_markers()
RETURNS void AS $$
BEGIN
  -- Disable triggers temporarily
  ALTER TABLE markers DISABLE TRIGGER ALL;
  ALTER TABLE marker_confirmations DISABLE TRIGGER ALL;

  -- Delete confirmations for test markers
  DELETE FROM marker_confirmations
  WHERE marker_id IN (SELECT id FROM markers WHERE title LIKE 'Test%');
  
  -- Delete test markers
  DELETE FROM markers WHERE title LIKE 'Test%';

  -- Re-enable triggers
  ALTER TABLE markers ENABLE TRIGGER ALL;
  ALTER TABLE marker_confirmations ENABLE TRIGGER ALL;
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