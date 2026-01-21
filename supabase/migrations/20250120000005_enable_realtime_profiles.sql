-- Enable realtime for profiles table
-- This allows clients to subscribe to changes on the profiles table

-- Add profiles table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Note: Realtime is already enabled in config.toml
-- This migration ensures the profiles table is included in the realtime publication
