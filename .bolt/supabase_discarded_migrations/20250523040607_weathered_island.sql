/*
  # Fix marker images storage permissions

  1. Storage Configuration
    - Creates marker-images bucket if it doesn't exist
    - Enables public access to the bucket
    - Sets appropriate file size and type restrictions
  
  2. Security
    - Allows public read access to all files
    - Allows public write access with file type and size restrictions
    - No authentication required
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('marker-images', 'marker-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to files
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'marker-images');

-- Allow public upload access with restrictions
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'marker-images' AND
  (LOWER(RIGHT(name, 4)) = '.jpg' OR 
   LOWER(RIGHT(name, 4)) = '.png' OR 
   LOWER(RIGHT(name, 5)) = '.jpeg' OR 
   LOWER(RIGHT(name, 4)) = '.gif') AND
  octet_length(content) < 10485760 -- 10MB limit
);

-- Allow public update access
CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'marker-images')
WITH CHECK (bucket_id = 'marker-images');

-- Allow public delete access
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'marker-images');