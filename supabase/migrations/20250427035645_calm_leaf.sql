/*
  # Update marker categories

  1. Changes
    - Remove 'police' category from markers table constraint
    - Update existing 'police' markers to 'ice'
    - Add proper constraints for marker categories
    
  2. Security
    - Maintain existing RLS policies
*/

-- Update existing police markers to ice
UPDATE markers
SET category = 'ice'
WHERE category = 'police';

-- Drop existing constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'markers_category_check'
  ) THEN
    ALTER TABLE markers DROP CONSTRAINT markers_category_check;
  END IF;
END $$;

-- Create new constraint with only ice and observer categories
ALTER TABLE markers 
ADD CONSTRAINT markers_category_check 
CHECK (category IN ('ice', 'observer'));

-- Update map2_markers table as well
UPDATE map2_markers
SET category = 'ice'
WHERE category = 'police';

-- Drop existing constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'map2_markers_category_check'
  ) THEN
    ALTER TABLE map2_markers DROP CONSTRAINT map2_markers_category_check;
  END IF;
END $$;

-- Create new constraint with only ice and observer categories
ALTER TABLE map2_markers 
ADD CONSTRAINT map2_markers_category_check 
CHECK (category IN ('ice', 'observer'));