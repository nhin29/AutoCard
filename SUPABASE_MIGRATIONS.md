# Supabase SQL Migrations Guide

## Overview

This guide explains how to push SQL to your Supabase database using the Supabase CLI.

## Setup

Supabase CLI is already installed. The project structure is set up with:
- `supabase/migrations/` - Directory for SQL migration files
- `supabase/config.toml` - Supabase configuration

## Methods to Push SQL

### Method 1: Using Migration Files (Recommended)

This is the best practice for version-controlled database changes.

#### Step 1: Create a Migration File

Create a new migration file with a timestamp and descriptive name:

```bash
# Format: YYYYMMDDHHMMSS_description.sql
npx supabase migration new create_ads_table
```

Or manually create a file:
```bash
# Example: 20240115120000_create_ads_table.sql
touch supabase/migrations/20240115120000_create_ads_table.sql
```

#### Step 2: Write Your SQL

Edit the migration file with your SQL:

```sql
-- Example: supabase/migrations/20240115120000_create_ads_table.sql
create table public.ads (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price numeric(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.ads enable row level security;

-- Create a policy (example: allow all reads, authenticated writes)
create policy "Allow public read access" on public.ads
  for select using (true);

create policy "Allow authenticated insert" on public.ads
  for insert with check (auth.role() = 'authenticated');
```

#### Step 3: Push to Remote Database

**Option A: Using Database Password (Recommended for first-time setup)**

You'll need your database password. Get it from:
1. Supabase Dashboard → Settings → Database
2. Or from when you created the project

```bash
# Set your database password as environment variable
export DB_PASSWORD="your-database-password"

# Push migrations
npx supabase db push --db-url "postgresql://postgres.vqfsgmwwodyzcgtxesaw:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

Replace `[PASSWORD]` with your actual database password.

**Option B: Using Access Token**

First, login to Supabase CLI:
```bash
npx supabase login
```

Then link your project:
```bash
npx supabase link --project-ref vqfsgmwwodyzcgtxesaw
```

Then push:
```bash
npx supabase db push
```

### Method 2: Direct SQL Push (Quick Testing)

For quick SQL execution without creating migration files:

```bash
# Using psql or Supabase CLI
npx supabase db execute --db-url "postgresql://postgres.vqfsgmwwodyzcgtxesaw:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" --file your-sql-file.sql
```

### Method 3: Using Supabase Dashboard (Easiest for One-off Changes)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Write and execute your SQL directly

## Migration File Naming Convention

Migration files must follow this format:
```
YYYYMMDDHHMMSS_description.sql
```

Examples:
- `20240115120000_create_ads_table.sql`
- `20240115120100_add_user_profiles.sql`
- `20240115120200_create_indexes.sql`

## Best Practices

1. **Always use migrations** for production changes
2. **Test locally first** if possible
3. **One logical change per migration** (e.g., one table, one feature)
4. **Include rollback SQL** in comments if needed
5. **Never edit existing migrations** - create new ones instead

## Example: Complete Workflow

```bash
# 1. Create a new migration
npx supabase migration new add_ads_table

# 2. Edit the file (it will be in supabase/migrations/)
# Add your SQL to the file

# 3. Review your migration
cat supabase/migrations/[timestamp]_add_ads_table.sql

# 4. Push to remote
npx supabase db push --db-url "postgresql://postgres.vqfsgmwwodyzcgtxesaw:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

## Getting Your Database Connection String

1. Go to Supabase Dashboard → Settings → Database
2. Find "Connection string" section
3. Copy the "URI" or "Connection pooling" string
4. Replace `[YOUR-PASSWORD]` with your actual database password

Format:
```
postgresql://postgres.vqfsgmwwodyzcgtxesaw:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

## Troubleshooting

### "Access denied" or "Authentication failed"
- Make sure you're using the correct database password
- Check that your IP is allowed (if network restrictions are enabled)

### "Migration already applied"
- The migration has already been run
- Check `supabase_migrations.schema_migrations` table to see applied migrations

### "Relation already exists"
- The table/object you're trying to create already exists
- Either drop it first or modify your migration to use `CREATE TABLE IF NOT EXISTS`

## Quick Reference Commands

```bash
# Create new migration
npx supabase migration new <name>

# List migrations
npx supabase migration list

# Push migrations to remote
npx supabase db push --db-url "<connection-string>"

# Reset local database (careful!)
npx supabase db reset

# Generate TypeScript types from database
npx supabase gen types typescript --project-id vqfsgmwwodyzcgtxesaw > types/supabase.ts
```

## Next Steps

1. Create your first migration file
2. Write your SQL schema
3. Push it to your Supabase database
4. Verify in Supabase Dashboard → Table Editor