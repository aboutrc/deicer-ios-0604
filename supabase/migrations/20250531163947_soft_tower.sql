/*
  # Clean up potentially corrupted info cards
  
  This migration will:
  1. Remove any info cards that:
     - Have empty or null required fields
     - Have invalid content structure
  2. Reset order_index values to ensure proper sequencing
*/

-- First, delete any cards with invalid data
DELETE FROM info_cards
WHERE title IS NULL 
   OR content IS NULL
   OR length(trim(title)) = 0
   OR length(trim(content)) = 0;

-- Then resequence the order_index values
WITH numbered_cards AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY order_index, created_at) - 1 as new_index
  FROM info_cards
)
UPDATE info_cards
SET order_index = numbered_cards.new_index
FROM numbered_cards
WHERE info_cards.id = numbered_cards.id;