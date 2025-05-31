/*
  # Add image support for ICE markers
  
  1. Changes
    - Add image_url column to markers table
    - Create storage bucket for marker images
    - Add policy for authenticated users to upload images
    
  2. Security
    - Enable RLS on storage bucket
    - Add policy for public read access
    - Add policy for authenticated user uploads
*/

-- Create storage bucket for marker images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('marker-images', 'marker-images', true);

-- Add image_url column to markers table
ALTER TABLE markers 
ADD COLUMN image_url text;

-- Create policy to allow public to read marker images
CREATE POLICY "Public can read marker images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'marker-images');

-- Create policy to allow authenticated users to upload marker images
CREATE POLICY "Authenticated users can upload marker images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'marker-images' AND
  (ARRAY_LENGTH(REGEXP_SPLIT_TO_ARRAY(name, '/'), 1) = 2) AND
  (LOWER(SUBSTRING(name FROM '.+\.(...)$')) IN ('jpg', 'png', 'gif'))
);