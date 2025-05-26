/*
  # Initial schema setup for Joblify

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `company` (text)
      - `job_role` (text)
      - `created_at` (timestamp)
      
    - `jobs`
      - `id` (uuid, primary key)
      - `code` (text, unique, 8 characters)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `company` (text)
      - `location` (text)
      - `type` (text)
      - `remote` (boolean)
      - `status` (text)
      - `created_at` (timestamp)
      
    - `applicants`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `resume_url` (text)
      - `cover_letter` (text)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name text,
  last_name text,
  company text,
  job_role text,
  created_at timestamptz DEFAULT now()
);

-- Create jobs table
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  company text NOT NULL,
  location text,
  type text,
  remote boolean DEFAULT false,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

-- Create applicants table
CREATE TABLE applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  resume_url text,
  cover_letter text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Jobs policies
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view jobs by code"
  ON jobs FOR SELECT
  USING (true);

-- Applicants policies
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

CREATE POLICY "Anyone can create applications"
  ON applicants FOR INSERT
  WITH CHECK (true);