/*
  # Delete test ICE markers

  1. Changes
    - Removes test ICE markers in the Manor Hill Drive area
    - Targets specific geographic area to ensure only test markers are removed
*/

-- Delete the test ICE pins on Manor Hill Drive
DELETE FROM public.markers 
WHERE 
  (latitude BETWEEN 43.0 AND 43.1) AND 
  (longitude BETWEEN -76.2 AND -76.1) AND
  category = 'ice';