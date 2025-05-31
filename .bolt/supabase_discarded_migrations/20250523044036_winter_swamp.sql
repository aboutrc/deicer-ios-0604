/*
  # Configure storage bucket for marker images
  
  1. Storage Setup
    - Creates marker-images bucket for storing marker images
    - Configures allowed MIME types for images
    - Sets bucket as public
  
  2. Security
    - Enables public access for uploads
    - Allows public read access to images
    - Configures secure file type restrictions
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

-- Enable storage by creating extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "storage" WITH SCHEMA "storage";

-- Create storage.objects table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  bucket_id text,
  name text,
  owner uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_accessed_at timestamp with time zone DEFAULT now(),
  metadata jsonb,
  path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED,
  version text
);

-- Create bucket_id foreign key if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'objects_bucketid_fkey'
  ) THEN
    ALTER TABLE storage.objects
    ADD CONSTRAINT objects_bucketid_fkey
    FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);
  END IF;
END $$;

-- Create RLS policies for the bucket
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public Select" ON storage.objects FOR SELECT TO public USING (true);
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE TO public USING (true);
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE TO public USING (true);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;