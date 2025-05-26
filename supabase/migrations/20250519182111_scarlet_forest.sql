/*
  # Update applicants RLS policies

  1. Changes
    - Drop existing policies
    - Add new policy for public job applications
    - Add policy for job owners to view applications
    
  2. Security
    - Allow anyone (public) to apply to live jobs
    - Allow job owners to view applications for their jobs
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view applicants for their jobs" ON applicants;
DROP POLICY IF EXISTS "Authenticated users can apply to jobs" ON applicants;
DROP POLICY IF EXISTS "Anyone can apply to live jobs" ON applicants;
DROP POLICY IF EXISTS "Job owners can view applications" ON applicants;

-- Create new policies
CREATE POLICY "Public can apply to live jobs"
  ON applicants FOR INSERT
  TO public
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