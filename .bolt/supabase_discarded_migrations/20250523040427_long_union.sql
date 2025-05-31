/*
  # Create marker images storage bucket
  
  1. New Storage
    - Creates a new public storage bucket for marker images
    - Sets appropriate security policies
    
  2. Security
    - Enables public read access
    - Restricts uploads to authenticated users
    - Enforces file type and size limits
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('marker-images', 'marker-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'marker-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'marker-images' AND
  (LOWER(RIGHT(name, 4)) = '.jpg' OR 
   LOWER(RIGHT(name, 4)) = '.png' OR 
   LOWER(RIGHT(name, 5)) = '.jpeg' OR 
   LOWER(RIGHT(name, 4)) = '.gif') AND
  octet_length(content) < 10485760 -- 10MB limit
);