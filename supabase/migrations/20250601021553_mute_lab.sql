/*
  # Add marker expiration handling without cron dependency
  
  1. Functions
    - `should_marker_expire`: Determines if a marker should be expired based on its category
    - `check_marker_expiration`: Trigger function to check and update marker status
    - `cleanup_expired_markers`: Manual cleanup function for expired markers
    
  2. Triggers
    - Add trigger to check expiration on every update
    - Add trigger to check expiration on insert
*/

-- Function to check if a marker should be expired
CREATE OR REPLACE FUNCTION should_marker_expire(
  marker_record markers
) RETURNS boolean AS $$
BEGIN
  RETURN (
    CASE
      WHEN marker_record.category = 'observer' AND 
           marker_record.created_at + INTERVAL '1 hour' < NOW() THEN true
      WHEN marker_record.category = 'ice' AND 
           marker_record.created_at + INTERVAL '24 hours' < NOW() THEN true
      ELSE false
    END
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check and update marker status
CREATE OR REPLACE FUNCTION check_marker_expiration()
RETURNS trigger AS $$
BEGIN
  IF should_marker_expire(NEW) THEN
    NEW.active := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check expiration on every update
CREATE TRIGGER check_marker_expiration_trigger
  BEFORE UPDATE ON markers
  FOR EACH ROW
  EXECUTE FUNCTION check_marker_expiration();

-- Create trigger to check expiration on insert
CREATE TRIGGER check_marker_expiration_insert_trigger
  BEFORE INSERT ON markers
  FOR EACH ROW
  EXECUTE FUNCTION check_marker_expiration();

-- Function to clean up expired markers
CREATE OR REPLACE FUNCTION cleanup_expired_markers()
RETURNS void AS $$
BEGIN
  UPDATE markers
  SET active = false
  WHERE active = true AND should_marker_expire(markers.*);
END;
$$ LANGUAGE plpgsql;

-- Create function to cleanup markers that can be called via RPC
CREATE OR REPLACE FUNCTION cleanup_markers_rpc()
RETURNS void AS $$
BEGIN
  PERFORM cleanup_expired_markers();
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;