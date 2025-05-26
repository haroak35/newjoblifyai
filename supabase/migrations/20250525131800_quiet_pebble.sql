/*
  # Add usage limits and subscription fields

  1. Changes
    - Add `subscription_tier` column to profiles table
    - Add `usage_limits` column to profiles table
    - Add `subscription_status` column to profiles table
    
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_limits jsonb DEFAULT json_build_object(
  'jobs', json_build_object(
    'max', 5,
    'used', 0
  ),
  'applicants_per_job', json_build_object(
    'max', 25,
    'shortlist', 5
  ),
  'features', json_build_object(
    'ai_matching', true,
    'email_support', true,
    'team_collaboration', false,
    'api_access', false,
    'advanced_analytics', false,
    'custom_shortlist', false
  )
);