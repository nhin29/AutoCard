-- Enable realtime for ads table
-- This allows clients to subscribe to changes on the ads table

-- Add ads table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE ads;

-- Note: Realtime is already enabled in config.toml
-- This migration ensures the ads table is included in the realtime publication
