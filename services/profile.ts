import { supabase } from './supabase';
import type { Profile, ProfileUpdate } from '@/types/database';

/**
 * Profile Service
 * 
 * Handles profile-related database operations:
 * - Fetching profile data
 * - Updating profile information
 * - Managing business verification status
 */

// ============================================
// TYPES
// ============================================

interface ProfileResult {
  profile: Profile | null;
  error: string | null;
}

// ============================================
// FETCH OPERATIONS
// ============================================

/**
 * Get profile by user ID
 */
export async function getProfile(userId: string): Promise<ProfileResult> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Profile] Fetch error:', error.message);
      return { profile: null, error: error.message };
    }

    return { profile: data as Profile, error: null };
  } catch (error: any) {
    console.error('[Profile] Fetch exception:', error.message);
    return { profile: null, error: error.message };
  }
}

/**
 * Get profile by email
 */
export async function getProfileByEmail(email: string): Promise<ProfileResult> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('[Profile] Fetch by email error:', error.message);
      return { profile: null, error: error.message };
    }

    return { profile: data as Profile, error: null };
  } catch (error: any) {
    console.error('[Profile] Fetch by email exception:', error.message);
    return { profile: null, error: error.message };
  }
}

/**
 * Get current user's profile
 */
export async function getCurrentProfile(): Promise<ProfileResult> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { profile: null, error: 'Not authenticated' };
    }

    return getProfile(user.id);
  } catch (error: any) {
    console.error('[Profile] Get current profile exception:', error.message);
    return { profile: null, error: error.message };
  }
}

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update profile
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<ProfileResult> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Profile] Update error:', error.message);
      return { profile: null, error: error.message };
    }

    return { profile: data as Profile, error: null };
  } catch (error: any) {
    console.error('[Profile] Update exception:', error.message);
    return { profile: null, error: error.message };
  }
}

/**
 * Update current user's profile
 */
export async function updateCurrentProfile(
  updates: ProfileUpdate
): Promise<ProfileResult> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { profile: null, error: 'Not authenticated' };
    }

    return updateProfile(user.id, updates);
  } catch (error: any) {
    console.error('[Profile] Update current profile exception:', error.message);
    return { profile: null, error: error.message };
  }
}

// ============================================
// BUSINESS PROFILE OPERATIONS
// ============================================

/**
 * Update business information (for trade/brand accounts)
 */
export async function updateBusinessInfo(
  userId: string,
  businessInfo: {
    business_name?: string;
    business_address?: string;
    contact_person_name?: string;
    vat_number?: string;
    dealer_license?: string;
    business_logo_url?: string;
  }
): Promise<ProfileResult> {
  return updateProfile(userId, businessInfo);
}

/**
 * Update social links
 */
export async function updateSocialLinks(
  userId: string,
  socialLinks: {
    instagram_link?: string;
    facebook_link?: string;
    website_link?: string;
  }
): Promise<ProfileResult> {
  return updateProfile(userId, socialLinks);
}

/**
 * Update business logo URL
 */
export async function updateBusinessLogo(
  userId: string,
  logoUrl: string
): Promise<ProfileResult> {
  return updateProfile(userId, { business_logo_url: logoUrl });
}

/**
 * Update phone number
 */
export async function updatePhoneNumber(
  userId: string,
  phoneNumber: string
): Promise<ProfileResult> {
  return updateProfile(userId, { phone_number: phoneNumber });
}

// ============================================
// VERIFICATION OPERATIONS
// ============================================

/**
 * Check if user is verified
 */
export async function isUserVerified(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_verified')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Profile] Verification check error:', error.message);
      return false;
    }

    return data?.is_verified ?? false;
  } catch (error: any) {
    console.error('[Profile] Verification check exception:', error.message);
    return false;
  }
}

/**
 * Check if trade account is approved
 */
export async function isTradeAccountApproved(userId: string): Promise<{
  isApproved: boolean;
  status: string;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_approved, approval_status')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Profile] Approval check error:', error.message);
      return { isApproved: false, status: 'unknown' };
    }

    return {
      isApproved: data?.is_approved ?? false,
      status: data?.approval_status ?? 'pending',
    };
  } catch (error: any) {
    console.error('[Profile] Approval check exception:', error.message);
    return { isApproved: false, status: 'unknown' };
  }
}

// ============================================
// LISTING OPERATIONS (for public profiles)
// ============================================

/**
 * Get approved trade/brand profiles (for public listing)
 */
export async function getApprovedBusinessProfiles(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ profiles: Profile[]; error: string | null }> {
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .in('account_type', ['trade', 'brand'])
      .eq('approval_status', 'approved')
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Profile] Fetch approved profiles error:', error.message);
      return { profiles: [], error: error.message };
    }

    return { profiles: data as Profile[], error: null };
  } catch (error: any) {
    console.error('[Profile] Fetch approved profiles exception:', error.message);
    return { profiles: [], error: error.message };
  }
}

/**
 * Search profiles by business name
 */
export async function searchBusinessProfiles(
  searchTerm: string,
  options?: {
    limit?: number;
  }
): Promise<{ profiles: Profile[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('account_type', ['trade', 'brand'])
      .eq('approval_status', 'approved')
      .ilike('business_name', `%${searchTerm}%`)
      .limit(options?.limit || 20);

    if (error) {
      console.error('[Profile] Search profiles error:', error.message);
      return { profiles: [], error: error.message };
    }

    return { profiles: data as Profile[], error: null };
  } catch (error: any) {
    console.error('[Profile] Search profiles exception:', error.message);
    return { profiles: [], error: error.message };
  }
}

// ============================================
// STATS OPERATIONS
// ============================================

/**
 * Get user profile stats (ads count, followers, following)
 */
export async function getUserStats(userId: string): Promise<{
  adsCount: number;
  followersCount: number;
  followingCount: number;
  error: string | null;
}> {
  try {
    // Get ads count
    const { count: adsCount, error: adsError } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (adsError) {
      console.error('[Profile] Get ads count error:', adsError.message);
      return { adsCount: 0, followersCount: 0, followingCount: 0, error: adsError.message };
    }

    // TODO: Implement followers/following when follow system is added
    // For now, return placeholder values
    return {
      adsCount: adsCount || 0,
      followersCount: 0, // Placeholder - implement when follow system is added
      followingCount: 0, // Placeholder - implement when follow system is added
      error: null,
    };
  } catch (error: any) {
    console.error('[Profile] Get user stats exception:', error.message);
    return { adsCount: 0, followersCount: 0, followingCount: 0, error: error.message };
  }
}

// ============================================
// EXPORTS
// ============================================

export const profileService = {
  getProfile,
  getProfileByEmail,
  getCurrentProfile,
  updateProfile,
  updateCurrentProfile,
  updateBusinessInfo,
  updateSocialLinks,
  updateBusinessLogo,
  updatePhoneNumber,
  isUserVerified,
  isTradeAccountApproved,
  getApprovedBusinessProfiles,
  searchBusinessProfiles,
  getUserStats,
};

export default profileService;
