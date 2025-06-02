/*
  # Create storage tables for marker images

  1. New Tables
    - `storage_images`
      - `id` (uuid, primary key)
      - `bucket` (text)
      - `name` (text)
      - `content_type` (text)
      - `size` (bigint)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `public` (boolean)

  2. Security
    - Enable RLS
    - Add policies for public read access
    - Add policies for authenticated upload access
*/

-- Create storage_images table
CREATE TABLE IF NOT EXISTS storage_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  name text NOT NULL,
  content_type text NOT NULL,
  size bigint NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  public boolean DEFAULT false NOT NULL,
  UNIQUE(bucket, name)
);

-- Enable RLS
ALTER TABLE storage_images ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public Access"
ON storage_images FOR SELECT
USING (public = true);

-- Create policy for authenticated uploads
CREATE POLICY "Authenticated users can upload images"
ON storage_images FOR INSERT
TO authenticated
WITH CHECK (
  bucket = 'markers' AND
  content_type IN ('image/jpeg', 'image/png', 'image/gif')
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_storage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_storage_updated_at
  BEFORE UPDATE ON storage_images
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_updated_at();

-- Insert default bucket
INSERT INTO storage_images (bucket, name, content_type, size, public)
VALUES ('markers', 'bucket-info', 'application/json', 0, true)
ON CONFLICT (bucket, name) DO NOTHING;