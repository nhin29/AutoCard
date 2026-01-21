# Real-time Profile Updates

## Overview

The app now supports real-time profile updates. When a user's profile is updated (either by themselves or by an admin), the changes are immediately reflected across all pages that display profile information.

## How It Works

### 1. Database Setup
- **Migration**: `20250120000005_enable_realtime_profiles.sql`
- Enables Supabase realtime for the `profiles` table
- Allows clients to subscribe to profile changes

### 2. Realtime Service
- **File**: `services/realtime.ts`
- **Function**: `subscribeToProfile(userId, callback)`
- Subscribes to UPDATE events on the profiles table for a specific user
- Returns an unsubscribe function for cleanup

### 3. Root Layout Integration
- **File**: `app/_layout.tsx`
- Automatically sets up profile subscription when user is authenticated
- Updates auth store (`useAuthStore`) when profile changes are detected
- Cleans up subscription when user logs out or component unmounts

### 4. Store Updates
- **File**: `stores/useAuthStore.ts`
- `setProfile()` method updates the profile in the auth store
- All components using `useAuthStore` automatically receive updates via Zustand reactivity

### 5. Component Updates
- **Profile Screen**: `app/(tabs)/profile.tsx`
  - Listens to `user?.profile` changes from auth store
  - Automatically updates UI when profile changes
  
- **Sidebar**: `components/Sidebar.tsx`
  - Uses `user?.profile?.account_type` from auth store
  - Automatically reflects changes

## Flow Diagram

```
Profile Update (edit-profile.tsx)
    ↓
Supabase Database (profiles table)
    ↓
Supabase Realtime (broadcasts UPDATE event)
    ↓
Root Layout (subscribes to profile changes)
    ↓
Auth Store (setProfile() updates state)
    ↓
All Components (automatically re-render with new data)
```

## Testing

1. **Open the app** and log in
2. **Open Profile screen** in one tab/window
3. **Edit profile** in another tab/window (or from edit-profile screen)
4. **Save changes**
5. **Observe**: Profile screen should update automatically without refresh

## Files Modified

1. `services/realtime.ts` - Added `subscribeToProfile()` function
2. `app/_layout.tsx` - Added profile subscription setup
3. `app/(tabs)/profile.tsx` - Added listener for profile updates
4. `supabase/migrations/20250120000005_enable_realtime_profiles.sql` - New migration

## Notes

- Only UPDATE events are subscribed to (INSERT/DELETE are not needed for profiles)
- Subscription is automatically cleaned up when user logs out
- All pages using `useAuthStore` will automatically reflect profile changes
- No manual refresh needed - updates are instant
