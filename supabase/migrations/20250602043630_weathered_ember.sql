/*
  # Create storage bucket for marker images

  1. Changes
    - Create markers bucket for storing images
    - Set proper permissions and policies
    - Enable public access and uploads
*/

-- Create markers bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'markers',
  'markers',
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
CREATE POLICY "Enable public read access for marker images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'markers');

-- Enable public uploads with restrictions
CREATE POLICY "Enable image uploads for marker images"
ON storage.objects FOR INSERT 
TO public
WITH CHECK (
  bucket_id = 'markers'
  AND length(name) < 200
  AND octet_length(name) < 5242880
);

-- Grant necessary permissions
GRANT ALL ON SCHEMA storage TO PUBLIC;
GRANT ALL ON storage.objects TO PUBLIC;
GRANT ALL ON storage.buckets TO PUBLIC;