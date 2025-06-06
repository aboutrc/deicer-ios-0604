/*
  # Fix storage policies for pin-markers-images bucket

  1. Changes
    - Drop existing policies
    - Create new policies for pin-markers-images bucket
    - Enable public read access and uploads
    - Set proper MIME type restrictions
*/

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

-- Update the bucket to be public
UPDATE storage.buckets
SET public = true
WHERE id = 'pin-markers-images';

-- Set proper MIME type restrictions and file size limits
UPDATE storage.buckets
SET file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/heic']
WHERE id = 'pin-markers-images';

-- Grant necessary permissions
GRANT ALL ON SCHEMA storage TO PUBLIC;
GRANT ALL ON storage.objects TO PUBLIC;
GRANT ALL ON storage.buckets TO PUBLIC; 