/*
  # Fix pin-markers-images bucket and policies

  1. Changes
    - Create pin-markers-images bucket if it doesn't exist
    - Set proper MIME types and file size limits
    - Create public access policies
    - Enable anonymous uploads
*/

-- Create or update the pin-markers-images bucket
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable upload access for all users" ON storage.objects;

-- Create policy to enable read access for all users
CREATE POLICY "Enable read access for all users"
ON storage.objects FOR SELECT
USING (bucket_id = 'pin-markers-images');

-- Create policy to enable upload access for all users
CREATE POLICY "Enable upload access for all users"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pin-markers-images');

-- Grant necessary permissions
GRANT ALL ON SCHEMA storage TO PUBLIC;
GRANT ALL ON storage.objects TO PUBLIC;
GRANT ALL ON storage.buckets TO PUBLIC; 