/*
  # Create info cards table

  1. New Tables
    - `info_cards`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `video_url` (text, nullable)
      - `image_url` (text, nullable)
      - `order_index` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on info_cards table
    - Add policy for read access
*/

CREATE TABLE IF NOT EXISTS public.info_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  video_url text,
  image_url text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.info_cards ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
CREATE POLICY "Enable read access for all users"
  ON public.info_cards
  FOR SELECT
  USING (is_active = true);