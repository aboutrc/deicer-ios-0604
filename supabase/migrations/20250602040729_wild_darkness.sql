/*
  # Fix storage policies and permissions

  1. Changes
    - Drop existing policies
    - Create bucket with proper configuration
    - Set up public read access
    - Enable restricted image uploads
    - Grant proper storage permissions
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable public read access for marker images" ON storage.objects;
DROP POLICY IF EXISTS "Enable image uploads for marker images" ON storage.objects;

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'markers',
  'markers',
  true,
  10485760,  -- 10MB limit
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
  file_size_limit = 10485760,
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
USING (
  bucket_id = 'markers'
);

-- Enable public uploads with restrictions
CREATE POLICY "Enable image uploads for marker images"
ON storage.objects FOR INSERT 
TO public
WITH CHECK (
  bucket_id = 'markers'
  AND (CASE 
    WHEN RIGHT(name, 4) = '.jpg' THEN true
    WHEN RIGHT(name, 5) = '.jpeg' THEN true
    WHEN RIGHT(name, 4) = '.png' THEN true
    WHEN RIGHT(name, 4) = '.gif' THEN true
    WHEN RIGHT(name, 5) = '.heic' THEN true
    WHEN RIGHT(name, 5) = '.heif' THEN true
    ELSE false
  END)
  AND LENGTH(name) < 10485760
);

-- Grant proper storage permissions
GRANT USAGE ON SCHEMA storage TO public;
GRANT SELECT ON storage.buckets TO public;
GRANT SELECT, INSERT ON storage.objects TO public;