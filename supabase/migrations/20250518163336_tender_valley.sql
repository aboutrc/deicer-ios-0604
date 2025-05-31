/*
  # Delete test markers on Manor Hill Drive
  
  This migration removes the test ICE markers that were placed on Manor Hill Drive
  for testing purposes.
  
  1. Changes
    - Deletes markers in the Manor Hill Drive area with specific coordinates
*/

-- Delete the test markers on Manor Hill Drive with more precise coordinates
DELETE FROM markers 
WHERE 
  category = 'ice' AND
  latitude BETWEEN 43.03 AND 43.04 AND 
  longitude BETWEEN -76.14 AND -76.13;