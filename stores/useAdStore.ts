import { create } from 'zustand';

/**
 * Ad data structure matching all fields from the Place Ad form
 */
export interface Ad {
  id: string;
  userId?: string; // User ID from database
  // Basic fields
  category: string;
  phoneNumber: string;
  location: string;
  currency: string;
  amount: string;
  description: string;
  itemName: string;
  
  // Image and story fields
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
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Zustand store for managing ads
 * 
 * Provides centralized state management for all published ads,
 * allowing access from any component across the app.
 */
interface AdStore {
  ads: Ad[];
  draftAd: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'> | null;
  addAd: (ad: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>) => Ad;
  removeAd: (id: string) => void;
  updateAd: (id: string, updates: Partial<Ad>) => void;
  getAdById: (id: string) => Ad | undefined;
  clearAllAds: () => void;
  setDraftAd: (ad: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'> | null) => void;
  clearDraftAd: () => void;
  // Real-time sync methods
  syncAdFromDatabase: (databaseAd: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'> & { id: string; createdAt: string; updatedAt: string }) => void;
  removeAdById: (id: string) => void;
}

/**
 * Generate unique ID for new ads
 */
const generateAdId = (): string => {
  return `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create timestamp in ISO format
 */
const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export const useAdStore = create<AdStore>((set, get) => ({
  ads: [],
  draftAd: null,
  
  /**
   * Add a new ad to the store
   * Automatically generates ID and timestamps
   */
  addAd: (adData) => {
    const newAd: Ad = {
      ...adData,
      id: generateAdId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    
    set((state) => ({
      ads: [...state.ads, newAd],
      draftAd: null, // Clear draft after publishing
    }));
    
    return newAd;
  },
  
  /**
   * Remove an ad by ID
   */
  removeAd: (id) => {
    set((state) => ({
      ads: state.ads.filter((ad) => ad.id !== id),
    }));
  },
  
  /**
   * Update an existing ad
   * Updates the updatedAt timestamp automatically
   */
  updateAd: (id, updates) => {
    set((state) => ({
      ads: state.ads.map((ad) =>
        ad.id === id
          ? { ...ad, ...updates, updatedAt: getCurrentTimestamp() }
          : ad
      ),
    }));
  },
  
  /**
   * Get a specific ad by ID
   */
  getAdById: (id) => {
    return get().ads.find((ad) => ad.id === id);
  },
  
  /**
   * Clear all ads from the store
   */
  clearAllAds: () => {
    set({ ads: [] });
  },
  
  /**
   * Set draft ad data (temporary storage for preview/back navigation)
   */
  setDraftAd: (adData) => {
    set({ draftAd: adData });
  },
  
  /**
   * Clear draft ad data
   */
  clearDraftAd: () => {
    set({ draftAd: null });
  },
  
  /**
   * Sync ad from database (for real-time updates)
   * Adds or updates an ad from database format
   * Ensures no duplicates by checking ID match (strict equality)
   */
  syncAdFromDatabase: (databaseAd) => {
    set((state) => {
      // Use strict equality to ensure ID matching works correctly
      const existingIndex = state.ads.findIndex((ad) => String(ad.id) === String(databaseAd.id));
      
      if (existingIndex >= 0) {
        // Update existing ad - replace it completely with new data
        const updatedAds = [...state.ads];
        updatedAds[existingIndex] = databaseAd;
        return { ads: updatedAds };
      } else {
        // Add new ad only if it doesn't exist
        // Double-check to prevent duplicates
        const alreadyExists = state.ads.some((ad) => String(ad.id) === String(databaseAd.id));
        if (alreadyExists) {
          // Ad exists but wasn't found by findIndex - update it
          return {
            ads: state.ads.map((ad) =>
              String(ad.id) === String(databaseAd.id) ? databaseAd : ad
            ),
          };
        }
        // Add new ad
        return { ads: [databaseAd, ...state.ads] };
      }
    });
  },
  
  /**
   * Remove ad by ID (for real-time deletes)
   */
  removeAdById: (id) => {
    set((state) => ({
      ads: state.ads.filter((ad) => ad.id !== id),
    }));
  },
}));
