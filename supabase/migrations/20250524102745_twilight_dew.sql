/*
  # Update usage limits for subscription tiers

  1. Changes
    - Add function to update usage limits based on subscription tier
    - Add trigger to automatically update limits on subscription change
*/

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
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usage_limits_trigger
  BEFORE UPDATE OF subscription_tier ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_limits();