import { safeAsyncStorage } from '@/utils/asyncStorageWrapper';
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
// During EAS builds, these are injected from eas.json env section or EAS secrets
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables - throw only in development to catch misconfiguration early
// In production builds, EAS will inject these values, so we validate but don't crash the build
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const missingVars: string[] = [];
  if (!SUPABASE_URL) missingVars.push('EXPO_PUBLIC_SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) missingVars.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  
  const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}. ` +
    'Please add them to your .env file, eas.json env section, or configure EAS secrets.';
  
  // In development, throw immediately to catch configuration issues
  // In production builds, this will be caught during build validation
  if (__DEV__) {
    throw new Error(errorMessage);
  } else {
    // In production, log error but allow build to continue
    // The app will fail at runtime when trying to use Supabase, which is better than build failure
    console.error('[Supabase] Configuration error:', errorMessage);
  }
}

/**
 * Supabase client instance
 * 
 * This client is configured with:
 * - Auto-refreshing session management with AsyncStorage for React Native
 * - Row Level Security (RLS) support
 * - Real-time subscriptions capability
 */
// Create a storage adapter that matches AsyncStorage interface but handles errors gracefully
const storageAdapter = {
  getItem: (key: string) => safeAsyncStorage.getItem(key),
  setItem: (key: string, value: string) => safeAsyncStorage.setItem(key, value),
  removeItem: (key: string) => safeAsyncStorage.removeItem(key),
};

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disabled for React Native
    storage: storageAdapter, // Use safe AsyncStorage wrapper for session persistence
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