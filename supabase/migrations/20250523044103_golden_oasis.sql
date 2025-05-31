/*
  # Set up marker images storage bucket

  1. Storage Setup
    - Creates marker-images bucket for storing marker images
    - Configures allowed MIME types for images
    - Sets up public access

  2. Security
    - Enables RLS on objects table
    - Creates policies for public access to images
*/

-- Create marker-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES (
  'marker-images',
  'marker-images',
  true,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create policies on storage.objects table
DO $$
BEGIN
  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public Insert'
  ) THEN
    CREATE POLICY "Public Insert" ON storage.objects 
    FOR INSERT TO public 
    WITH CHECK (bucket_id = 'marker-images');
  END IF;

  -- Select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public Select'
  ) THEN  
    CREATE POLICY "Public Select" ON storage.objects 
    FOR SELECT TO public 
    USING (bucket_id = 'marker-images');
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public Update'
  ) THEN
    CREATE POLICY "Public Update" ON storage.objects 
    FOR UPDATE TO public 
    USING (bucket_id = 'marker-images');
  END IF;

  -- Delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public Delete'
  ) THEN
    CREATE POLICY "Public Delete" ON storage.objects 
    FOR DELETE TO public 
    USING (bucket_id = 'marker-images');
  END IF;
END $$;