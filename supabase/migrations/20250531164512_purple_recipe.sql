/*
  # Add force delete function for info cards
  
  This migration adds a PostgreSQL function to force delete info cards,
  ensuring a more robust deletion process.
*/

-- Create a function to force delete an info card
CREATE OR REPLACE FUNCTION force_delete_info_card(card_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the record with explicit locking
  DELETE FROM info_cards
  WHERE id = card_id;
  
  -- If no rows were deleted, the card doesn't exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Card not found or already deleted';
  END IF;
  
  -- Ensure transaction is committed
  COMMIT;
END;
$$;