/*
  # Add storage bucket for info card images

  1. New Storage Bucket
    - Create a public bucket for storing info card images
    - Set up security policies for authenticated users

  2. Security
    - Enable public access for viewing images
    - Allow authenticated users to upload images
*/

-- Create a new public bucket for info card images
INSERT INTO storage.buckets (id, name, public)
VALUES ('info-card-images', 'info-card-images', true);

-- Allow public access to images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'info-card-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'info-card-images'
  AND owner = auth.uid()
);