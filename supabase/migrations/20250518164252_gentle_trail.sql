/*
  # Remove test ICE markers from Manor Hill Drive area
  
  1. Changes
    - Deletes test ICE markers in the specified geographic area
    - Uses a bounding box to target only the test markers
    - Preserves all other markers in the database
*/

-- Delete the test pins on Manor Hill Drive
DELETE FROM markers 
WHERE 
  (latitude BETWEEN 43.0 AND 43.1) AND 
  (longitude BETWEEN -76.2 AND -76.1) AND
  category = 'ice';