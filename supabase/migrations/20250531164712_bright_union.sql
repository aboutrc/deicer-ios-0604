/*
  # Fix delete function transaction handling
  
  Updates the force_delete_info_card function to properly handle transactions
  without explicit transaction control statements.
*/

CREATE OR REPLACE FUNCTION force_delete_info_card(card_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Delete the record and get number of affected rows
  WITH deleted AS (
    DELETE FROM info_cards
    WHERE id = card_id
    RETURNING id
  )
  SELECT COUNT(*) INTO affected_rows FROM deleted;
  
  -- If no rows were deleted, the card doesn't exist
  IF affected_rows = 0 THEN
    RAISE EXCEPTION 'Card not found or already deleted';
  END IF;
END;
$$;