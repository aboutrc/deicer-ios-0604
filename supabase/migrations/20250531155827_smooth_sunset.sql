/*
  # Clean up empty cards and add content validation

  1. Changes
    - Delete any empty or "New Card" placeholder cards
    - Add check constraints to prevent empty content
    
  2. Data Cleanup
    - Removes cards with empty content or default "New Card" title
    
  3. Constraints
    - Ensures title is not empty or just whitespace
    - Ensures content is not empty or just whitespace
*/

-- Delete empty cards
DELETE FROM info_cards 
WHERE title = 'New Card' 
   OR trim(content) = ''
   OR title IS NULL
   OR content IS NULL;

-- Add constraints to prevent empty content
ALTER TABLE info_cards
  ADD CONSTRAINT info_cards_title_not_empty 
    CHECK (length(trim(title)) > 0),
  ADD CONSTRAINT info_cards_content_not_empty 
    CHECK (length(trim(content)) > 0);