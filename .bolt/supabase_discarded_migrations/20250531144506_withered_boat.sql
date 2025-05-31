-- Create the info_cards table if it doesn't exist
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

-- Enable Row Level Security if not already enabled
ALTER TABLE info_cards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can create info cards" ON info_cards;
  DROP POLICY IF EXISTS "Authenticated users can view info cards" ON info_cards;
  DROP POLICY IF EXISTS "Authenticated users can update info cards" ON info_cards;
  DROP POLICY IF EXISTS "Authenticated users can delete info cards" ON info_cards;
END $$;

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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_info_cards_order_index ON info_cards(order_index);
CREATE INDEX IF NOT EXISTS idx_info_cards_is_active ON info_cards(is_active);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_info_cards_updated_at ON info_cards;

-- Create trigger for updated_at
CREATE TRIGGER update_info_cards_updated_at
  BEFORE UPDATE ON info_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();