import type {
    AuthUser,
    OtpPurpose,
    Profile,
    SignupData
} from '@/types/database';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Authentication Service
 * 
 * Handles all Supabase authentication operations including:
 * - Sign up with multi-step flow
 * - Sign in with email/password
 * - Password reset
 * - OTP verification
 * - Session management
 */

// ============================================
// TYPES
// ============================================

interface AuthResult {
  user: AuthUser | null;
  session: Session | null;
  error: string | null;
}

interface OtpResult {
  success: boolean;
  otp?: string;
  error: string | null;
}

interface VerifyOtpResult {
  success: boolean;
  error: string | null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Transform Supabase user to AuthUser with profile
 * 
 * Uses .maybeSingle() instead of .single() to handle cases where
 * the profile might not exist yet (e.g., during signup when the
 * trigger hasn't completed or failed silently).
 */
async function transformUser(user: User | null): Promise<AuthUser | null> {
  if (!user) return null;

  // Fetch profile data - use maybeSingle() to handle 0 or 1 row gracefully
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Error handled silently

  return {
    id: user.id,
    email: user.email || '',
    profile: profile as Profile | null,
  };
}

// ============================================
// SIGN UP
// ============================================

/**
 * Sign up a new user with all profile data
 * 
 * This creates the auth user and profile in one transaction.
 * Profile data is passed via user_metadata and stored by the database trigger.
 */
export async function signUp(data: SignupData): Promise<AuthResult> {
  try {
    // Validate required fields
    if (!data.email || !data.password) {
      return { user: null, session: null, error: 'Email and password are required' };
    }

    if (data.password.length < 8) {
      return { user: null, session: null, error: 'Password must be at least 8 characters' };
    }

    // For trade accounts, validate required business fields
    if (data.account_type === 'trade') {
      if (!data.business_name) {
        return { user: null, session: null, error: 'Business name is required for trade accounts' };
      }
      if (!data.contact_person_name) {
        return { user: null, session: null, error: 'Contact person name is required for trade accounts' };
      }
    }

    // Sign up with Supabase Auth
    // User metadata will be used by the database trigger to create the profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          account_type: data.account_type,
          business_name: data.business_name || null,
          business_address: data.business_address || null,
          contact_person_name: data.contact_person_name || null,
          vat_number: data.vat_number || null,
          dealer_license: data.dealer_license || null,
          instagram_link: data.instagram_link || null,
          facebook_link: data.facebook_link || null,
          website_link: data.website_link || null,
          phone_number: data.phone_number || null,
        },
      },
    });

    if (authError) {
      return { user: null, session: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, session: null, error: 'Signup failed - no user returned' };
    }

    // Wait a moment for the trigger to complete, then check if profile exists
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if profile was created by the trigger
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .maybeSingle();

    // If trigger failed to create profile, create it manually
    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          account_type: data.account_type || 'private',
          business_name: data.business_name || null,
          business_address: data.business_address || null,
          contact_person_name: data.contact_person_name || null,
          vat_number: data.vat_number || null,
          dealer_license: data.dealer_license || null,
          instagram_link: data.instagram_link || null,
          facebook_link: data.facebook_link || null,
          website_link: data.website_link || null,
          phone_number: data.phone_number || null,
        });

      if (profileError) {
        // Don't fail signup - user exists, profile can be created later
      }
    }

    // Transform to AuthUser
    const user = await transformUser(authData.user);

    return {
      user,
      session: authData.session,
      error: null,
    };
  } catch (error: any) {
    return { user: null, session: null, error: error.message };
  }
}

// ============================================
// SIGN IN
// ============================================

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    if (!email || !password) {
      return { user: null, session: null, error: 'Email and password are required' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        return { user: null, session: null, error: 'Invalid email or password' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { user: null, session: null, error: 'Please verify your email before signing in' };
      }
      
      return { user: null, session: null, error: error.message };
    }

    const user = await transformUser(data.user);

    return {
      user,
      session: data.session,
      error: null,
    };
  } catch (error: any) {
    return { user: null, session: null, error: error.message };
  }
}

// ============================================
// SIGN OUT
// ============================================

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Get the current session
 * 
 * Handles invalid refresh token errors gracefully
 */
export async function getSession(): Promise<{ session: Session | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      // Handle refresh token errors
      if (error.message.includes('Invalid Refresh Token') || 
          error.message.includes('Refresh Token Not Found') ||
          error.message.includes('refresh_token_not_found')) {
        await supabase.auth.signOut().catch(() => {
          // Ignore sign out errors
        });
        return { session: null, error: 'Session expired. Please sign in again.' };
      }
      
      return { session: null, error: error.message };
    }

    return { session: data.session, error: null };
  } catch (error: any) {
    // Handle refresh token errors in catch block
    if (error?.message?.includes('Invalid Refresh Token') || 
        error?.message?.includes('Refresh Token Not Found') ||
        error?.message?.includes('refresh_token_not_found')) {
      await supabase.auth.signOut().catch(() => {
        // Ignore sign out errors
      });
      return { session: null, error: 'Session expired. Please sign in again.' };
    }
    
    return { session: null, error: error.message };
  }
}

