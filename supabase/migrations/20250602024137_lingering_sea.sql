/*
  # Fix storage policies and image upload

  1. Changes
    - Drop existing policies
    - Create new policies with proper permissions
    - Add support for HEIC/HEIF formats
    - Make uploaded images public by default
    
  2. Security
    - Maintain RLS
    - Allow public read access
    - Restrict uploads to authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public Access" ON storage_images;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage_images;

-- Create policy for public read access
CREATE POLICY "Enable public read access"
ON storage_images FOR SELECT
USING (true);

-- Create policy for authenticated uploads with proper checks
CREATE POLICY "Enable authenticated uploads"
ON storage_images FOR INSERT
TO authenticated
WITH CHECK (
  bucket = 'markers' AND
  content_type IN (
    'image/jpeg',
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

-- Add comment explaining policies
COMMENT ON TABLE storage_images IS 'Stores image metadata with public access and authenticated uploads';