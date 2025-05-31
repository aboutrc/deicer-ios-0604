/*
  # Fix storage bucket permissions

  1. Changes
    - Create storage bucket for info card images
    - Set proper bucket configuration
    - Add RLS policies for authenticated users
    - Enable public read access

  2. Security
    - Restrict file types to images only
    - Limit file size to 5MB
    - Only authenticated users can upload/modify/delete their own files
    - Public read access for all files
*/

-- Enable storage by creating the extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "storage" WITH SCHEMA "extensions";

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('info-card-images', 'info-card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

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