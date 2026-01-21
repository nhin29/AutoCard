import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
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
  const appState = useRef(AppState.currentState);
  const isSigningOut = useRef(false);

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
   */
  useEffect(() => {
    if (!user?.id) {
      // No user, no subscription needed
      return;
    }

    // Subscribe to profile changes
    const unsubscribeProfile = subscribeToProfile(user.id, (payload) => {
      if (payload.event === 'UPDATE' && payload.new) {
        // Update profile in auth store
        setProfile(payload.new);
      }
    });

    // Cleanup subscription on unmount or when user changes
    return () => {
      unsubscribeProfile();
    };
  }, [user?.id, setProfile]);

  /**
   * Handle app state changes to destroy sessions when app closes
   * Destroys user session when app goes to background or inactive
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // Update app state ref immediately to prevent race conditions
      const previousState = appState.current;
      appState.current = nextAppState;
      
      // When app goes to background or inactive, destroy the session
      if (
        previousState.match(/active|foreground/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // Prevent multiple simultaneous signouts
        if (isSigningOut.current) {
          return;
        }
        
        // App is going to background - destroy session
        const currentUser = user;
        if (currentUser) {
          isSigningOut.current = true;
          try {
            await authService.signOut();
            logout();
            console.log('[RootLayout] Session destroyed on app close');
          } catch (error) {
            console.error('[RootLayout] Error destroying session on app close:', error);
            // Still clear local state even if server signout fails
            logout();
          } finally {
            isSigningOut.current = false;
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user, logout]);

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
