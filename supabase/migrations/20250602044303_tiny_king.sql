/*
  # Update storage bucket from markers to pin-markers
  
  1. Changes
    - Drop existing policies safely
    - Remove old markers bucket
    - Create new pin-markers bucket
    - Set up proper policies
    - Configure permissions
*/

-- First drop any existing policies that might conflict
DROP POLICY IF EXISTS "Enable public read access for pin marker images" ON storage.objects;
DROP POLICY IF EXISTS "Enable image uploads for pin marker images" ON storage.objects;
DROP POLICY IF EXISTS "Enable public read access for marker images" ON storage.objects;
DROP POLICY IF EXISTS "Enable image uploads for marker images" ON storage.objects;

-- Clean up old bucket
DO $$
BEGIN
  -- Delete objects first
  DELETE FROM storage.objects WHERE bucket_id = 'markers';
  -- Then delete bucket
  DELETE FROM storage.buckets WHERE id = 'markers';
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Create new bucket if it doesn't exist
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

-- Create new policies with unique names
CREATE POLICY "pin_markers_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pin-markers');

CREATE POLICY "pin_markers_public_upload"
ON storage.objects FOR INSERT 
TO public
WITH CHECK (
  bucket_id = 'pin-markers'
  AND length(name) < 200
  AND octet_length(name) < 5242880
);