/*
  # Add blog tables

  1. New Tables
    - `blog_authors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `avatar_url` (text)
      - `bio` (text)
      
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `excerpt` (text)
      - `content` (text)
      - `cover_image` (text)
      - `author_id` (uuid, references blog_authors)
      - `status` (text)
      - `published_at` (timestamp)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
*/

-- Create blog_authors table
CREATE TABLE blog_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  cover_image text,
  author_id uuid REFERENCES blog_authors(id) NOT NULL,
  status text DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Blog authors policies
CREATE POLICY "Anyone can view blog authors"
  ON blog_authors FOR SELECT
  TO public
  USING (true);

-- Blog posts policies
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  TO public
  USING (status = 'published');