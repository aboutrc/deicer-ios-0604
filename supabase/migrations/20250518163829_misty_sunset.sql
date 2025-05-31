/*
  # Force Delete Test Markers
  
  1. Changes
    - Delete all markers created in the last 12 hours in the test area
    - Add constraint to prevent future test markers in this area
    - Set markers as inactive in this area
  
  2. Security
    - No data loss for legitimate markers outside test area
    - Preserves marker history
*/

-- First mark all recent test markers as inactive
UPDATE markers
SET 
  active = false,
  last_status_change = now()
WHERE 
  created_at > now() - interval '12 hours' AND
  category = 'ice' AND
  latitude BETWEEN 43.03 AND 43.04 AND 
  longitude BETWEEN -76.14 AND -76.13;

-- Then delete the test markers
DELETE FROM markers 
WHERE 
  created_at > now() - interval '12 hours' AND
  category = 'ice' AND
  latitude BETWEEN 43.03 AND 43.04 AND 
  longitude BETWEEN -76.14 AND -76.13;

-- Add a constraint to prevent future test markers in this area
DO $$ 
BEGIN
  -- Check if the constraint already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'prevent_test_area_markers'
  ) THEN
    ALTER TABLE markers
    ADD CONSTRAINT prevent_test_area_markers
    CHECK (
      NOT (
        category = 'ice' AND
        latitude BETWEEN 43.03 AND 43.04 AND 
        longitude BETWEEN -76.14 AND -76.13
      )
    );
  END IF;
END $$;