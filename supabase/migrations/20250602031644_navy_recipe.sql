/*
  # Update storage RLS policies for anonymous uploads

  1. Changes
    - Drop existing policies
    - Create new policy for public read access
    - Create new policy for public uploads that explicitly uses the public role
    - Add support for all image formats
    - Make uploaded images public by default
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON storage_images;
DROP POLICY IF EXISTS "Enable insert for all users" ON storage_images;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON storage_images;

-- Create policy for public read access
CREATE POLICY "Enable read access for all users"
ON storage_images FOR SELECT
TO public
USING (true);

-- Create policy for public uploads
CREATE POLICY "Enable insert for all users"
ON storage_images FOR INSERT
TO public
WITH CHECK (
  bucket = 'markers' AND
  content_type IN (
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/heic',
    'image/heif'
  )
);

-- Update existing images to be public
UPDATE storage_images 
SET public = true 
WHERE bucket = 'markers';

-- Add helpful comment
COMMENT ON TABLE storage_images IS 'Stores image metadata with public access and anonymous uploads';