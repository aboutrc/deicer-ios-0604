/*
  # Create markers and confirmations tables

  1. New Tables
    - `markers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `latitude` (double precision)
      - `longitude` (double precision)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `active` (boolean)
      - `last_confirmed` (timestamptz)
      - `confirmations_count` (integer)
      - `last_status_change` (timestamptz)
      - `reliability_score` (double precision)
      - `negative_confirmations` (integer)
      - `image_url` (text)

    - `marker_confirmations`
      - `id` (uuid, primary key)
      - `marker_id` (uuid, references markers)
      - `user_id` (uuid, references auth.users)
      - `confirmed_at` (timestamptz)
      - `is_active` (boolean)
      - `confirmed_from` (text)
      - `cooldown_expires` (timestamptz)

  2. Functions
    - `handle_marker_confirmation`: Handles marker confirmation logic

  3. Security
    - Enable RLS on both tables
    - Add policies for read/write access
*/

-- Create markers table
CREATE TABLE IF NOT EXISTS public.markers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('ice', 'observer')),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  active boolean DEFAULT true NOT NULL,
  last_confirmed timestamptz,
  confirmations_count integer DEFAULT 0 NOT NULL,
  last_status_change timestamptz,
  reliability_score double precision DEFAULT 0.5 NOT NULL,
  negative_confirmations integer DEFAULT 0 NOT NULL,
  image_url text
);

-- Create marker_confirmations table
CREATE TABLE IF NOT EXISTS public.marker_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id uuid REFERENCES public.markers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  confirmed_at timestamptz DEFAULT now() NOT NULL,
  is_active boolean NOT NULL,
  confirmed_from text NOT NULL,
  cooldown_expires timestamptz
);

-- Enable Row Level Security
ALTER TABLE public.markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marker_confirmations ENABLE ROW LEVEL SECURITY;

-- Create policies for markers table
CREATE POLICY "Enable read access for all users" 
  ON public.markers FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for all users" 
  ON public.markers FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
  ON public.markers FOR UPDATE 
  USING (true);

-- Create policies for marker_confirmations table
CREATE POLICY "Enable read access for all users" 
  ON public.marker_confirmations FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for all users" 
  ON public.marker_confirmations FOR INSERT 
  WITH CHECK (true);

-- Create handle_marker_confirmation function
CREATE OR REPLACE FUNCTION public.handle_marker_confirmation(
  marker_id uuid,
  is_present boolean,
  user_ip text,
  user_lat double precision,
  user_lng double precision
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  cooldown_period interval := '1 hour';
  existing_confirmation public.marker_confirmations;
BEGIN
  -- Check for existing confirmation within cooldown period
  SELECT *
  INTO existing_confirmation
  FROM public.marker_confirmations
  WHERE marker_confirmations.marker_id = handle_marker_confirmation.marker_id
    AND marker_confirmations.user_id = current_user_id
    AND marker_confirmations.cooldown_expires > now();

  IF existing_confirmation IS NOT NULL THEN
    RAISE EXCEPTION 'User has already confirmed this marker recently. Cooldown expires at %', existing_confirmation.cooldown_expires;
  END IF;

  -- Insert new confirmation
  INSERT INTO public.marker_confirmations (
    marker_id, 
    user_id, 
    is_active, 
    confirmed_from, 
    cooldown_expires
  )
  VALUES (
    marker_id,
    current_user_id,
    is_present,
    user_ip,
    now() + cooldown_period
  );

  -- Update marker status
  UPDATE public.markers
  SET
    confirmations_count = CASE 
      WHEN is_present THEN confirmations_count + 1 
      ELSE confirmations_count 
    END,
    negative_confirmations = CASE 
      WHEN NOT is_present THEN negative_confirmations + 1 
      ELSE negative_confirmations 
    END,
    last_confirmed = now(),
    active = is_present,
    last_status_change = now(),
    reliability_score = CASE
      WHEN is_present THEN LEAST(reliability_score + 0.1, 1.0)
      ELSE GREATEST(reliability_score - 0.1, 0.0)
    END
  WHERE markers.id = handle_marker_confirmation.marker_id;
END;
$$;