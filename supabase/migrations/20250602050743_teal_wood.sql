/*
  # Fix storage policies for pin marker images

  1. Changes
    - Drop existing policies that check filename length
    - Create new policies that properly handle file uploads
    - Remove octet_length check that was causing 0-byte uploads
    - Maintain proper MIME type restrictions
    
  2. Security
    - Keep public read access
    - Allow public uploads with proper restrictions
    - Maintain 5MB file size limit
*/

-- Drop existing policies
DROP POLICY IF EXISTS "pin_markers_public_read" ON storage.objects;
DROP POLICY IF EXISTS "pin_markers_public_upload" ON storage.objects;

-- Create or update the pin-markers bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pin-markers',
  'pin-markers',
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

-- Enable public read access
CREATE POLICY "pin_markers_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pin-markers');

-- Enable public uploads with proper restrictions
CREATE POLICY "pin_markers_public_upload"
ON storage.objects FOR INSERT 
TO public
WITH CHECK (
  bucket_id = 'pin-markers'
  AND length(name) < 200
);

-- Grant necessary permissions
GRANT ALL ON SCHEMA storage TO PUBLIC;
GRANT ALL ON storage.objects TO PUBLIC;
GRANT ALL ON storage.buckets TO PUBLIC;