/*
  # Delete test pins

  1. Changes
     - Removes the two ICE marker pins visible on Manor Hill Drive
     - Uses a geographic bounding box to target the specific area
     - Ensures only ICE category pins are removed
*/

-- Delete the two test pins on Manor Hill Drive
DELETE FROM markers 
WHERE 
  (latitude BETWEEN 43.0 AND 43.1) AND 
  (longitude BETWEEN -76.2 AND -76.1) AND
  category = 'ice';

-- Log the deletion for audit purposes
INSERT INTO public.audit_log (action, table_name, description)
VALUES ('DELETE', 'markers', 'Removed test ICE markers from Manor Hill Drive area');