/*
  # Create storage policies for marker images

  1. Changes
    - Create policies for public image uploads
    - Allow all users to upload images
    - Restrict file types to images
    - Add proper comments and descriptions
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON storage_images;
DROP POLICY IF EXISTS "Enable insert for all users" ON storage_images;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON storage_images;

-- Create policy for public read access
CREATE POLICY "Enable read access for all users"
ON storage_images FOR SELECT
USING (true);

-- Create policy for public uploads with type restrictions
CREATE POLICY "Enable insert for all users"
ON storage_images FOR INSERT
WITH CHECK (
  bucket = 'markers' AND
  content_type = ANY (ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/heic',
    'image/heif'
  ])
);

-- Add helpful comment
COMMENT ON TABLE storage_images IS 'Stores image metadata with public access and anonymous uploads';