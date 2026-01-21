# Supabase Database Setup

## Overview

This project uses Supabase as the backend database. The Supabase client is configured in `services/supabase.ts`.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Project name
   - Database password (save this securely)
   - Region (choose closest to your users)
5. Wait for the project to be created (takes ~2 minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon" → "public")

### 3. Configure Environment Variables

#### Option A: Using .env file (Recommended)

Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** 
- The `.env` file is already in `.gitignore` and won't be committed
- Restart your Expo development server after adding/changing environment variables
- Variables must start with `EXPO_PUBLIC_` to be accessible in Expo

#### Option B: Using app.json (Alternative)

You can also configure Supabase in `app.json`:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://your-project-id.supabase.co",
      "supabaseAnonKey": "your-anon-key-here"
    }
  }
}
```

### 4. Verify Connection

The Supabase client is automatically initialized when you import it:

```typescript
import { supabase } from '@/services/supabase';

// Test connection
const isConnected = await checkDatabaseConnection();
console.log('Database connected:', isConnected);
```

## Usage Examples

### Basic Query

```typescript
import { supabase } from '@/services/supabase';

// Fetch data
const { data, error } = await supabase
  .from('ads')
  .select('*');

if (error) {
  console.error('Error fetching ads:', error);
} else {
  console.log('Ads:', data);
}
```

### Insert Data

```typescript
import { supabase } from '@/services/supabase';

const { data, error } = await supabase
  .from('ads')
  .insert([
    {
      title: 'My Ad',
      description: 'Ad description',
      // ... other fields
    }
  ])
  .select();

if (error) {
  console.error('Error creating ad:', error);
} else {
  console.log('Created ad:', data);
}
```

### Update Data

```typescript
import { supabase } from '@/services/supabase';

const { data, error } = await supabase
  .from('ads')
  .update({ title: 'Updated Title' })
  .eq('id', 'ad-id-here')
  .select();

if (error) {
  console.error('Error updating ad:', error);
}
```

### Real-time Subscriptions

```typescript
import { supabase } from '@/services/supabase';

const subscription = supabase
  .channel('ads-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'ads' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();
```

## Security Notes

- **Never commit your `.env` file** - it's already in `.gitignore`
- The `anon` key is safe to use in client-side code (it's public)
- Use Row Level Security (RLS) policies in Supabase to protect your data
- For server-side operations, use the `service_role` key (never expose this in client code)

## Next Steps

1. Set up your database schema in Supabase Dashboard → SQL Editor
2. Configure Row Level Security (RLS) policies for your tables
3. Set up authentication if needed (Supabase Auth)
4. Configure storage buckets if you need file uploads

## Troubleshooting

### "Missing EXPO_PUBLIC_SUPABASE_URL" error

- Make sure your `.env` file exists in the project root
- Verify the variable names start with `EXPO_PUBLIC_`
- Restart your Expo development server after adding environment variables

### Connection issues

- Verify your Supabase project URL and key are correct
- Check your internet connection
- Ensure your Supabase project is active (not paused)

### TypeScript errors

- Make sure `@supabase/supabase-js` is installed: `npm install @supabase/supabase-js`
- Restart your TypeScript server in your IDE