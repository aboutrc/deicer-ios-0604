/*
  # Add INSERT policy for info_cards table

  1. Changes
    - Add INSERT policy to allow creating new info cards
    - This policy allows any authenticated user to create info cards
*/

-- Create policy for insert access
CREATE POLICY "Enable insert for all users"
  ON public.info_cards
  FOR INSERT
  WITH CHECK (true);