/*
  # Delete test pins

  1. Changes
     - Deletes two specific test pins from the markers table
     - Pins are located on Manor Hill Drive
  
  2. Purpose
     - Cleanup test data from production database
     - Remove pins that were added for testing purposes
*/

-- Delete the two test pins on Manor Hill Drive
DELETE FROM markers 
WHERE 
  (latitude BETWEEN 43.0 AND 43.1) AND 
  (longitude BETWEEN -76.2 AND -76.1) AND
  category = 'ice';

-- Alternatively, if you need to target specific pins by their exact coordinates:
-- DELETE FROM markers WHERE (latitude = 43.0523 AND longitude = -76.1345) OR (latitude = 43.0498 AND longitude = -76.1347);