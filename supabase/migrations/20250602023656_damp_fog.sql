/*
  # Fix storage upload policy

  1. Changes
    - Drop existing upload policy
    - Create new policy that allows authenticated users to upload images
    - Add proper MIME type checks
    - Enable public access for uploaded images
*/

-- Drop existing upload policy
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage_images;

-- Create new upload policy with proper checks
CREATE POLICY "Authenticated users can upload images"
ON storage_images FOR INSERT
TO authenticated
WITH CHECK (
  bucket = 'markers' AND
  content_type IN ('image/jpeg', 'image/png', 'image/gif', 'image/heic', 'image/heif')
);

-- Update existing images to be public
UPDATE storage_images 
SET public = true 
WHERE bucket = 'markers';

-- Add comment explaining the policy
COMMENT ON POLICY "Authenticated users can upload images" ON storage_images IS 
'Allows authenticated users to upload images to markers bucket. Supports JPEG, PNG, GIF, HEIC/HEIF formats.';