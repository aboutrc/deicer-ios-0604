/*
  # Fix storage policies and image upload

  1. Changes
    - Drop existing policies
    - Create new policy for public read access
    - Create new policy for authenticated uploads with proper MIME type checks
    - Add support for JPEG/JPG format variations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable public read access" ON storage_images;
DROP POLICY IF EXISTS "Enable authenticated uploads" ON storage_images;

-- Create policy for public read access
CREATE POLICY "Enable read access for all users"
ON storage_images FOR SELECT
USING (true);

-- Create policy for authenticated uploads with proper checks
CREATE POLICY "Enable insert for authenticated users"
ON storage_images FOR INSERT
TO authenticated
WITH CHECK (
  bucket = 'markers' AND
  content_type = ANY (ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/heic',
    'image/heif'
  ])
);

-- Update existing images to be public
UPDATE storage_images 
SET public = true 
WHERE bucket = 'markers';

-- Add comment explaining policies
COMMENT ON TABLE storage_images IS 'Stores image metadata with public access and authenticated uploads';