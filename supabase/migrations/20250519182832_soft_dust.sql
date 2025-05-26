/*
  # Fix applicants RLS policies to allow public access

  1. Changes
    - Drop existing policies
    - Add new policies that allow anyone to apply to jobs
    - Maintain job owner access to view applications
    
  2. Security
    - Allow public access for applying to jobs
    - Restrict application viewing to job owners only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public can apply to live jobs" ON applicants;
DROP POLICY IF EXISTS "Job owners can view applications" ON applicants;

-- Create new policies
CREATE POLICY "Anyone can apply to jobs"
  ON applicants FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Job owners can view applications"
  ON applicants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applicants.job_id
      AND jobs.user_id = auth.uid()
    )
  );