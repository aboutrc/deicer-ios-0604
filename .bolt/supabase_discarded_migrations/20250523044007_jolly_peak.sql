/*
  # Configure marker images storage bucket
  
  1. Storage Setup
    - Creates marker-images bucket for storing marker images
    - Configures public access and mime types
  
  2. Security
    - Enables public access policies for the bucket
    - Sets up policies for insert, select, update, and delete operations
*/

-- Create marker-images bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
  VALUES (
    'marker-images',
    'marker-images',
    true,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
  ON CONFLICT (id) DO UPDATE
  SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
END $$;

-- Create policy to allow anonymous uploads to marker-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Public Upload' AND bucket_id = 'marker-images'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Public Upload',
      'marker-images',
      'INSERT',
      '{"check": "true"}'
    );
  END IF;
END $$;

-- Create policy to allow public read access to marker-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Public Read' AND bucket_id = 'marker-images'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Public Read',
      'marker-images',
      'SELECT',
      '{"check": "true"}'
    );
  END IF;
END $$;

-- Create policy to allow public update access to marker-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Public Update' AND bucket_id = 'marker-images'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Public Update',
      'marker-images',
      'UPDATE',
      '{"check": "true"}'
    );
  END IF;
END $$;

-- Create policy to allow public delete access to marker-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Public Delete' AND bucket_id = 'marker-images'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Public Delete',
      'marker-images',
      'DELETE',
      '{"check": "true"}'
    );
  END IF;
END $$;