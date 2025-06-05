-- Enable RLS on markers table if not already enabled
ALTER TABLE markers ENABLE ROW LEVEL SECURITY;

-- Create policy for deactivating own markers
CREATE POLICY delete_own_markers ON markers
    FOR UPDATE
    USING (created_by_ip = current_setting('request.headers')::json->>'cf-connecting-ip')
    WITH CHECK (created_by_ip = current_setting('request.headers')::json->>'cf-connecting-ip');

-- Function to delete a user's markers based on their IP address
CREATE OR REPLACE FUNCTION delete_user_markers()
RETURNS void AS $$
DECLARE
  user_ip text;
BEGIN
  -- Get the user's IP address from the request headers
  user_ip := current_setting('request.headers')::json->>'cf-connecting-ip';
  
  -- Fallback to X-Real-IP if CF-Connecting-IP is not available
  IF user_ip IS NULL THEN
    user_ip := current_setting('request.headers')::json->>'x-real-ip';
  END IF;

  IF user_ip IS NULL THEN
    RAISE EXCEPTION 'Unable to determine user IP address';
  END IF;
  
  -- Update markers to inactive where the IP matches
  UPDATE markers
  SET active = false
  WHERE created_by_ip = user_ip;
  
  -- Note: We don't actually delete the markers, just deactivate them
  -- This helps prevent abuse while respecting user privacy
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon roles
GRANT EXECUTE ON FUNCTION delete_user_markers() TO authenticated, anon;

-- Create API endpoint for the function
COMMENT ON FUNCTION delete_user_markers IS 'Deactivates all markers created by the current user''s IP address';

-- Example of how to call this function:
-- SELECT delete_user_markers(); 