/*
  # Add test cleanup function

  1. Changes
    - Add function to clean up test markers
    - Add function to reset test environment
*/

-- Function to clean up test markers
CREATE OR REPLACE FUNCTION cleanup_test_markers()
RETURNS void AS $$
BEGIN
  DELETE FROM markers 
  WHERE title LIKE 'Test%';
END;
$$ LANGUAGE plpgsql;

-- Function to reset test environment
CREATE OR REPLACE FUNCTION reset_test_environment()
RETURNS void AS $$
BEGIN
  -- First clean up any existing test markers
  PERFORM cleanup_test_markers();
  -- Then create new test markers
  PERFORM create_test_markers();
END;
$$ LANGUAGE plpgsql;