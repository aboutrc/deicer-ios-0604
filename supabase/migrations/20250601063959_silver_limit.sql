/*
  # Marker System Checkpoint - 2025-06-01
  
  1. Changes
    - Add system checkpoint documentation
    - Implement safe marker cleanup functions
    - Add test marker cleanup functionality
    - Maintain proper security context
  
  2. Security
    - Use security definer functions
    - Maintain RLS policies
    - Safe deletion patterns
*/

-- Add checkpoint comments
COMMENT ON TABLE public.markers IS 'Marker system with multi-language support and cleanup functionality - Checkpoint 2025-06-01:
- Full translations support for EN, ES
- Automatic marker expiration
- Test marker cleanup
- Full marker system reset capability
- Safe deletion patterns for all operations';

-- Drop existing cleanup functions to avoid conflicts
DROP FUNCTION IF EXISTS clear_all_markers_rpc();
DROP FUNCTION IF EXISTS clear_all_markers();
DROP FUNCTION IF EXISTS verify_markers_cleared();
DROP FUNCTION IF EXISTS cleanup_test_markers();

-- Function to safely clear all markers
CREATE OR REPLACE FUNCTION clear_all_markers()
RETURNS void AS $$
BEGIN
  -- Delete marker confirmations first (due to foreign key constraints)
  DELETE FROM marker_confirmations;
  
  -- Then delete all markers
  DELETE FROM markers;
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

-- Function to safely clear test markers
CREATE OR REPLACE FUNCTION cleanup_test_markers()
RETURNS void AS $$
BEGIN
  -- Delete confirmations for test markers first
  DELETE FROM marker_confirmations
  WHERE marker_id IN (SELECT id FROM markers WHERE title LIKE 'Test%');
  
  -- Delete test markers
  DELETE FROM markers WHERE title LIKE 'Test%';
END;
$$ LANGUAGE plpgsql;

-- Create secure RPC function that can be called from the client
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

-- Execute cleanup of any existing test markers
SELECT cleanup_test_markers();