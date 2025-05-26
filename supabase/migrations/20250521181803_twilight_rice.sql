/*
  # Add job description column

  1. Changes
    - Add `description` text column to jobs table
*/

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description text;