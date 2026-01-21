-- Migration: 20250120000006_add_profile_banner
-- Description: Add profile banner image support
-- Date: 2025-01-20

-- Add profile_banner_url column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_banner_url TEXT;

COMMENT ON COLUMN profiles.profile_banner_url IS 'URL to user profile banner/background image';

-- Create storage bucket for profile banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-banners', 'profile-banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile banners
-- Users can upload their own profile banner
DROP POLICY IF EXISTS "Users can upload own profile banner" ON storage.objects;
CREATE POLICY "Users can upload own profile banner"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Anyone can view profile banners
DROP POLICY IF EXISTS "Anyone can view profile banners" ON storage.objects;
CREATE POLICY "Anyone can view profile banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-banners');

-- Users can update their own profile banner
DROP POLICY IF EXISTS "Users can update own profile banner" ON storage.objects;
CREATE POLICY "Users can update own profile banner"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own profile banner
DROP POLICY IF EXISTS "Users can delete own profile banner" ON storage.objects;
CREATE POLICY "Users can delete own profile banner"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
