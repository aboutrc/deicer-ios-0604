/*
  # Create footer configurations table

  1. New Tables
    - `footer_configs`
      - `id` (uuid, primary key)
      - `ticker_text` (text)
      - `button_image_url` (text, nullable)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Functions
    - `set_single_active_footer`: Ensures only one footer config is active
    - `update_updated_at_column`: Updates the updated_at timestamp

  3. Security
    - Enable RLS
    - Add policies for public read access and authenticated write access
*/

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create footer_configs table
CREATE TABLE IF NOT EXISTS public.footer_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker_text text NOT NULL CHECK (char_length(trim(ticker_text)) > 0),
  button_image_url text,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON footer_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle single active footer
CREATE OR REPLACE FUNCTION set_single_active_footer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active THEN
    UPDATE footer_configs
    SET is_active = false
    WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for single active footer
CREATE TRIGGER ensure_single_active_footer
  BEFORE INSERT OR UPDATE ON footer_configs
  FOR EACH ROW
  EXECUTE FUNCTION set_single_active_footer();

-- Enable RLS
ALTER TABLE public.footer_configs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
  ON public.footer_configs
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.footer_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON public.footer_configs
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users"
  ON public.footer_configs
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default footer config
INSERT INTO footer_configs (
  ticker_text,
  is_active
) VALUES (
  'This app is free to use, anonymous, and you do not need to sign in. If you would like to support this effort, share with any investors for funding, or click on the Donate button. It is NOT required, but appreciated.',
  true
);