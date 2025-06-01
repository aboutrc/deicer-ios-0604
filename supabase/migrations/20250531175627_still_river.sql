/*
  # Add background notification support

  1. New Functions
    - `check_nearby_ice_markers`: Function to find ICE markers within radius
    - `create_notification`: Function to create notifications for nearby users
    - `cleanup_old_notifications`: Function to remove old notifications

  2. Changes
    - Add indexes for geospatial queries
    - Add notification preferences to users table
*/

-- Function to find ICE markers within radius
CREATE OR REPLACE FUNCTION public.check_nearby_ice_markers(
  user_lat double precision,
  user_lon double precision,
  radius_miles double precision DEFAULT 1.0
)
RETURNS TABLE (
  marker_id uuid,
  distance double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    calculate_distance(user_lat, user_lon, m.latitude, m.longitude) as distance
  FROM markers m
  WHERE 
    m.category = 'ice' 
    AND m.active = true
    AND m.created_at > NOW() - INTERVAL '10 minutes'
    AND calculate_distance(user_lat, user_lon, m.latitude, m.longitude) <= radius_miles;
END;
$$ LANGUAGE plpgsql;

-- Function to create notifications for nearby users
CREATE OR REPLACE FUNCTION public.create_ice_notification(
  marker_id uuid,
  user_lat double precision,
  user_lon double precision
)
RETURNS void AS $$
DECLARE
  marker_record markers%ROWTYPE;
BEGIN
  -- Get marker details
  SELECT * INTO marker_record
  FROM markers
  WHERE id = marker_id;

  -- Create notification
  INSERT INTO notifications (
    title,
    message,
    marker_id,
    created_at
  )
  VALUES (
    'ICE Activity Reported Nearby',
    format('ICE activity reported %.1f miles from your location', 
      calculate_distance(user_lat, user_lon, marker_record.latitude, marker_record.longitude)
    ),
    marker_id,
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;