/*
  # Remove storage functionality
  
  1. Changes
    - Drop storage bucket for markers
    - Remove storage policies
    - Clean up storage objects
*/

-- Drop storage bucket and objects
DELETE FROM storage.objects WHERE bucket_id = 'markers';
DELETE FROM storage.buckets WHERE id = 'markers';

-- Drop storage policies
DROP POLICY IF EXISTS "Enable public read access for marker images" ON storage.objects;
DROP POLICY IF EXISTS "Enable image uploads for marker images" ON storage.objects;