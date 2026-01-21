import type { Ad, AdInsert, AdStatus, AdType, MileageUnit } from '@/types/database';
import { uploadAdImages, uploadAdStories } from './storage';
import { supabase } from './supabase';

/**
 * Ad Service
 * 
 * Handles ad creation, updates, and queries in Supabase database.
 * Includes image/story upload functionality.
 */

// ============================================
// TYPES
// ============================================

/**
 * Form data structure from Place Ad screen
 */
export interface AdFormData {
  // Basic fields
  category: string;
  phoneNumber: string;
  location: string;
  currency: string;
  amount: string;
  description: string;
  itemName: string;
  
  // Image and story fields (local URIs)
  uploadedImages: string[];
  uploadedStories: string[];
  
  // Vehicle fields
  vehicleLicenseNumber: string;
  status: string;
  adType: string;
  mileage: string;
  mileageUnit: string;
  motNctStatus: string;
  vanMake: string;
  vanModel: string;
  vanYearOfProduction: string;
  loadCapacity: string;
}

/**
 * Result of ad creation
 */
export interface CreateAdResult {
  ad: Ad | null;
  error: string | null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map form status to database status
 * Database allows: 'new', 'used', 'certified'
 */
function mapStatusToDb(status: string): string | null {
  const statusMap: Record<string, string> = {
    'available': 'new',
    'sold': 'used',
    'pending': 'new',
    'reserved': 'new',
    'on-hold': 'new',
  };
  
  return statusMap[status] || 'new';
}

/**
 * Map form ad type to database ad type
 * Database allows: 'sale', 'rent', 'lease'
 */
function mapAdTypeToDb(adType: string): string | null {
  const adTypeMap: Record<string, string> = {
    'sell': 'sale',
    'buy': 'sale', // Treat buy as sale type
    'rent': 'rent',
    'auction': 'sale', // Treat auction as sale type
    'trade': 'sale', // Treat trade as sale type
  };
  
  return adTypeMap[adType] || 'sale';
}

/**
 * Map form mileage unit to database mileage unit
 * Database allows: 'km', 'miles'
 */
function mapMileageUnitToDb(mileageUnit: string): string | null {
  const unitMap: Record<string, string> = {
    'KM': 'km',
    'Miles': 'miles',
  };
  
  return unitMap[mileageUnit] || 'km';
}

/**
 * Convert form data to database insert format
 */
function convertFormDataToDb(
  formData: AdFormData,
  userId: string,
  imageUrls: string[],
  storyUrls: string[]
): AdInsert {
  return {
    user_id: userId,
    
    // Basic info
    category: formData.category,
    item_name: formData.itemName,
    description: formData.description || null,
    
    // Vehicle details
    vehicle_license_number: formData.vehicleLicenseNumber || null,
    status: (mapStatusToDb(formData.status) as AdStatus) || null,
    ad_type: (mapAdTypeToDb(formData.adType) as AdType) || null,
    mileage: formData.mileage || null,
    mileage_unit: (mapMileageUnitToDb(formData.mileageUnit) as MileageUnit) || null,
    mot_nct_status: formData.motNctStatus || null,
    van_make: formData.vanMake || null,
    van_model: formData.vanModel || null,
    van_year_of_production: formData.vanYearOfProduction || null,
    load_capacity: formData.loadCapacity || null,
    
    // Pricing & location
    currency: formData.currency || 'EUR',
    amount: formData.amount ? parseFloat(formData.amount) : null,
    location: formData.location || null,
    phone_number: formData.phoneNumber || null,
    
    // Media (URLs from uploaded files)
    uploaded_images: imageUrls,
    uploaded_stories: storyUrls,
    
    // Status & metrics (defaults)
    is_active: true,
    is_featured: false,
    published_at: new Date().toISOString(),
  };
}

// ============================================
// CREATE AD
// ============================================

/**
 * Create a new ad with images and stories
 * 
 * Steps:
 * 1. Upload images to Supabase Storage
 * 2. Upload stories to Supabase Storage
 * 3. Create ad record in database with image/story URLs
 * 
 * @param formData - Form data from Place Ad screen
 * @param userId - Current user ID
 * @returns Created ad or error
 */
export async function createAd(
  formData: AdFormData,
  userId: string
): Promise<CreateAdResult> {
  try {
    // Validate required fields
    if (!formData.category) {
      return { ad: null, error: 'Category is required' };
    }
    
    if (!formData.itemName) {
      return { ad: null, error: 'Item name is required' };
    }
    
    if (!formData.amount) {
      return { ad: null, error: 'Price is required' };
    }
    
    // Step 1: Upload images
    let imageUrls: string[] = [];
    if (formData.uploadedImages && formData.uploadedImages.length > 0) {
      const imageResult = await uploadAdImages(formData.uploadedImages, userId);
      
      if (imageResult.errors.length > 0) {
        console.warn('[Ad Service] Some images failed to upload:', imageResult.errors);
      }
      
      imageUrls = imageResult.urls;
    }
    
    // Step 2: Upload stories
    let storyUrls: string[] = [];
    if (formData.uploadedStories && formData.uploadedStories.length > 0) {
      const storyResult = await uploadAdStories(formData.uploadedStories, userId);
      
      if (storyResult.errors.length > 0) {
        console.warn('[Ad Service] Some stories failed to upload:', storyResult.errors);
      }
      
      storyUrls = storyResult.urls;
    }
    
    // Step 3: Convert form data to database format
    const adInsert: AdInsert = convertFormDataToDb(
      formData,
      userId,
      imageUrls,
      storyUrls
    );
    
    // Step 4: Insert ad into database
    const { data, error } = await supabase
      .from('ads')
      .insert(adInsert)
      .select()
      .single();
    
    if (error) {
      console.error('[Ad Service] Database error:', error);
      
      // If database insert fails, try to clean up uploaded files
      // (In production, you might want to implement a cleanup job)
      console.warn('[Ad Service] Ad creation failed, uploaded files may need cleanup');
      
      return { ad: null, error: error.message || 'Failed to create ad' };
    }
    
    if (!data) {
      return { ad: null, error: 'No data returned from database' };
    }
    
    return { ad: data as Ad, error: null };
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error creating ad';
    console.error('[Ad Service] Exception:', errorMessage);
    return { ad: null, error: errorMessage };
  }
}

// ============================================
// QUERY ADS
// ============================================

/**
 * Get all active ads
 */
export async function getActiveAds(): Promise<{ ads: Ad[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[Ad Service] Error fetching ads:', error);
      return { ads: [], error: error.message };
    }
    
    return { ads: (data as Ad[]) || [], error: null };
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error fetching ads';
    console.error('[Ad Service] Exception fetching ads:', errorMessage);
    return { ads: [], error: errorMessage };
  }
}

