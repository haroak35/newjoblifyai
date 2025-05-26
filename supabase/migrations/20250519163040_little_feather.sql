/*
  # Fix RLS policies for profiles and applicants

  1. Changes
    - Add policy for users to create their own profiles
    - Replace overly permissive applicants policy with authenticated-only policy
    
  2. Security
    - Ensure users can only create their own profiles
    - Require authentication for creating applications
*/

-- Add policy for profile creation
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Replace overly permissive applicants policy
DROP POLICY IF EXISTS "Anyone can create applications" ON applicants;

CREATE POLICY "Users can create applications for jobs"
  ON applicants FOR INSERT
  TO authenticated
  WITH CHECK (true);