-- First clean up all existing data and functions
SELECT reset_database_state();

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS check_marker_expiration_trigger ON markers;
DROP TRIGGER IF EXISTS check_marker_expiration_insert_trigger ON markers;
DROP TRIGGER IF EXISTS set_marker_expiration_trigger ON markers;

DROP FUNCTION IF EXISTS set_marker_expiration();
DROP FUNCTION IF EXISTS check_marker_expiration();
DROP FUNCTION IF EXISTS create_test_markers();
DROP FUNCTION IF EXISTS verify_expired_markers();

-- Function to set marker expiration time
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

-- Function to create test markers
CREATE OR REPLACE FUNCTION create_test_markers()
RETURNS void AS $$
BEGIN
  -- Create observer markers that should expire (created 2 hours ago)
  INSERT INTO markers (
    title,
    description,
    category,
    latitude,
    longitude,
    created_at,
    active
  ) VALUES (
    'Test Observer Pin - Should Expire',
    'Created 2 hours ago',
    'observer',
    40.7128,
    -74.0060,
    NOW() - INTERVAL '2 hours',
    true
  );

  -- Create observer markers that should not expire (created 30 mins ago)
  INSERT INTO markers (
    title,
    description,
    category,
    latitude,
    longitude,
    created_at,
    active
  ) VALUES (
    'Test Observer Pin - Should Not Expire',
    'Created 30 minutes ago',
    'observer',
    40.7128,
    -74.0060,
    NOW() - INTERVAL '30 minutes',
    true
  );

  -- Create ICE markers that should expire (created 25 hours ago)
  INSERT INTO markers (
    title,
    description,
    category,
    latitude,
    longitude,
    created_at,
    active
  ) VALUES (
    'Test ICE Pin - Should Expire',
    'Created 25 hours ago',
    'ice',
    40.7128,
    -74.0060,
    NOW() - INTERVAL '25 hours',
    true
  );

  -- Create ICE markers that should not expire (created 23 hours ago)
  INSERT INTO markers (
    title,
    description,
    category,
    latitude,
    longitude,
    created_at,
    active
  ) VALUES (
    'Test ICE Pin - Should Not Expire',
    'Created 23 hours ago',
    'ice',
    40.7128,
    -74.0060,
    NOW() - INTERVAL '23 hours',
    true
  );
END;
$$ LANGUAGE plpgsql;

-- Function to verify expired markers
CREATE OR REPLACE FUNCTION verify_expired_markers()
RETURNS TABLE (
  title text,
  category text,
  created_at timestamptz,
  expiration_time timestamptz,
  should_be_expired boolean,
  is_expired boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.title,
    m.category,
    m.created_at,
    m.expiration_time,
    CASE 
      WHEN m.category = 'observer' THEN m.created_at + INTERVAL '1 hour' < NOW()
      WHEN m.category = 'ice' THEN m.created_at + INTERVAL '24 hours' < NOW()
    END as should_be_expired,
    NOT m.active as is_expired
  FROM markers m
  WHERE m.title LIKE 'Test%'
  ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql;