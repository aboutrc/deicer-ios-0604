/*
  # Add marker statistics function and indexes

  1. New Functions
    - `get_marker_counts_by_category()` - Returns statistics about markers by category
  
  2. New Indexes
    - `idx_markers_created_at_category` - For faster queries on markers by creation date and category
    - `idx_markers_image_url` - For faster queries on markers with images
*/

-- Create a function to get marker counts by category
CREATE OR REPLACE FUNCTION get_marker_counts_by_category()
RETURNS TABLE (
  category TEXT,
  total_count BIGINT,
  active_count BIGINT,
  inactive_count BIGINT,
  last_24h_count BIGINT
) 
LANGUAGE SQL
AS $$
  SELECT 
    category,
    COUNT(*) AS total_count,
    COUNT(*) FILTER (WHERE active = true) AS active_count,
    COUNT(*) FILTER (WHERE active = false) AS inactive_count,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') AS last_24h_count
  FROM markers
  GROUP BY category
  ORDER BY total_count DESC;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION get_marker_counts_by_category() TO anon, authenticated, service_role;

-- Add index to improve performance of time-based queries
CREATE INDEX IF NOT EXISTS idx_markers_created_at_category
ON markers (created_at, category);

-- Add index for image URL queries
CREATE INDEX IF NOT EXISTS idx_markers_image_url
ON markers (image_url)
WHERE image_url IS NOT NULL;