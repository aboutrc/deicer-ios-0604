/*
  # Update existing markers expiration status

  1. Changes
    - Updates all existing ICE markers to be archived if they are older than 24 hours
    - Sets active=false for expired ICE markers
    - Preserves observer markers as they have different expiration rules
    - Updates last_status_change timestamp for affected markers

  2. Security
    - No changes to RLS policies
    - Maintains existing security model
*/

-- Update existing ICE markers older than 24 hours to archived status
DO $$ 
BEGIN
  -- Update ICE markers older than 24 hours
  UPDATE markers
  SET 
    active = false,
    last_status_change = CURRENT_TIMESTAMP
  WHERE 
    category = 'ice' 
    AND created_at < (CURRENT_TIMESTAMP - INTERVAL '24 hours')
    AND active = true;

  -- Log the number of updated markers
  RAISE NOTICE 'Updated % ICE markers to archived status', 
    (SELECT count(*) FROM markers WHERE category = 'ice' AND active = false);
END $$;