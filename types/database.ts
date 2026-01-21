/**
 * Database Types for AutoCart
 * 
 * These types mirror the Supabase database schema.
 * Run `npm run db:types` to regenerate from the actual database.
 */

// ============================================
// ENUM TYPES
// ============================================

export type AccountType = 'trade' | 'private' | 'brand' | 'guest';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type AdStatus = 'new' | 'used' | 'certified';

export type AdType = 'sale' | 'rent' | 'lease';

export type MileageUnit = 'km' | 'miles';

export type OtpPurpose = 'email_verification' | 'password_reset';

// ============================================
// TABLE TYPES
// ============================================

/**
 * User profile extending Supabase auth.users
 */
export interface Profile {
  id: string;
  account_type: AccountType;
  email: string;
  phone_number: string | null;
  
  // Business fields (for trade/brand accounts)
  business_name: string | null;
  business_address: string | null;
  contact_person_name: string | null;
  vat_number: string | null;
  dealer_license: string | null;
  business_logo_url: string | null;
  
  // Profile images
  profile_banner_url: string | null;
  
  // Social links
  instagram_link: string | null;
  facebook_link: string | null;
  website_link: string | null;
  
  // Status & verification
  is_verified: boolean;
  is_approved: boolean;
  approval_status: ApprovalStatus;
  verification_badge: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

/**
 * OTP verification record
 */
export interface OtpVerification {
  id: string;
  user_id: string;
  email: string;
  otp_code: string;
  purpose: OtpPurpose;
  expires_at: string;
  verified_at: string | null;
  attempts: number;
  created_at: string;
}

/**
 * Vehicle/item listing
 */
export interface Ad {
  id: string;
  user_id: string;
  
  // Basic info
  category: string;
  item_name: string;
  description: string | null;
  
  // Vehicle details
  vehicle_license_number: string | null;
  status: AdStatus | null;
  ad_type: AdType | null;
  mileage: string | null;
  mileage_unit: MileageUnit | null;
  mot_nct_status: string | null;
  van_make: string | null;
  van_model: string | null;
  van_year_of_production: string | null;
  load_capacity: string | null;
  
  // Pricing & location
  currency: string;
  amount: number | null;
  location: string | null;
  phone_number: string | null;
  
  // Media
  uploaded_images: string[];
  uploaded_stories: string[];
  
  // Status & metrics
  is_active: boolean;
  is_featured: boolean;
  views_count: number;
  enquiries_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/**
 * Enquiry from interested buyer
 */
export interface AdEnquiry {
  id: string;
  ad_id: string;
  enquirer_id: string | null;
  enquirer_name: string;
  enquirer_email: string;
  enquirer_phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

/**
 * User favorite/saved ad
 */
export interface Favorite {
  id: string;
  user_id: string;
  ad_id: string;
  created_at: string;
}

// ============================================
// INSERT TYPES (for creating new records)
// ============================================

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;

export type AdInsert = Omit<Ad, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'enquiries_count'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  views_count?: number;
  enquiries_count?: number;
};

export type AdUpdate = Partial<Omit<Ad, 'id' | 'user_id' | 'created_at'>>;

export type AdEnquiryInsert = Omit<AdEnquiry, 'id' | 'created_at' | 'is_read'> & {
  id?: string;
  created_at?: string;
  is_read?: boolean;
};

export type FavoriteInsert = Omit<Favorite, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

// ============================================
// AUTH TYPES
// ============================================

/**
 * Data collected during signup flow
 */
export interface SignupData {
  email: string;
  password: string;
  account_type: AccountType;
  
  // Business fields (for trade/brand accounts)
  business_name?: string;
  business_address?: string;
  contact_person_name?: string;
  vat_number?: string;
  dealer_license?: string;
  business_logo_url?: string;
  
  // Social links
  instagram_link?: string;
  facebook_link?: string;
  website_link?: string;
  
  // Contact
  phone_number?: string;
}

/**
 * Auth session user with profile
 */
export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
}

/**
 * Auth state for the store
 */
export interface AuthState {
  user: AuthUser | null;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// SUPABASE DATABASE TYPE (for client)
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      ads: {
        Row: Ad;
        Insert: AdInsert;
        Update: AdUpdate;
      };
      ad_enquiries: {
        Row: AdEnquiry;
        Insert: AdEnquiryInsert;
        Update: Partial<AdEnquiry>;
      };
      favorites: {
        Row: Favorite;
        Insert: FavoriteInsert;
        Update: Partial<Favorite>;
      };
      otp_verifications: {
        Row: OtpVerification;
        Insert: Omit<OtpVerification, 'id' | 'created_at'>;
        Update: Partial<OtpVerification>;
      };
    };
    Functions: {
      generate_otp: {
        Args: { p_user_id: string; p_email: string; p_purpose?: string };
        Returns: string;
      };
      verify_otp: {
        Args: { p_user_id: string; p_otp: string; p_purpose?: string };
        Returns: boolean;
      };
      increment_ad_views: {
        Args: { p_ad_id: string };
        Returns: void;
      };
      increment_ad_enquiries: {
        Args: { p_ad_id: string };
        Returns: void;
      };
    };
  };
}
