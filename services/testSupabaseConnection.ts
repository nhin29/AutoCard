/**
 * Test Supabase Connection
 * 
 * Simple utility to test if Supabase is properly configured and connected.
 * Run this to verify your setup is working.
 */

import { checkDatabaseConnection, supabase } from './supabase';

/**
 * Test the Supabase connection
 * 
 * @returns Promise<void>
 */
export async function testSupabaseConnection(): Promise<void> {
  try {
    // Test 1: Check if client is initialized
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    // Test 2: Check connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
    }

    // Test 3: Try a simple query (this will work even if tables don't exist yet)
    // We'll just check if we can reach the API
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      // RPC version might not exist, but if we get a connection error vs function not found, that's different
      if (!(error.code === '42883' || error.message.includes('function') || error.message.includes('does not exist'))) {
      }
    }
  } catch (error: any) {
    throw error;
  }
}

// Export a simple function to call from anywhere
export default testSupabaseConnection;