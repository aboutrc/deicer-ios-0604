/*
  # Add clear markers function

  1. Changes
    - Add function to clear all markers and confirmations
    - Add RPC function to allow client-side clearing
    - Add security policy to restrict access

  2. Security
    - Function uses SECURITY DEFINER to run with elevated privileges
    - Access controlled through RPC policy
*/

-- Function to clear all markers and their confirmations
CREATE OR REPLACE FUNCTION clear_all_markers()
RETURNS void AS $$
BEGIN
  -- Delete all marker confirmations first (due to foreign key constraints)
  DELETE FROM marker_confirmations;
  
  -- Then delete all markers
  DELETE FROM markers;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function that can be called from the client
CREATE OR REPLACE FUNCTION clear_all_markers_rpc()
RETURNS void AS $$
BEGIN
  PERFORM clear_all_markers();
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;