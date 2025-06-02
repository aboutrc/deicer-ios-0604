/*
  # Clean up all existing markers

  1. Changes
    - Delete all marker confirmations
    - Delete all markers
    - Reset sequences
*/

-- First delete all marker confirmations
DELETE FROM marker_confirmations;

-- Then delete all markers
DELETE FROM markers;