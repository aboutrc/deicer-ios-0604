/*
  # Fix marker expiration triggers

  1. Changes
    - Drop existing triggers and functions
    - Recreate expiration time functions and triggers
    - Ensure proper order of operations
*/

-- First, drop all existing triggers and functions
DROP TRIGGER IF EXISTS set_marker_expiration_trigger ON markers;
DROP TRIGGER IF EXISTS check_marker_expiration_trigger ON markers;
DROP TRIGGER IF EXISTS check_marker_expiration_insert_trigger ON markers;

DROP FUNCTION IF EXISTS set_marker_expiration();
DROP FUNCTION IF EXISTS should_marker_expire(markers);
DROP FUNCTION IF EXISTS check_marker_expiration();

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

-- Create triggers in the correct order
CREATE TRIGGER set_marker_expiration_trigger
  BEFORE INSERT ON markers
  FOR EACH ROW
  EXECUTE FUNCTION set_marker_expiration();

CREATE TRIGGER check_marker_expiration_trigger
  BEFORE UPDATE ON markers
  FOR EACH ROW
  EXECUTE FUNCTION check_marker_expiration();

CREATE TRIGGER check_marker_expiration_insert_trigger
  BEFORE INSERT ON markers
  FOR EACH ROW
  EXECUTE FUNCTION check_marker_expiration();