/**
 * Get ads by user ID
 */
export async function getAdsByUserId(userId: string): Promise<{ ads: Ad[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[Ad Service] Error fetching user ads:', error);
      return { ads: [], error: error.message };
    }
    
    return { ads: (data as Ad[]) || [], error: null };
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error fetching user ads';
    console.error('[Ad Service] Exception fetching user ads:', errorMessage);
    return { ads: [], error: errorMessage };
  }
}

/**
 * Get ad by ID
 */
export async function getAdById(adId: string): Promise<{ ad: Ad | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('id', adId)
      .single();
    
    if (error) {
      console.error('[Ad Service] Error fetching ad:', error);
      return { ad: null, error: error.message };
    }
    
    return { ad: (data as Ad) || null, error: null };
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error fetching ad';
    console.error('[Ad Service] Exception fetching ad:', errorMessage);
    return { ad: null, error: errorMessage };
  }
}

/**
 * Get related ads by category (excluding current ad)
 */
export async function getRelatedAds(
  category: string,
  excludeAdId: string,
  limit: number = 5
): Promise<{ ads: Ad[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .neq('id', excludeAdId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[Ad Service] Error fetching related ads:', error);
      return { ads: [], error: error.message };
    }
    
    return { ads: (data as Ad[]) || [], error: null };
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error fetching related ads';
    console.error('[Ad Service] Exception fetching related ads:', errorMessage);
    return { ads: [], error: errorMessage };
  }
}

// ============================================
// UPDATE AD
// ============================================

/**
 * Update an existing ad
 */
export async function updateAd(
  adId: string,
  updates: Partial<AdInsert>
): Promise<{ ad: Ad | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .update(updates)
      .eq('id', adId)
      .select()
      .single();
    
    if (error) {
      console.error('[Ad Service] Error updating ad:', error);
      return { ad: null, error: error.message };
    }
    
    return { ad: (data as Ad) || null, error: null };
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error updating ad';
    console.error('[Ad Service] Exception updating ad:', errorMessage);
    return { ad: null, error: errorMessage };
  }
}

/**
 * Delete an ad (soft delete by setting is_active to false)
 */
export async function deleteAd(adId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('ads')
      .update({ is_active: false })
      .eq('id', adId);
    
    if (error) {
      console.error('[Ad Service] Error deleting ad:', error);
      return { error: error.message };
    }
    
    return { error: null };
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error deleting ad';
    console.error('[Ad Service] Exception deleting ad:', errorMessage);
    return { error: errorMessage };
  }
}

// ============================================
// EXPORTS
// ============================================

export const adService = {
  createAd,
  getActiveAds,
  getAdsByUserId,
  getAdById,
  getRelatedAds,
  updateAd,
  deleteAd,
  uploadAdImages,
  uploadAdStories,
};

export default adService;
