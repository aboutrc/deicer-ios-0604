/*
  # Fix pin-markers-images bucket upload issues

  1. Changes
    - Drop existing policies
    - Recreate bucket with proper configuration
    - Add proper upload restrictions
    - Match successful pin-markers bucket configuration
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable upload access for all users" ON storage.objects;

-- Update the pin-markers-images bucket configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pin-markers-images',
  'pin-markers-images',
  true,
  5242880, -- 5MB limit
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/heic',
    'image/heif'
  ]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/heic',
    'image/heif'
  ];

-- Create policy for public read access
CREATE POLICY "pin_markers_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pin-markers-images');

-- Create policy for public uploads with proper restrictions
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

-- Grant necessary permissions
GRANT ALL ON SCHEMA storage TO PUBLIC;
GRANT ALL ON storage.objects TO PUBLIC;
GRANT ALL ON storage.buckets TO PUBLIC; 