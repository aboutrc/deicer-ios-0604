/*
  # Configure storage bucket for info card images
  
  1. Creates storage bucket for info card images
  2. Sets file size limit and allowed MIME types
  3. Configures security policies for:
     - Authenticated users can upload/update/delete their own images
     - Public read access for all images
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('info-card-images', 'info-card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Configure bucket settings using correct column names
UPDATE storage.buckets
SET allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    file_size_limit = 5242880 -- 5MB in bytes
WHERE id = 'info-card-images';

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'info-card-images' AND
  owner = auth.uid()
);

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'info-card-images' AND
  owner = auth.uid()
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'info-card-images' AND
  owner = auth.uid()
);

-- Allow public read access to all files
CREATE POLICY "Allow public read access to images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'info-card-images');