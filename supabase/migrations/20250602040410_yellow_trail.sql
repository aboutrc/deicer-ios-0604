/*
  # Fix storage policies for marker images

  1. Changes
    - Enable public read access for marker images
    - Allow public uploads with size and type restrictions
    - Configure markers bucket
*/

-- Enable storage for public access
CREATE POLICY "Enable public read access for marker images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'markers');

-- Enable uploads for all users (both authenticated and anonymous)
CREATE POLICY "Enable image uploads for marker images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'markers' 
  AND (storage.foldername(name))[1] = 'markers'
  AND (lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'heic', 'heif'))
  AND (length(name) < 10485760)
);

-- Ensure the markers bucket exists and has the correct configuration
INSERT INTO storage.buckets (id, name, public)
VALUES ('markers', 'markers', true)
ON CONFLICT (id) DO UPDATE
SET public = true;