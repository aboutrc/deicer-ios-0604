-- Drop existing policies
DROP POLICY IF EXISTS "Enable public read access for marker images" ON storage.objects;
DROP POLICY IF EXISTS "Enable image uploads for marker images" ON storage.objects;

-- Configure storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'markers',
  'markers',
  true,
  2097152, -- 2MB limit
  ARRAY[
    'image/jpeg',
    'image/jpg'
  ]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg'
  ];

-- Enable public read access
CREATE POLICY "Enable public read access for marker images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'markers');

-- Enable public uploads with basic restrictions
CREATE POLICY "Enable image uploads for marker images"
ON storage.objects FOR INSERT 
TO public
WITH CHECK (
  bucket_id = 'markers' AND
  length(name) < 100
);

-- Grant necessary permissions
GRANT ALL ON SCHEMA storage TO PUBLIC;
GRANT ALL ON storage.objects TO PUBLIC;
GRANT ALL ON storage.buckets TO PUBLIC;