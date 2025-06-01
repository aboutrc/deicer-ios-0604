/*
  # Add test markers with different timestamps

  1. Changes
    - Add function to create test markers with specific timestamps
    - Add function to verify expired markers
*/

-- Function to create test markers with specific timestamps
CREATE OR REPLACE FUNCTION create_test_markers()
RETURNS void AS $$
BEGIN
  -- Create an observer marker that should be expired (created 2 hours ago)
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

  -- Create an observer marker that should not expire yet (created 30 mins ago)
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

  -- Create an ICE marker that should be expired (created 25 hours ago)
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

  -- Create an ICE marker that should not expire yet (created 23 hours ago)
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