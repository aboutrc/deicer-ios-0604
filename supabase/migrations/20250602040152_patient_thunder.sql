/*
  # Fix storage policies for marker images

  1. Changes
    - Drop existing policies first
    - Recreate policies with proper checks
    - Add documentation
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for all users" ON storage_images;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage_images;

-- Create policy for public image uploads
CREATE POLICY "Enable public image uploads"
ON storage_images FOR INSERT
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

-- Create policy for public read access
CREATE POLICY "Enable public read access"
ON storage_images FOR SELECT
USING (true);

-- Add comment explaining policies
COMMENT ON TABLE storage_images IS 'Stores image metadata with public access and anonymous uploads';