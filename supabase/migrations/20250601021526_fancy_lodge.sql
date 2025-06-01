/*
  # Add automatic marker cleanup

  1. Changes
    - Add function to check and update expired markers
    - Add trigger to automatically run cleanup on marker changes
    - Add function to periodically clean up expired markers
    
  2. Security
    - Maintain existing RLS policies
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

-- Function to clean up expired markers
CREATE OR REPLACE FUNCTION cleanup_expired_markers()
RETURNS void AS $$
BEGIN
  UPDATE markers
  SET active = false
  WHERE active = true AND should_marker_expire(markers.*);
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run cleanup every minute
SELECT cron.schedule(
  'cleanup-expired-markers',  -- name of the cron job
  '* * * * *',              -- run every minute
  'SELECT cleanup_expired_markers()'
);