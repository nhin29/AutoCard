import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/auth';
import { subscribeToProfile } from '@/services/realtime';
import { useAuthStore } from '@/stores/useAuthStore';

export const unstable_settings = {
  initialRouteName: 'index',
};

/**
 * Root Layout
 * 
 * Provides:
 * - Theme provider for light/dark mode
 * - Auth state listener for session management
 * - Navigation stack configuration
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user, setUser, setSession, setProfile, setLoading, logout } = useAuthStore();

  /**
   * Initialize auth state on app load
   * Listens for auth state changes from Supabase
   */
  useEffect(() => {
    // Check initial session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { session } = await authService.getSession();
        
        if (session) {
          // Session exists, get user data
          const user = await authService.getCurrentUser();
          
          if (user) {
            setUser(user);
            setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at ?? Date.now() + 3600000,
            });
          } else {
            // User not found, clear session
            logout();
          }
        } else {
          // No session
          logout();
        }
      } catch (error) {
        console.error('[RootLayout] Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = await authService.getCurrentUser();
        if (user) {
          setUser(user);
          setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at ?? Date.now() + 3600000,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        logout();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at ?? Date.now() + 3600000,
        });
      } else if (event === 'USER_UPDATED' && session) {
        const user = await authService.getCurrentUser();
        if (user) {
          setUser(user);
        }
      }
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Subscribe to profile realtime updates when user is authenticated
   * Automatically updates auth store when profile changes occur
   * 
   * Note: Subscription failures are handled gracefully - app continues to work
   * without realtime updates if realtime is disabled or unavailable
   */
  useEffect(() => {
    if (!user?.id) {
      // No user, no subscription needed
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;

    try {
      // Subscribe to profile changes with error handling
      unsubscribeProfile = subscribeToProfile(user.id, (payload) => {
        try {
          if (payload.event === 'UPDATE' && payload.new) {
            // Update profile in auth store
            setProfile(payload.new);
          }
        } catch (error) {
          // Silently handle errors in callback
          if (__DEV__) {
            console.warn('[RootLayout] Error handling profile update:', error);
          }
        }
      });
    } catch (error) {
      // Silently handle subscription creation errors
      // App will continue to work without realtime updates
      if (__DEV__) {
        console.warn('[RootLayout] Failed to create profile subscription:', error);
      }
    }

    // Cleanup subscription on unmount or when user changes
    return () => {
      if (unsubscribeProfile) {
        try {
          unsubscribeProfile();
        } catch (error) {
          // Silently handle cleanup errors
          if (__DEV__) {
            console.warn('[RootLayout] Error cleaning up profile subscription:', error);
          }
        }
      }
    };
  }, [user?.id, setProfile]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="ads" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="legal" options={{ headerShown: false }} />
        <Stack.Screen name="scanner" options={{ headerShown: false }} />
        <Stack.Screen name="story" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
