/*
  # Force delete specific info cards
  
  This migration removes specific info cards that are stuck in the system.
  
  1. Changes
    - Deletes cards with titles "Who is Behind DEICER?" and "The US Constitution Protects Everyone"
    
  2. Notes
    - This is a one-time cleanup operation
    - Only targets specific cards by their exact titles
*/

DELETE FROM info_cards
WHERE title IN (
  'Who is Behind DEICER?',
  'The US Constitution Protects Everyone'
);

-- Resequence the remaining cards to ensure order_index is continuous
WITH numbered_cards AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY order_index, created_at) - 1 as new_index
  FROM info_cards
)
UPDATE info_cards
SET order_index = numbered_cards.new_index
FROM numbered_cards
WHERE info_cards.id = numbered_cards.id;