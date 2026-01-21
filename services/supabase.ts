import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Database Service
 * 
 * Provides a configured Supabase client for database operations.
 * Uses environment variables for configuration to keep credentials secure.
 * 
 * Environment variables required in .env file:
 * - EXPO_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 */

// Expo automatically loads EXPO_PUBLIC_* variables from .env files
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL environment variable. ' +
    'Please add it to your .env file or app.json extra config.'
  );
}

if (!SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
    'Please add it to your .env file or app.json extra config.'
  );
}

/**
 * Supabase client instance
 * 
 * This client is configured with:
 * - Auto-refreshing session management with AsyncStorage for React Native
 * - Row Level Security (RLS) support
 * - Real-time subscriptions capability
 */
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disabled for React Native
    storage: AsyncStorage, // Use AsyncStorage for session persistence in React Native
  },
});

/**
 * Helper function to check database connection
 * 
 * @returns Promise<boolean> - true if connection is successful
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('_health').select('1').limit(1);
    // If we get here without error, connection is working
    // Note: _health table may not exist, so we check for specific error types
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "relation does not exist" - connection is fine, table just doesn't exist
      console.error('[Supabase] Connection check error:', error.message);
      return false;
    }
    return true;
  } catch (error: any) {
    console.error('[Supabase] Connection check failed:', error.message);
    return false;
  }
}

/**
 * Helper function to get the current Supabase client
 * Useful for components that need to access Supabase
 */
export function getSupabaseClient(): SupabaseClient {
  return supabase;
}