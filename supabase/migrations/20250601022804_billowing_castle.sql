/*
  # Reset database state and clean up markers

  1. Changes
    - Add function to delete all markers and confirmations
    - Add function to verify database is clean
    - Add function to reset database state completely
*/

-- Function to delete all markers and their confirmations
CREATE OR REPLACE FUNCTION delete_all_markers_and_confirmations()
RETURNS void AS $$
BEGIN
  -- Delete all marker confirmations first (due to foreign key constraints)
  DELETE FROM marker_confirmations;
  
  -- Then delete all markers
  DELETE FROM markers;
END;
$$ LANGUAGE plpgsql;

-- Function to verify database is completely clean
CREATE OR REPLACE FUNCTION verify_database_clean()
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

-- Function to completely reset database state
CREATE OR REPLACE FUNCTION reset_database_state()
RETURNS void AS $$
BEGIN
  -- Delete all existing data
  PERFORM delete_all_markers_and_confirmations();
END;
$$ LANGUAGE plpgsql;