/*
  # Delete all markers
  
  1. Changes
    - Deletes all markers from the markers table
    - Deletes all markers from map2_markers table if it exists
    
  2. Security
    - No changes to RLS policies
    
  3. Notes
    - This is a destructive operation that removes all markers
    - Both active and inactive markers are removed
*/

-- Delete all markers from the main markers table
DELETE FROM markers;

-- Log the number of markers deleted
DO $$ 
DECLARE
  deleted_count integer;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % markers from markers table', deleted_count;
END $$;

-- Delete from map2_markers if it exists
DO $$ 
BEGIN
  -- Check if the map2_markers table exists
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'map2_markers'
  ) THEN
    -- Delete all markers from map2_markers
    EXECUTE 'DELETE FROM map2_markers';
  END IF;
END $$;