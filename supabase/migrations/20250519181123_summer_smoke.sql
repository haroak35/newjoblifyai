/*
  # Fix applicants RLS policy

  1. Changes
    - Drop the existing policy
    - Create a new policy that requires authentication but allows applicants to apply to any job
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Users can create applications for jobs" ON applicants;

-- Create new policy with updated conditions
CREATE POLICY "Authenticated users can apply to jobs"
  ON applicants FOR INSERT
  TO authenticated
  WITH CHECK (true);