/**
 * Get the current user with profile
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    return transformUser(user);
  } catch (error: any) {
    return null;
  }
}

/**
 * Refresh the current session
 * 
 * Handles invalid refresh tokens gracefully by checking for existing session first
 * and clearing invalid sessions when refresh token is not found
 */
export async function refreshSession(): Promise<{ session: Session | null; error: string | null }> {
  try {
    // First check if we have a valid session
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    
    // If no session exists, there's nothing to refresh
    if (!currentSession) {
      return { session: null, error: 'No session to refresh' };
    }

    // Check if session is expired or about to expire (within 5 minutes)
    const expiresAt = currentSession.expires_at;
    if (expiresAt && expiresAt * 1000 > Date.now() + 5 * 60 * 1000) {
      // Session is still valid, return it
      return { session: currentSession, error: null };
    }

    // Attempt to refresh the session
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      // Handle specific refresh token errors
      if (error.message.includes('Invalid Refresh Token') || 
          error.message.includes('Refresh Token Not Found') ||
          error.message.includes('refresh_token_not_found')) {
        // Clear invalid session
        await supabase.auth.signOut();
        return { session: null, error: 'Session expired. Please sign in again.' };
      }
      
      return { session: null, error: error.message };
    }

    return { session: data.session, error: null };
  } catch (error: any) {
    // Handle refresh token errors in catch block as well
    if (error?.message?.includes('Invalid Refresh Token') || 
        error?.message?.includes('Refresh Token Not Found') ||
        error?.message?.includes('refresh_token_not_found')) {
      await supabase.auth.signOut().catch(() => {
        // Ignore sign out errors
      });
      return { session: null, error: 'Session expired. Please sign in again.' };
    }
    
    return { session: null, error: error.message };
  }
}

// ============================================
// OTP VERIFICATION
// ============================================

/**
 * Generate and send OTP for email verification
 * 
 * Note: This generates the OTP in the database. 
 * You'll need a Supabase Edge Function or external service to actually send the email.
 */
export async function generateOtp(
  userId: string, 
  email: string, 
  purpose: OtpPurpose = 'email_verification'
): Promise<OtpResult> {
  try {
    const { data, error } = await supabase.rpc('generate_otp', {
      p_user_id: userId,
      p_email: email,
      p_purpose: purpose,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // In production, you would send this OTP via email
    // For now, we return it (useful for development/testing)
    return { 
      success: true, 
      otp: data as string, // The generated OTP code
      error: null 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Verify OTP code
 */
export async function verifyOtp(
  userId: string, 
  otpCode: string, 
  purpose: OtpPurpose = 'email_verification'
): Promise<VerifyOtpResult> {
  try {
    const { data, error } = await supabase.rpc('verify_otp', {
      p_user_id: userId,
      p_otp: otpCode,
      p_purpose: purpose,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Invalid or expired OTP code' };
    }

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================
// PASSWORD RESET
// ============================================

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'autocard://auth/reset-password',
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Update password (when user is logged in or has reset token)
 */
export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  try {
    if (newPassword.length < 8) {
      return { error: 'Password must be at least 8 characters' };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

// ============================================
// AUTH STATE LISTENER
// ============================================

/**
 * Subscribe to auth state changes
 * 
 * Usage:
 * ```
 * const unsubscribe = onAuthStateChange((event, session) => {
 *   if (event === 'SIGNED_IN') {
 *     // Handle sign in
 *   }
 * });
 * 
 * // Later: unsubscribe();
 * ```
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    subscription.unsubscribe();
  };
}

// ============================================
// GUEST LOGIN
// ============================================

/**
 * Sign in as a guest (anonymous auth)
 * 
 * Note: Requires enabling anonymous sign-ins in Supabase dashboard
 */
export async function signInAsGuest(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    // Update profile to guest type
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ account_type: 'guest' })
        .eq('id', data.user.id);
    }

    const user = await transformUser(data.user);

    return {
      user,
      session: data.session,
      error: null,
    };
  } catch (error: any) {
    return { user: null, session: null, error: error.message };
  }
}

// ============================================
// EXPORTS
// ============================================

export const authService = {
  signUp,
  signIn,
  signOut,
  signInAsGuest,
  getSession,
  getCurrentUser,
  refreshSession,
  generateOtp,
  verifyOtp,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChange,
};

export default authService;
