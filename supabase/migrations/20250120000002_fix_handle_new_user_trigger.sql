-- Migration: 20250120000002_fix_handle_new_user_trigger
-- Description: Fix the handle_new_user trigger with better error handling
-- Date: 2025-01-20

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if profile doesn't already exist
  INSERT INTO public.profiles (
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
    COALESCE(NEW.email, ''),
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
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
