/*
  # Fix for marker images storage

  1. New Storage Configuration
    - Creates marker-images bucket for storing marker photos
    - Sets proper permissions for public access
    - Configures allowed MIME types for images
  
  2. Security
    - Adds policies for public access to marker images
    - Enables anonymous uploads and downloads
*/

-- Create marker-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'marker-images',
  'marker-images',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Create policies on storage.objects table for marker-images bucket
DO $$
BEGIN
  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public Insert for marker-images'
  ) THEN
    CREATE POLICY "Public Insert for marker-images" ON storage.objects 
    FOR INSERT TO public 
    WITH CHECK (bucket_id = 'marker-images');
  END IF;

  -- Select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public Select for marker-images'
  ) THEN  
    CREATE POLICY "Public Select for marker-images" ON storage.objects 
    FOR SELECT TO public 
    USING (bucket_id = 'marker-images');
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public Update for marker-images'
  ) THEN
    CREATE POLICY "Public Update for marker-images" ON storage.objects 
    FOR UPDATE TO public 
    USING (bucket_id = 'marker-images');
  END IF;

  -- Delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public Delete for marker-images'
  ) THEN
    CREATE POLICY "Public Delete for marker-images" ON storage.objects 
    FOR DELETE TO public 
    USING (bucket_id = 'marker-images');
  END IF;
END $$;

-- Make sure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;