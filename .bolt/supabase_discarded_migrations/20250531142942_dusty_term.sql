/*
  # Create info_cards table

  1. New Tables
    - `info_cards`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `content` (text, required)
      - `image_url` (text, optional)
      - `video_url` (text, optional)
      - `is_active` (boolean, default true)
      - `order_index` (integer, required)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `info_cards` table
    - Add policies for authenticated users to manage cards
*/

-- Create the info_cards table
CREATE TABLE IF NOT EXISTS info_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(TRIM(title)) > 0),
  content text NOT NULL CHECK (length(TRIM(content)) > 0),
  image_url text,
  video_url text,
  is_active boolean DEFAULT true,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE info_cards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can create info cards"
  ON info_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view info cards"
  ON info_cards
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update info cards"
  ON info_cards
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete info cards"
  ON info_cards
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX idx_info_cards_order_index ON info_cards(order_index);
CREATE INDEX idx_info_cards_is_active ON info_cards(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_info_cards_updated_at
  BEFORE UPDATE ON info_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();