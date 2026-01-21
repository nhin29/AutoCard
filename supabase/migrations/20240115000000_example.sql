-- Example Migration File
-- This is a template showing how to structure your SQL migrations
-- 
-- Migration files are executed in order based on their timestamp prefix
-- Format: YYYYMMDDHHMMSS_description.sql
--
-- To use this file:
-- 1. Rename it with a new timestamp and descriptive name
-- 2. Replace this SQL with your actual schema changes
-- 3. Run: npm run db:push

-- Example: Create a table
-- create table if not exists public.example_table (
--   id uuid default gen_random_uuid() primary key,
--   name text not null,
--   created_at timestamp with time zone default timezone('utc'::text, now()) not null
-- );

-- Example: Enable Row Level Security
-- alter table public.example_table enable row level security;

-- Example: Create a policy
-- create policy "Allow public read access" on public.example_table
--   for select using (true);

-- Delete this file or comment out all SQL when you're ready to create real migrations