/*
  # Create storage images table and policies

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
    - Enable RLS on storage_images table
    - Add policy for public read access
    - Add policy for restricted image uploads
*/

-- Create storage_images table if it doesn't exist
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON storage_images;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON storage_images;

-- Create policy for public read access
CREATE POLICY "Enable read access for all users"
ON storage_images FOR SELECT
USING (true);

-- Create policy for public uploads with size and type restrictions
CREATE POLICY "Enable insert for authenticated users"
ON storage_images FOR INSERT
WITH CHECK (
  (bucket = 'markers') AND
  (content_type = ANY (ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/heic',
    'image/heif'
  ]))
);

-- Create or replace function to update updated_at
CREATE OR REPLACE FUNCTION update_storage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_storage_updated_at ON storage_images;

-- Create trigger to update updated_at
CREATE TRIGGER update_storage_updated_at
  BEFORE UPDATE ON storage_images
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_updated_at();

-- Add helpful comment
COMMENT ON TABLE storage_images IS 'Stores image metadata with public access and authenticated uploads';