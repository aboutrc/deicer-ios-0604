/*
  # Fix storage RLS policies for anonymous uploads

  1. Changes
    - Drop existing policies
    - Create new policy for public uploads
    - Enable anonymous access
    - Add proper MIME type checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON storage_images;
DROP POLICY IF EXISTS "Enable insert for all users" ON storage_images;

-- Create policy for public read access
CREATE POLICY "Enable read access for all users"
ON storage_images FOR SELECT
USING (true);

-- Create policy for public uploads with type restrictions
CREATE POLICY "Enable insert for all users"
ON storage_images FOR INSERT
WITH CHECK (
  (bucket = 'markers') AND
  content_type IN (
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/heic',
    'image/heif'
  )
);

-- Add comment explaining policies
COMMENT ON TABLE storage_images IS 'Stores image metadata with public access and anonymous uploads';