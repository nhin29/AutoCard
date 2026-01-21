-- Migration: 20250120000001_authentication_system
-- Description: Complete authentication schema for AutoCart app
-- Author: AutoCart Team
-- Date: 2025-01-20

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Extends Supabase auth.users with application-specific data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL DEFAULT 'private' CHECK (account_type IN ('trade', 'private', 'brand', 'guest')),
  email TEXT NOT NULL,
  phone_number TEXT,
  
  -- Business fields (for trade/brand accounts)
  business_name TEXT,
  business_address TEXT,
  contact_person_name TEXT,
  vat_number TEXT,
  dealer_license TEXT,
  business_logo_url TEXT,
  
  -- Social links
  instagram_link TEXT,
  facebook_link TEXT,
  website_link TEXT,
  
  -- Status & verification
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  verification_badge BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth with business and verification data';
COMMENT ON COLUMN profiles.account_type IS 'Type of account: trade (dealership), private (individual), brand (manufacturer), guest';
COMMENT ON COLUMN profiles.approval_status IS 'Approval status for trade accounts that require manual review';

-- ============================================
-- 2. OTP VERIFICATIONS TABLE
-- ============================================
-- Stores OTP codes for email verification and password reset
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  purpose TEXT DEFAULT 'email_verification' CHECK (purpose IN ('email_verification', 'password_reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for OTP lookups
CREATE INDEX IF NOT EXISTS idx_otp_user_id ON otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

COMMENT ON TABLE otp_verifications IS 'Stores OTP codes for email verification and password reset flows';

-- ============================================
-- 3. ADS TABLE
-- ============================================
-- Vehicle and item listings
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic info
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  
  -- Vehicle details
  vehicle_license_number TEXT,
  status TEXT CHECK (status IN ('new', 'used', 'certified')),
  ad_type TEXT CHECK (ad_type IN ('sale', 'rent', 'lease')),
  mileage TEXT,
  mileage_unit TEXT CHECK (mileage_unit IN ('km', 'miles')),
  mot_nct_status TEXT,
  van_make TEXT,
  van_model TEXT,
  van_year_of_production TEXT,
  load_capacity TEXT,
  
  -- Pricing & location
  currency TEXT DEFAULT 'EUR',
  amount DECIMAL(12,2),
  location TEXT,
  phone_number TEXT,
  
  -- Media (stored as arrays of URLs)
  uploaded_images TEXT[] DEFAULT '{}',
  uploaded_stories TEXT[] DEFAULT '{}',
  
  -- Status & metrics
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  enquiries_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Indexes for ad queries
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_category ON ads(category);
CREATE INDEX IF NOT EXISTS idx_ads_is_active ON ads(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_location ON ads(location);

COMMENT ON TABLE ads IS 'Vehicle and item listings posted by users';

-- ============================================
-- 4. AD ENQUIRIES TABLE
-- ============================================
-- Messages from interested buyers
CREATE TABLE IF NOT EXISTS ad_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  enquirer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  enquirer_name TEXT NOT NULL,
  enquirer_email TEXT NOT NULL,
  enquirer_phone TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_ad_id ON ad_enquiries(ad_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_enquirer_id ON ad_enquiries(enquirer_id);

COMMENT ON TABLE ad_enquiries IS 'Enquiry messages sent by interested buyers to ad owners';

-- ============================================
-- 5. FAVORITES TABLE
-- ============================================
-- User saved/favorited ads
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_ad_id ON favorites(ad_id);

COMMENT ON TABLE favorites IS 'User favorite/saved ads for quick access';

-- ============================================
-- 6. STORAGE BUCKETS
-- ============================================
-- Create storage buckets for media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('business-logos', 'business-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('ad-images', 'ad-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('ad-stories', 'ad-stories', true, 52428800, ARRAY['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. TRIGGERS & FUNCTIONS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to ads
DROP TRIGGER IF EXISTS trigger_ads_updated_at ON ads;
CREATE TRIGGER trigger_ads_updated_at
  BEFORE UPDATE ON ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create profile on user signup
-- This function is called automatically when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    email, 
    account_type,
    business_name,
    business_address,
    contact_person_name,
    vat_number,
    dealer_license,
    instagram_link,
    facebook_link,
    website_link,
    phone_number
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'private'),
    NEW.raw_user_meta_data->>'business_name',
    NEW.raw_user_meta_data->>'business_address',
    NEW.raw_user_meta_data->>'contact_person_name',
    NEW.raw_user_meta_data->>'vat_number',
    NEW.raw_user_meta_data->>'dealer_license',
    NEW.raw_user_meta_data->>'instagram_link',
    NEW.raw_user_meta_data->>'facebook_link',
    NEW.raw_user_meta_data->>'website_link',
    NEW.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Generate OTP function
-- Creates a new 4-digit OTP code and stores it in otp_verifications
CREATE OR REPLACE FUNCTION generate_otp(p_user_id UUID, p_email TEXT, p_purpose TEXT DEFAULT 'email_verification')
RETURNS TEXT AS $$
DECLARE
  v_otp TEXT;
BEGIN
  -- Generate 4-digit OTP
  v_otp := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Invalidate previous OTPs for same purpose
  DELETE FROM otp_verifications 
  WHERE user_id = p_user_id 
    AND purpose = p_purpose 
    AND verified_at IS NULL;
  
  -- Insert new OTP (expires in 10 minutes)
  INSERT INTO otp_verifications (user_id, email, otp_code, purpose, expires_at)
  VALUES (p_user_id, p_email, v_otp, p_purpose, NOW() + INTERVAL '10 minutes');
  
  RETURN v_otp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify OTP function
-- Validates OTP code and marks user as verified if successful
CREATE OR REPLACE FUNCTION verify_otp(p_user_id UUID, p_otp TEXT, p_purpose TEXT DEFAULT 'email_verification')
RETURNS BOOLEAN AS $$
DECLARE
  v_valid BOOLEAN := FALSE;
  v_record otp_verifications%ROWTYPE;
BEGIN
  -- Find matching OTP
  SELECT * INTO v_record
  FROM otp_verifications
  WHERE user_id = p_user_id 
    AND otp_code = p_otp 
    AND purpose = p_purpose
    AND expires_at > NOW()
    AND verified_at IS NULL
    AND attempts < 5
  LIMIT 1;
  
  IF v_record.id IS NOT NULL THEN
    -- Mark OTP as verified
    UPDATE otp_verifications
    SET verified_at = NOW()
    WHERE id = v_record.id;
    
    -- Mark user profile as verified for email verification purpose
    IF p_purpose = 'email_verification' THEN
      UPDATE profiles SET is_verified = TRUE WHERE id = p_user_id;
    END IF;
    
    v_valid := TRUE;
  ELSE
    -- Increment attempt counter on failure
    UPDATE otp_verifications
    SET attempts = attempts + 1
    WHERE user_id = p_user_id 
      AND purpose = p_purpose
      AND verified_at IS NULL;
  END IF;
  
  RETURN v_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment ad view count function
CREATE OR REPLACE FUNCTION increment_ad_views(p_ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ads SET views_count = views_count + 1 WHERE id = p_ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment ad enquiries count function
CREATE OR REPLACE FUNCTION increment_ad_enquiries(p_ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ads SET enquiries_count = enquiries_count + 1 WHERE id = p_ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view approved business profiles" ON profiles;
CREATE POLICY "Public can view approved business profiles" ON profiles
  FOR SELECT USING (
    account_type IN ('trade', 'brand') 
    AND approval_status = 'approved'
  );

-- ADS POLICIES
DROP POLICY IF EXISTS "Anyone can view active ads" ON ads;
CREATE POLICY "Anyone can view active ads" ON ads
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can view own ads" ON ads;
CREATE POLICY "Users can view own ads" ON ads
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own ads" ON ads;
CREATE POLICY "Users can create own ads" ON ads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ads" ON ads;
CREATE POLICY "Users can update own ads" ON ads
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own ads" ON ads;
CREATE POLICY "Users can delete own ads" ON ads
  FOR DELETE USING (auth.uid() = user_id);

-- OTP POLICIES
DROP POLICY IF EXISTS "Users can view own OTPs" ON otp_verifications;
CREATE POLICY "Users can view own OTPs" ON otp_verifications
  FOR SELECT USING (auth.uid() = user_id);

-- ENQUIRIES POLICIES
DROP POLICY IF EXISTS "Anyone can create enquiry" ON ad_enquiries;
CREATE POLICY "Anyone can create enquiry" ON ad_enquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Ad owners can view enquiries" ON ad_enquiries;
CREATE POLICY "Ad owners can view enquiries" ON ad_enquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ads WHERE ads.id = ad_enquiries.ad_id AND ads.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Enquirers can view own enquiries" ON ad_enquiries;
CREATE POLICY "Enquirers can view own enquiries" ON ad_enquiries
  FOR SELECT USING (enquirer_id = auth.uid());

DROP POLICY IF EXISTS "Ad owners can update enquiries" ON ad_enquiries;
CREATE POLICY "Ad owners can update enquiries" ON ad_enquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM ads WHERE ads.id = ad_enquiries.ad_id AND ads.user_id = auth.uid()
    )
  );

-- FAVORITES POLICIES
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 9. STORAGE POLICIES
-- ============================================

-- Business logos policies
DROP POLICY IF EXISTS "Users can upload own business logo" ON storage.objects;
CREATE POLICY "Users can upload own business logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Anyone can view business logos" ON storage.objects;
CREATE POLICY "Anyone can view business logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-logos');

DROP POLICY IF EXISTS "Users can update own business logo" ON storage.objects;
CREATE POLICY "Users can update own business logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own business logo" ON storage.objects;
CREATE POLICY "Users can delete own business logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Ad images policies
DROP POLICY IF EXISTS "Users can upload ad images" ON storage.objects;
CREATE POLICY "Users can upload ad images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ad-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Anyone can view ad images" ON storage.objects;
CREATE POLICY "Anyone can view ad images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-images');

DROP POLICY IF EXISTS "Users can delete own ad images" ON storage.objects;
CREATE POLICY "Users can delete own ad images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ad-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Ad stories policies
DROP POLICY IF EXISTS "Users can upload ad stories" ON storage.objects;
CREATE POLICY "Users can upload ad stories"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ad-stories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Anyone can view ad stories" ON storage.objects;
CREATE POLICY "Anyone can view ad stories"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-stories');

DROP POLICY IF EXISTS "Users can delete own ad stories" ON storage.objects;
CREATE POLICY "Users can delete own ad stories"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ad-stories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
