import type { Ad, Profile } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Real-time Service
 * 
 * Handles Supabase real-time subscriptions for database changes.
 * Provides hooks and utilities for subscribing to table changes.
 */

// ============================================
// TYPES
// ============================================

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeAdPayload {
  event: RealtimeEvent;
  new?: Ad;
  old?: Ad;
}

export interface RealtimeProfilePayload {
  event: RealtimeEvent;
  new?: Profile;
  old?: Profile;
}

export type RealtimeAdCallback = (payload: RealtimeAdPayload) => void;
export type RealtimeProfileCallback = (payload: RealtimeProfilePayload) => void;

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to ads table changes
 * 
 * Listens for INSERT, UPDATE, and DELETE events on the ads table.
 * Automatically filters to only active ads (is_active = true).
 * 
 * @param callback - Function called when an ad change occurs
 * @returns Unsubscribe function
 * 
 * @example
 * ```typescript
 * const unsubscribe = subscribeToAds((payload) => {
 *   if (payload.event === 'INSERT') {
 *     console.log('New ad created:', payload.new);
 *   } else if (payload.event === 'UPDATE') {
 *     console.log('Ad updated:', payload.new);
 *   } else if (payload.event === 'DELETE') {
 *     console.log('Ad deleted:', payload.old);
 *   }
 * });
 * 
 * // Later: unsubscribe();
 * ```
 */
export function subscribeToAds(callback: RealtimeAdCallback): () => void {
  // Create unique channel name to avoid conflicts
  const channelName = `ads-realtime-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const channel: RealtimeChannel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ads',
        filter: 'is_active=eq.true', // Only listen to active ads
      },
      (payload) => {
        try {
          const event = payload.eventType as RealtimeEvent;
          
          // For DELETE events, only old is available
          // For INSERT events, only new is available
          // For UPDATE events, both new and old are available
          const realtimePayload: RealtimeAdPayload = {
            event,
            new: payload.new as Ad | undefined,
            old: payload.old as Ad | undefined,
          };
          
          callback(realtimePayload);
        } catch (error) {
          console.error('[Realtime] Error processing ad change:', error);
        }
      }
    )
    .subscribe((status, err) => {
      try {
        if (status === 'SUBSCRIBED') {
          // Successfully subscribed
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error - subscription failed', err || '');
          // Don't throw - just log the error
        } else if (status === 'TIMED_OUT') {
          console.warn('[Realtime] Subscription timed out');
        } else if (status === 'CLOSED') {
          // Subscription closed
        }
      } catch (error) {
        console.error('[Realtime] Error in subscription callback:', error);
      }
    });

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to specific ad changes by ID
 * 
 * @param adId - The ID of the ad to watch
 * @param callback - Function called when the ad changes
 * @returns Unsubscribe function
 */
export function subscribeToAd(
  adId: string,
  callback: RealtimeAdCallback
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`ad-${adId}-realtime`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ads',
        filter: `id=eq.${adId}`,
      },
      (payload) => {
        try {
          const event = payload.eventType as RealtimeEvent;
          
          const realtimePayload: RealtimeAdPayload = {
            event,
            new: payload.new as Ad | undefined,
            old: payload.old as Ad | undefined,
          };
          
          callback(realtimePayload);
        } catch (error) {
          console.error('[Realtime] Error processing ad change:', error);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Successfully subscribed
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[Realtime] Channel error for ad ${adId}`);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to user's own ads changes
 * 
 * @param userId - The user ID to watch ads for
 * @param callback - Function called when user's ads change
 * @returns Unsubscribe function
 */
export function subscribeToUserAds(
  userId: string,
  callback: RealtimeAdCallback
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`user-${userId}-ads-realtime`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ads',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        try {
          const event = payload.eventType as RealtimeEvent;
          
          const realtimePayload: RealtimeAdPayload = {
            event,
            new: payload.new as Ad | undefined,
            old: payload.old as Ad | undefined,
          };
          
          callback(realtimePayload);
        } catch (error) {
          console.error('[Realtime] Error processing user ad change:', error);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Successfully subscribed
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[Realtime] Channel error for user ${userId} ads`);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to profile changes for a specific user
 * 
 * Listens for UPDATE events on the profiles table for a specific user ID.
 * Useful for keeping profile data in sync across the app when updates occur.
 * 
 * @param userId - The user ID to watch profile changes for
 * @param callback - Function called when profile changes occur
 * @returns Unsubscribe function
 * 
 * @example
 * ```typescript
 * const unsubscribe = subscribeToProfile(userId, (payload) => {
 *   if (payload.event === 'UPDATE' && payload.new) {
 *     console.log('Profile updated:', payload.new);
 *     // Update your store/state here
 *   }
 * });
 * 
 * // Later: unsubscribe();
 * ```
 */
export function subscribeToProfile(
  userId: string,
  callback: RealtimeProfileCallback
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`profile-${userId}-realtime`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        try {
          const event = payload.eventType as RealtimeEvent;
          
          const realtimePayload: RealtimeProfilePayload = {
            event,
            new: payload.new as Profile | undefined,
            old: payload.old as Profile | undefined,
          };
          
          callback(realtimePayload);
        } catch (error) {
          console.error('[Realtime] Error processing profile change:', error);
        }
      }
    )
    .subscribe((status, err) => {
      try {
        if (status === 'SUBSCRIBED') {
          // Successfully subscribed
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[Realtime] Channel error for profile ${userId}`, err || '');
          // Don't throw - just log the error
        } else if (status === 'TIMED_OUT') {
          console.warn(`[Realtime] Profile subscription timed out for user ${userId}`);
        } else if (status === 'CLOSED') {
          // Subscription closed
        }
      } catch (error) {
        console.error(`[Realtime] Error in profile subscription callback for ${userId}:`, error);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================
// EXPORTS
// ============================================

export const realtimeService = {
  subscribeToAds,
  subscribeToAd,
  subscribeToUserAds,
  subscribeToProfile,
};

export default realtimeService;
