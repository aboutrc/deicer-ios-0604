/*
  # Add marker cleanup function

  1. New Functions
    - `cleanup_old_markers`: Function to delete markers older than a specified number of days
    
  2. Security
    - Function is accessible only to authenticated users with service_role
    
  3. Indexes
    - Adds index on created_at for better performance when querying by date
*/

-- Create a function to delete old markers
CREATE OR REPLACE FUNCTION cleanup_old_markers(days_old INTEGER DEFAULT 7, max_markers INTEGER DEFAULT 100)
RETURNS TABLE (
  deleted_count BIGINT,
  deleted_markers JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cutoff_date TIMESTAMP WITH TIME ZONE;
  deleted_ids UUID[];
  deleted_data JSONB;
BEGIN
  -- Calculate the cutoff date
  cutoff_date := NOW() - (days_old || ' days')::INTERVAL;
  
  -- Get the IDs of markers to delete
  WITH markers_to_delete AS (
    SELECT id 
    FROM markers
    WHERE created_at < cutoff_date
    LIMIT max_markers
  )
  SELECT array_agg(id) INTO deleted_ids FROM markers_to_delete;
  
  -- Get the data of markers that will be deleted (for reporting)
  SELECT jsonb_agg(m) INTO deleted_data
  FROM markers m
  WHERE m.id = ANY(deleted_ids);
  
  -- Delete the markers
  DELETE FROM markers
  WHERE id = ANY(deleted_ids);
  
  -- Return the count and data of deleted markers
  RETURN QUERY SELECT 
    COALESCE(array_length(deleted_ids, 1), 0)::BIGINT AS deleted_count,
    COALESCE(deleted_data, '[]'::JSONB) AS deleted_markers;
END;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION cleanup_old_markers(INTEGER, INTEGER) TO service_role;

-- Add index for better performance when querying by created_at
CREATE INDEX IF NOT EXISTS idx_markers_created_at_for_cleanup
ON markers (created_at);