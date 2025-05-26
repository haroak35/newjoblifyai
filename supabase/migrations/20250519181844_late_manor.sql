/*
  # Fix applicants RLS policies

  1. Changes
    - Drop existing policies
    - Add new policies that allow anyone to apply to live jobs
    - Maintain job owner access to view applications
    
  2. Security
    - Allow public access for applying to live jobs
    - Restrict application viewing to job owners only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view applicants for their jobs" ON applicants;
DROP POLICY IF EXISTS "Authenticated users can apply to jobs" ON applicants;

-- Create new policies
CREATE POLICY "Anyone can apply to live jobs"
  ON applicants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_id
      AND jobs.status = 'live'
    )
  );

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