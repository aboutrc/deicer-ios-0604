/*
  # Add marker expiration handling

  1. Changes
    - Add expiration_time column to markers table
    - Add function to automatically set expiration time based on category
    - Add function to clean up expired markers
    - Add trigger to set expiration time on insert

  2. Security
    - Maintain existing RLS policies
*/

-- Add expiration_time column
ALTER TABLE public.markers
ADD COLUMN expiration_time timestamptz;

-- Function to set expiration time based on category
CREATE OR REPLACE FUNCTION public.set_marker_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Observer markers expire after 1 hour
  -- ICE markers expire after 24 hours
  NEW.expiration_time := CASE
    WHEN NEW.category = 'observer' THEN NOW() + INTERVAL '1 hour'
    WHEN NEW.category = 'ice' THEN NOW() + INTERVAL '24 hours'
    ELSE NULL
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set expiration time on insert
CREATE TRIGGER set_marker_expiration_trigger
  BEFORE INSERT ON public.markers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_marker_expiration();

-- Function to mark expired markers as inactive
CREATE OR REPLACE FUNCTION public.cleanup_expired_markers()
RETURNS void AS $$
BEGIN
  UPDATE public.markers
  SET active = false
  WHERE expiration_time < NOW() AND active = true;
END;
$$ LANGUAGE plpgsql;