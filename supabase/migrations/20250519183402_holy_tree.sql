-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can apply to jobs" ON applicants;
DROP POLICY IF EXISTS "Job owners can view applications" ON applicants;

-- Create new policies with proper checks
CREATE POLICY "Anyone can apply to jobs"
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