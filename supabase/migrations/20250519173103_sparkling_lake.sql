/*
  # Add storage for resumes

  1. Enable storage
    - Create bucket for resumes
    - Add policies for resume uploads
*/

-- Enable storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false);

-- Allow authenticated users to upload resumes
CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

-- Allow job owners to read resumes
CREATE POLICY "Job owners can read resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  EXISTS (
    SELECT 1 FROM applicants
    JOIN jobs ON jobs.id = applicants.job_id
    WHERE jobs.user_id = auth.uid()
    AND storage.objects.name LIKE '%' || applicants.id || '%'
  )
);