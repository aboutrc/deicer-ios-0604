/*
  # Clean up all markers and confirmations

  1. Changes
    - Delete all marker confirmations
    - Delete all markers
    - Reset sequences
*/

-- First delete all marker confirmations
DELETE FROM marker_confirmations;

-- Then delete all markers
DELETE FROM markers;

-- Reset sequences if they exist
ALTER SEQUENCE IF EXISTS marker_confirmations_id_seq RESTART;
ALTER SEQUENCE IF EXISTS markers_id_seq RESTART;