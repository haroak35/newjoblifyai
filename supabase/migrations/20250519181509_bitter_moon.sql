/*
  # Update applicants policies for better security

  1. Changes
    - Drop existing policies
    - Add new policies for better access control
    
  2. Security
    - Allow authenticated users to apply to jobs
    - Allow job owners to view and manage applications
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view applicants for their jobs" ON applicants;
DROP POLICY IF EXISTS "Authenticated users can apply to jobs" ON applicants;

-- Create new policies
CREATE POLICY "Users can view applicants for their jobs"
  ON applicants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applicants.job_id
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can apply to jobs"
  ON applicants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_id
      AND jobs.status = 'live'
    )
  );