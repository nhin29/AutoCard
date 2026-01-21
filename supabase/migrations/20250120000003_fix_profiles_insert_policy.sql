-- Migration: 20250120000003_fix_profiles_insert_policy
-- Description: Fix RLS policy to allow authenticated users to insert their own profile
-- Date: 2025-01-20

-- Drop existing insert policy
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Create policy that allows users to insert their own profile
-- This is needed as a fallback if the trigger doesn't work
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Also allow the service role (for the trigger)
CREATE POLICY "Service role full access" ON profiles
  FOR ALL USING (true) WITH CHECK (true);
