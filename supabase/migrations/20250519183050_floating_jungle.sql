/*
  # Fix storage policies for resume uploads

  1. Changes
    - Drop existing storage policies
    - Add new policies for public resume uploads
    - Add policies for viewing resumes
    
  2. Security
    - Allow public access for uploading resumes
    - Restrict resume viewing to job owners only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Job owners can read resumes" ON storage.objects;

-- Create new policies
CREATE POLICY "Anyone can upload resumes"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Job owners can view resumes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes' AND
    EXISTS (
      SELECT 1 FROM applicants
      JOIN jobs ON jobs.id = applicants.job_id
      WHERE jobs.user_id = auth.uid()
      AND storage.objects.name LIKE (jobs.id || '/%')
    )
  );