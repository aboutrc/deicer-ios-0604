/*
  # Clean up test markers

  1. Changes
    - Add function to clean up test markers
    - Execute cleanup immediately
*/

-- Function to clean up test markers
CREATE OR REPLACE FUNCTION cleanup_test_markers()
RETURNS void AS $$
BEGIN
  -- Delete confirmations for test markers first
  DELETE FROM marker_confirmations
  WHERE marker_id IN (SELECT id FROM markers WHERE title LIKE 'Test%');
  
  -- Then delete test markers
  DELETE FROM markers WHERE title LIKE 'Test%';
END;
$$ LANGUAGE plpgsql;

-- Execute cleanup immediately
SELECT cleanup_test_markers();