/*
  # Fix marker expiration logic

  1. Changes
    - Drop existing triggers and functions
    - Rewrite expiration logic to use expiration_time column
    - Add automatic cleanup of expired markers
    - Fix trigger execution order
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS set_marker_expiration_trigger ON markers;
DROP TRIGGER IF EXISTS check_marker_expiration_trigger ON markers;
DROP TRIGGER IF EXISTS check_marker_expiration_insert_trigger ON markers;

DROP FUNCTION IF EXISTS set_marker_expiration();
DROP FUNCTION IF EXISTS should_marker_expire(markers);
DROP FUNCTION IF EXISTS check_marker_expiration();
DROP FUNCTION IF EXISTS cleanup_expired_markers();
DROP FUNCTION IF EXISTS cleanup_markers_rpc();

-- Function to set marker expiration time
CREATE OR REPLACE FUNCTION set_marker_expiration()
RETURNS trigger AS $$
BEGIN
  -- Set expiration time based on category
  NEW.expiration_time := CASE
    WHEN NEW.category = 'observer' THEN NEW.created_at + INTERVAL '1 hour'
    WHEN NEW.category = 'ice' THEN NEW.created_at + INTERVAL '24 hours'
    ELSE NULL
  END;
  
  -- Check if marker should be expired immediately
  IF NEW.expiration_time <= NOW() THEN
    NEW.active := false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check marker expiration
CREATE OR REPLACE FUNCTION check_marker_expiration()
RETURNS trigger AS $$
BEGIN
  -- Check if marker should be expired
  IF NEW.expiration_time <= NOW() THEN
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

-- Create trigger to check expiration on update
CREATE TRIGGER check_marker_expiration_trigger
  BEFORE UPDATE ON markers
  FOR EACH ROW
  EXECUTE FUNCTION check_marker_expiration();

-- Function to manually cleanup expired markers
CREATE OR REPLACE FUNCTION cleanup_expired_markers()
RETURNS void AS $$
BEGIN
  UPDATE markers
  SET active = false
  WHERE active = true 
    AND expiration_time <= NOW();
END;
$$ LANGUAGE plpgsql;