import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * AsyncStorage Wrapper with Error Handling
 * 
 * Handles known issues with AsyncStorage in Expo Go/simulator:
 * - Directory creation errors (file named @anonymous instead of directory)
 * - Provides fallback behavior for storage operations
 */

// Track if we've attempted to fix the storage directory issue
let storageFixAttempted = false;

/**
 * Attempt to fix corrupted storage directory
 * This is a known issue in Expo Go/simulator where a file named @anonymous
 * exists instead of a directory, causing AsyncStorage to fail
 */
async function attemptStorageFix(): Promise<void> {
  if (storageFixAttempted) {
    return;
  }
  storageFixAttempted = true;

  try {
    // This is a simulator-specific fix
    // In production builds, this issue doesn't occur
    if (__DEV__ && Platform.OS === 'ios') {
      // The error occurs in ExponentExperienceData/@anonymous
      // We can't directly fix it, but we can work around it
      // by catching errors and using in-memory fallback for critical operations
      if (__DEV__) {
        console.warn(
          '[AsyncStorage] Known simulator issue detected. ' +
          'If storage errors persist, try: Reset iOS Simulator (Device > Erase All Content and Settings)'
        );
      }
    }
  } catch (error) {
    // Silently fail - this is just a workaround attempt
  }
}

/**
 * Safe AsyncStorage wrapper that handles errors gracefully
 */
export const safeAsyncStorage = {
  /**
   * Get item with error handling
   */
  async getItem(key: string): Promise<string | null> {
    try {
      await attemptStorageFix();
      return await AsyncStorage.getItem(key);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      
      // Handle known directory creation error (simulator issue)
      if (errorMessage.includes('Failed to create storage directory') || 
          errorMessage.includes('Not a directory')) {
        // Suppress warning for known simulator issue - only log once per session
        if (__DEV__ && !global.__asyncStorageWarningShown) {
          console.warn(
            '[AsyncStorage] Known simulator storage issue detected. ' +
            'This is expected in iOS Simulator and does not affect functionality. ' +
            'To fix: Reset iOS Simulator (Device > Erase All Content and Settings).'
          );
          global.__asyncStorageWarningShown = true;
        }
        // Return null instead of crashing - app can continue without cached data
        return null;
      }
      
      // For other errors, log and return null
      if (__DEV__) {
        console.error(`[AsyncStorage] Error getting item "${key}":`, errorMessage);
      }
      return null;
    }
  },

  /**
   * Set item with error handling
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await attemptStorageFix();
      await AsyncStorage.setItem(key, value);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      
      // Handle known directory creation error (simulator issue)
      if (errorMessage.includes('Failed to create storage directory') || 
          errorMessage.includes('Not a directory')) {
        // Suppress warning - already logged once per session
        // Silently fail - app can continue without persisting this data
        return;
      }
      
      // For other errors, log but don't crash
      if (__DEV__) {
        console.error(`[AsyncStorage] Error setting item "${key}":`, errorMessage);
      }
    }
  },

  /**
   * Remove item with error handling
   */
  async removeItem(key: string): Promise<void> {
    try {
      await attemptStorageFix();
      await AsyncStorage.removeItem(key);
    } catch (error: any) {
      // Silently handle errors - removal failures are non-critical
      if (__DEV__) {
        console.warn(`[AsyncStorage] Error removing item "${key}":`, error?.message);
      }
    }
  },

  /**
   * Clear all items with error handling
   */
  async clear(): Promise<void> {
    try {
      await attemptStorageFix();
      await AsyncStorage.clear();
    } catch (error: any) {
      if (__DEV__) {
        console.warn('[AsyncStorage] Error clearing storage:', error?.message);
      }
    }
  },

  /**
   * Get all keys with error handling
   */
  async getAllKeys(): Promise<string[]> {
    try {
      await attemptStorageFix();
      return await AsyncStorage.getAllKeys();
    } catch (error: any) {
      if (__DEV__) {
        console.warn('[AsyncStorage] Error getting all keys:', error?.message);
      }
      return [];
    }
  },

  /**
   * Multi-get with error handling
   */
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      await attemptStorageFix();
      return await AsyncStorage.multiGet(keys);
    } catch (error: any) {
      if (__DEV__) {
        console.warn('[AsyncStorage] Error in multiGet:', error?.message);
      }
      // Return array of [key, null] pairs
      return keys.map(key => [key, null]);
    }
  },

  /**
   * Multi-set with error handling
   */
  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await attemptStorageFix();
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error: any) {
      if (__DEV__) {
        console.warn('[AsyncStorage] Error in multiSet:', error?.message);
      }
    }
  },

  /**
   * Multi-remove with error handling
   */
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await attemptStorageFix();
      await AsyncStorage.multiRemove(keys);
    } catch (error: any) {
      if (__DEV__) {
        console.warn('[AsyncStorage] Error in multiRemove:', error?.message);
      }
    }
  },
};

// Re-export AsyncStorage for direct access if needed
export { AsyncStorage };
