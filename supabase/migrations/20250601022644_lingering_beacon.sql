/*
  # Clean up markers and reset test environment

  1. Changes
    - Add function to delete all markers
    - Add function to reset database state
    - Add function to verify database is clean
*/

-- Function to delete all markers
CREATE OR REPLACE FUNCTION delete_all_markers()
RETURNS void AS $$
BEGIN
  DELETE FROM markers;
END;
$$ LANGUAGE plpgsql;

-- Function to verify database is clean
CREATE OR REPLACE FUNCTION verify_clean_database()
RETURNS TABLE (
  marker_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)::bigint FROM markers;
END;
$$ LANGUAGE plpgsql;

-- Function to reset database state
CREATE OR REPLACE FUNCTION reset_database()
RETURNS void AS $$
BEGIN
  -- Delete all existing markers
  PERFORM delete_all_markers();
END;
$$ LANGUAGE plpgsql;