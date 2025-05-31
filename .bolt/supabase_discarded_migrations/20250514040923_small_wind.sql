/*
  # Clear recent markers (last 35 minutes)
  
  1. Changes
    - Updates all active ICE and Observer markers to inactive status
    - Only affects markers created within the last 35 minutes
    - Preserves marker data for historical records
    - Sets last_status_change to current timestamp
    
  2. Security
    - Maintains existing RLS policies
    - No changes to permissions
*/

-- Update all active ICE and Observer markers to inactive
UPDATE markers
SET 
  active = false,
  last_status_change = NOW()
WHERE 
  active = true
  AND (category = 'ice' OR category = 'observer')
  AND created_at >= NOW() - INTERVAL '35 minutes';

-- Log the number of markers affected
DO $$ 
DECLARE
  affected_count integer;
BEGIN
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RAISE NOTICE 'Cleared % recent markers from the last 35 minutes', affected_count;
END $$;

-- Also clear map2_markers if they exist
DO $$ 
BEGIN
  -- Check if the map2_markers table exists
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'map2_markers'
  ) THEN
    -- Update map2_markers
    EXECUTE '
      UPDATE map2_markers
      SET 
        active = false,
        last_status_change = NOW()
      WHERE 
        active = true
        AND (category = ''ice'' OR category = ''observer'')
        AND created_at >= NOW() - INTERVAL ''35 minutes''
    ';
  END IF;
END $$;