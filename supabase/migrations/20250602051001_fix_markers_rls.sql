-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.markers;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.markers;
DROP POLICY IF EXISTS "Enable update access for marker owners" ON public.markers;
DROP POLICY IF EXISTS "Enable delete access for marker owners" ON public.markers;

-- Enable RLS on markers table
ALTER TABLE public.markers ENABLE ROW LEVEL SECURITY;

-- Create policy to enable read access for all users
CREATE POLICY "Enable read access for all users"
ON public.markers FOR SELECT
USING (true);

-- Create policy to enable insert access for authenticated users
CREATE POLICY "Enable insert access for authenticated users"
ON public.markers FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy to enable update access for marker owners
CREATE POLICY "Enable update access for marker owners"
ON public.markers FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy to enable delete access for marker owners
CREATE POLICY "Enable delete access for marker owners"
ON public.markers FOR DELETE
USING (auth.uid() = user_id); 