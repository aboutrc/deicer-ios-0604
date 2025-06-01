/*
  # Fix marker expiration triggers

  1. Changes
    - Drop existing triggers and functions
    - Recreate expiration handling with proper timing
    - Fix expiration calculation to use created_at timestamp
    - Add immediate expiration check on insert
*/

-- Drop existing triggers first
DROP TRIGGER IF EXISTS check_marker_expiration_trigger ON markers;
DROP TRIGGER IF EXISTS check_marker_expiration_insert_trigger ON markers;
DROP TRIGGER IF EXISTS set_marker_expiration_trigger ON markers;

DROP FUNCTION IF EXISTS set_marker_expiration();
DROP FUNCTION IF EXISTS should_marker_expire(markers);
DROP FUNCTION IF EXISTS check_marker_expiration();

-- Function to set marker expiration time and check initial status
CREATE OR REPLACE FUNCTION set_marker_expiration()
RETURNS trigger AS $$
BEGIN
  -- Set expiration time based on category and created_at
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