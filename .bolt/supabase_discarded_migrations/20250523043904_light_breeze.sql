/*
  # Fix marker images storage and upload

  1. New Storage Configuration
    - Ensures the marker-images bucket exists
    - Sets proper CORS policies
    - Configures public access for marker images
    - Adds RLS policies for image uploads

  2. Changes
    - Adds proper storage bucket configuration
    - Ensures marker images are publicly accessible
    - Fixes image upload permissions
*/

-- Create marker-images bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('marker-images', 'marker-images', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Set CORS policy for marker-images bucket
UPDATE storage.buckets
SET cors = '[{"origin":"*","methods":["GET","POST","PUT","DELETE","OPTIONS"],"headers":["*"],"expose_headers":["Content-Range","Range"],"max_age":86400}]'
WHERE id = 'marker-images';

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