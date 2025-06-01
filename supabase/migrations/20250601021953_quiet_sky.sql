/*
  # Fix marker expiration triggers

  1. Changes
    - Update should_marker_expire function to use expiration_time instead of created_at
    - Add trigger to set expiration time on insert
    - Update check_marker_expiration function to properly handle expiration
*/

-- Drop existing triggers first
DROP TRIGGER IF EXISTS check_marker_expiration_trigger ON markers;
DROP TRIGGER IF EXISTS check_marker_expiration_insert_trigger ON markers;

-- Function to set marker expiration time
CREATE OR REPLACE FUNCTION set_marker_expiration()
RETURNS trigger AS $$
BEGIN
  NEW.expiration_time := CASE
    WHEN NEW.category = 'observer' THEN NOW() + INTERVAL '1 hour'
    WHEN NEW.category = 'ice' THEN NOW() + INTERVAL '24 hours'
    ELSE NULL
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a marker should be expired
CREATE OR REPLACE FUNCTION should_marker_expire(
  marker_record markers
) RETURNS boolean AS $$
BEGIN
  RETURN marker_record.expiration_time IS NOT NULL 
    AND marker_record.expiration_time < NOW();
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

-- Create trigger to set expiration time on insert
CREATE TRIGGER set_marker_expiration_trigger
  BEFORE INSERT ON markers
  FOR EACH ROW
  EXECUTE FUNCTION set_marker_expiration();

-- Create trigger to check expiration on insert
CREATE TRIGGER check_marker_expiration_insert_trigger
  BEFORE INSERT ON markers
  FOR EACH ROW
  EXECUTE FUNCTION check_marker_expiration();

-- Create trigger to check expiration on update
CREATE TRIGGER check_marker_expiration_trigger
  BEFORE UPDATE ON markers
  FOR EACH ROW
  EXECUTE FUNCTION check_marker_expiration();