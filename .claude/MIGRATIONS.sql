-- Run in Supabase SQL editor
-- coaching_history table for AI coach messages
CREATE TABLE IF NOT EXISTS coaching_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE coaching_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users see own coaching" ON coaching_history
  FOR ALL USING (auth.uid() = user_id);



-- Add MFP fields to user_preferences
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS mfp_username TEXT,
  ADD COLUMN IF NOT EXISTS mfp_password TEXT;

-- Add MFP fields to food_logs + unique constraint for upsert
ALTER TABLE food_logs
  ADD COLUMN IF NOT EXISTS mfp_meal_category TEXT,
  ADD COLUMN IF NOT EXISTS mfp_synced BOOLEAN DEFAULT FALSE;

-- Unique constraint so sync can upsert without duplicating
ALTER TABLE food_logs
  DROP CONSTRAINT IF EXISTS food_logs_upsert_key;

ALTER TABLE food_logs
  ADD CONSTRAINT food_logs_upsert_key
  UNIQUE (user_id, meal_name, logged_at);
