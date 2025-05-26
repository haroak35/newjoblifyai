/*
  # Add application schedule columns to jobs table

  1. Changes
    - Add `application_start` column to jobs table
    - Add `application_deadline` column to jobs table
    - Add `experience_level` column to jobs table
    - Add `must_have_skills` column to jobs table
    - Add `preferred_background` column to jobs table
    - Add `nice_to_have_skills` column to jobs table
    - Add `priorities` column to jobs table
*/

-- Add new columns to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_start timestamptz;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_deadline timestamptz;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience_level text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS must_have_skills text[];
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS preferred_background text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS nice_to_have_skills text[];
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS priorities text[];