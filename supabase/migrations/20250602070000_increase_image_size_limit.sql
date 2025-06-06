/*
  # Increase file size limit for pin-markers-images bucket

  1. Changes
    - Increase file size limit to 20MB
    - Keep existing MIME type restrictions
    - Maintain other bucket settings
*/

-- Update the pin-markers-images bucket configuration
UPDATE storage.buckets
SET file_size_limit = 20971520  -- 20MB in bytes
WHERE id = 'pin-markers-images';

-- Update the policy to match new size limit
DROP POLICY IF EXISTS "pin_markers_images_public_upload" ON storage.objects;

CREATE POLICY "pin_markers_images_public_upload"
ON storage.objects FOR INSERT 
TO public
WITH CHECK (
  bucket_id = 'pin-markers-images'
  AND length(name) < 200
  AND (CASE 
    WHEN RIGHT(name, 4) = '.jpg' THEN true
    WHEN RIGHT(name, 5) = '.jpeg' THEN true
    WHEN RIGHT(name, 4) = '.png' THEN true
    WHEN RIGHT(name, 4) = '.gif' THEN true
    WHEN RIGHT(name, 5) = '.heic' THEN true
    WHEN RIGHT(name, 5) = '.heif' THEN true
    ELSE false
  END)
); 