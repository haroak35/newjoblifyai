/*
  # Add AI analysis column to applicants table

  1. Changes
    - Add `ai_analysis` JSONB column to store Gemini analysis results
*/

ALTER TABLE applicants ADD COLUMN IF NOT EXISTS ai_analysis JSONB;