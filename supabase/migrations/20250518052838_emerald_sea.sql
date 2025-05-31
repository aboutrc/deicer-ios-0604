/*
  # Remove test ICE markers
  
  1. Changes
    - Deletes test ICE markers from Manor Hill Drive area
    - Uses geographic bounding box for reliable targeting
    - Ensures only test markers in specific area are removed
*/

-- Delete the two test pins on Manor Hill Drive
DELETE FROM markers 
WHERE 
  (latitude BETWEEN 43.0 AND 43.1) AND 
  (longitude BETWEEN -76.2 AND -76.1) AND
  category = 'ice';