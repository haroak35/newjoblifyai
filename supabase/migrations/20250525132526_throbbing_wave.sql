/*
  # Update usage limits for subscription tiers

  1. Changes
    - Drop existing trigger and function
    - Add function to update usage limits based on subscription tier
    - Add trigger to automatically update limits on subscription change
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS update_usage_limits_trigger ON profiles;
DROP FUNCTION IF EXISTS update_usage_limits();

-- Create the function
CREATE OR REPLACE FUNCTION update_usage_limits()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subscription_tier = 'startup' THEN
    NEW.usage_limits = json_build_object(
      'jobs', json_build_object(
        'max', 40,
        'used', COALESCE((OLD.usage_limits->>'jobs'->>'used')::int, 0)
      ),
      'applicants_per_job', json_build_object(
        'max', 100,
        'shortlist', NULL  -- NULL indicates custom shortlist
      ),
      'features', json_build_object(
        'ai_matching', true,
        'email_support', true,
        'team_collaboration', true,
        'api_access', false,
        'advanced_analytics', false,
        'custom_shortlist', true
      )
    );
  ELSIF NEW.subscription_tier = 'scaleup' THEN
    NEW.usage_limits = json_build_object(
      'jobs', json_build_object(
        'max', 80,
        'used', COALESCE((OLD.usage_limits->>'jobs'->>'used')::int, 0)
      ),
      'applicants_per_job', json_build_object(
        'max', 200,
        'shortlist', NULL  -- NULL indicates custom shortlist
      ),
      'features', json_build_object(
        'ai_matching', true,
        'email_support', true,
        'team_collaboration', true,
        'api_access', true,
        'advanced_analytics', true,
        'custom_shortlist', true
      )
    );
  ELSE
    NEW.usage_limits = json_build_object(
      'jobs', json_build_object(
        'max', 5,
        'used', COALESCE((OLD.usage_limits->>'jobs'->>'used')::int, 0)
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
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_usage_limits_trigger
  BEFORE UPDATE OF subscription_tier ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_limits();