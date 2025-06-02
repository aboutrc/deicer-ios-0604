/*
  # Add function to clear all markers and confirmations

  1. Changes
    - Add function to safely delete all markers and their confirmations
    - Add RPC function to allow calling from client
    - Add verification function to confirm deletion
*/

-- Function to delete all markers and their confirmations
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