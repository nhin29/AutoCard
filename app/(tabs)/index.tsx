import { AdCard } from '@/components/AdCard';
import { ContactModal } from '@/components/ContactModal';
import { EnquiryModal } from '@/components/EnquiryModal';
import { EnquirySuccessModal } from '@/components/EnquirySuccessModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { adService } from '@/services/ad';
import { getProfile } from '@/services/profile';
import { subscribeToAds } from '@/services/realtime';
import type { Ad } from '@/stores/useAdStore';
import { useAdStore } from '@/stores/useAdStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Ad as DatabaseAd, Profile } from '@/types/database';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Home Screen
 * 
 * Main home page with empty state for posting first ad.
 */
/**
 * Format timestamp to relative time (e.g., "12 mins ago")
 */
const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const adDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - adDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} secs ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

/**
 * Convert database Ad format to store Ad format
 */
function convertDatabaseAdToStore(ad: DatabaseAd): Ad {
  return {
    id: ad.id,
    userId: ad.user_id,
    category: ad.category,
    phoneNumber: ad.phone_number || '',
    location: ad.location || '',
    currency: ad.currency,
    amount: ad.amount?.toString() || '',
    description: ad.description || '',
    itemName: ad.item_name,
    uploadedImages: ad.uploaded_images,
    uploadedStories: ad.uploaded_stories,
    vehicleLicenseNumber: ad.vehicle_license_number || '',
    status: ad.status || '',
    adType: ad.ad_type || '',
    mileage: ad.mileage || '',
    mileageUnit: ad.mileage_unit || '',
    motNctStatus: ad.mot_nct_status || '',
    vanMake: ad.van_make || '',
    vanModel: ad.van_model || '',
    vanYearOfProduction: ad.van_year_of_production || '',
    loadCapacity: ad.load_capacity || '',
    createdAt: ad.created_at,
    updatedAt: ad.updated_at,
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const storeAds = useAdStore((state) => state.ads);
  const syncAdFromDatabase = useAdStore((state) => state.syncAdFromDatabase);
  const removeAdById = useAdStore((state) => state.removeAdById);
  const flatListRef = useRef<FlatList>(null);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [selectedAd, setSelectedAd] = useState<{ phoneNumber?: string; createdAt?: string; userId?: string } | null>(null);
  const [selectedAdSellerProfile, setSelectedAdSellerProfile] = useState<Profile | null>(null);
  const [enquiryModalVisible, setEnquiryModalVisible] = useState(false);
  const [enquirySuccessVisible, setEnquirySuccessVisible] = useState(false);
  const [selectedAdForEnquiry, setSelectedAdForEnquiry] = useState<{ itemName?: string } | null>(null);
  const [databaseAds, setDatabaseAds] = useState<Ad[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(true);

  // Check if user is a guest (no session/user = guest)
  const isGuest = !user;

  // Load ads from database on mount
  useEffect(() => {
    const loadAds = async () => {
      try {
        setIsLoadingAds(true);
        const result = await adService.getActiveAds();
        
        if (result.error) {
          console.error('[HomeScreen] Error loading ads:', result.error);
          setDatabaseAds([]);
        } else {
          // Convert database ads to store format
          const convertedAds = result.ads.map(convertDatabaseAdToStore);
          setDatabaseAds(convertedAds);
        }
      } catch (error) {
        console.error('[HomeScreen] Exception loading ads:', error);
        setDatabaseAds([]);
      } finally {
        setIsLoadingAds(false);
      }
    };

    loadAds();
  }, []);

  // Set up real-time subscription for ads
  // Note: Subscription failures are handled gracefully - app continues to work
  // without realtime updates if realtime is disabled or unavailable
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = subscribeToAds((payload) => {
        try {
          if (payload.event === 'INSERT' && payload.new) {
            // New ad created - add to database ads
            const convertedAd = convertDatabaseAdToStore(payload.new);
            
            // Update database ads state
            setDatabaseAds((prev) => {
              // Check if ad already exists (avoid duplicates)
              if (prev.find((ad) => ad.id === convertedAd.id)) {
                return prev;
              }
              // Add new ad at the beginning (most recent first)
              return [convertedAd, ...prev];
            });
          } else if (payload.event === 'UPDATE' && payload.new) {
            // Ad updated - update in database ads
            const convertedAd = convertDatabaseAdToStore(payload.new);
            
            // Only update if ad is still active
            if (!payload.new.is_active) {
              // Ad was deactivated - remove it
              setDatabaseAds((prev) => prev.filter((ad) => ad.id !== convertedAd.id));
              removeAdById(convertedAd.id);
              return;
            }
            
            // Update database ads state
            setDatabaseAds((prev) =>
              prev.map((ad) => (ad.id === convertedAd.id ? convertedAd : ad))
            );
            
            // Also sync to store if it exists there
            syncAdFromDatabase(convertedAd);
          } else if (payload.event === 'DELETE' && payload.old) {
            // Ad deleted - remove from database ads
            const deletedAdId = payload.old.id;
            
            // Remove from database ads state
            setDatabaseAds((prev) => prev.filter((ad) => ad.id !== deletedAdId));
            
            // Also remove from store if it exists there
            removeAdById(deletedAdId);
          }
        } catch (error) {
          // Silently handle errors in callback
          if (__DEV__) {
            console.warn('[HomeScreen] Error handling real-time update:', error);
          }
        }
      });
    } catch (error) {
      // Silently handle subscription creation errors
      if (__DEV__) {
        console.warn('[HomeScreen] Failed to create ads subscription:', error);
      }
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          // Silently handle cleanup errors
          if (__DEV__) {
            console.warn('[HomeScreen] Error cleaning up ads subscription:', error);
          }
        }
      }
    };
  }, [syncAdFromDatabase, removeAdById]);

  // Combine store ads and database ads, prioritizing store ads (newly created)
  const allAds = useMemo(() => {
    const storeAdIds = new Set(storeAds.map(ad => ad.id));
    const uniqueDatabaseAds = databaseAds.filter(ad => !storeAdIds.has(ad.id));
    return [...storeAds, ...uniqueDatabaseAds];
  }, [storeAds, databaseAds]);

  const handlePlaceAd = () => {
    if (isGuest) {
      router.push('/auth/signin');
      return;
    }
    router.push('/ads/place-ad');
  };

  const handlePostFirstAd = () => {
    if (isGuest) {
      router.push('/auth/signin');
      return;
    }
    router.push('/ads/place-ad');
  };

  const handleFilter = () => {
    router.push('/(tabs)/filter');
  };

  const handleCall = async (adId: string) => {
    const ad = allAds.find((a) => a.id === adId);
    if (ad?.phoneNumber) {
      setSelectedAd({
        phoneNumber: ad.phoneNumber,
        createdAt: ad.createdAt,
        userId: ad.userId,
      });
      
      // Fetch seller profile for the selected ad
      if (ad.userId) {
        try {
          const result = await getProfile(ad.userId);
          if (result.profile) {
            setSelectedAdSellerProfile(result.profile);
          }
        } catch (error) {
          console.error('[HomeScreen] Error fetching seller profile:', error);
        }
      }
      
      setContactModalVisible(true);
    } else {
      Alert.alert('No Phone Number', 'Phone number not available for this ad');
    }
  };

  const handleCloseContactModal = () => {
    setContactModalVisible(false);
    setSelectedAd(null);
    setSelectedAdSellerProfile(null);
  };

  const handleMessage = (adId: string) => {
    const ad = allAds.find((a) => a.id === adId);
    if (ad) {
      setSelectedAdForEnquiry({
        itemName: ad.itemName,
      });
      setEnquiryModalVisible(true);
    }
  };

  const handleCloseEnquiryModal = () => {
    setEnquiryModalVisible(false);
    setSelectedAdForEnquiry(null);
  };

  const handleEnquirySubmit = () => {
    setEnquirySuccessVisible(true);
  };

  const handleCloseEnquirySuccess = () => {
    setEnquirySuccessVisible(false);
  };

  const handleBackToListings = () => {
    setEnquirySuccessVisible(false);
    router.replace('/(tabs)');
  };

  const handleNotify = (adId: string) => {
    // TODO: Implement notification/save functionality
    Alert.alert('Notifications', 'You will be notified about updates for this ad');
  };

  const handleThumbnailPress = (adId: string, index: number) => {
    // TODO: Open image gallery at specific index
  };

  const handleAdPress = (adId: string) => {
    router.push({
      pathname: '/ads/ad-detail',
      params: { adId },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        {/* Logo and Tagline */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/auth-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.placeAdButton}
            onPress={handlePlaceAd}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={styles.placeAdButtonText}>Place Ad +</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={handleFilter}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <IconSymbol name="slider.horizontal.3" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content - Vertical Ads List or Empty State */}
      {isLoadingAds ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : allAds.length === 0 ? (
        // Only show "Post your first ad" for logged-in users, not guests
        !isGuest ? (
          <View style={styles.content}>
            <Text style={styles.emptyStateTitle}>
              Post your first ad to kick off your selling journey.
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              The sooner you start, the faster you sell.
            </Text>

            <TouchableOpacity
              style={styles.postFirstAdButton}
              onPress={handlePostFirstAd}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Text style={styles.postFirstAdButtonText}>Post Your First Ad</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.emptyStateTitle}>
              No ads available at the moment.
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              Check back later for new listings.
            </Text>
          </View>
        )
      ) : (
        <FlatList
          ref={flatListRef}
          data={allAds}
          renderItem={({ item }) => (
            <AdCard
              ad={item}
              onCall={() => handleCall(item.id)}
              onMessage={() => handleMessage(item.id)}
              onNotify={() => handleNotify(item.id)}
              onThumbnailPress={(index) => handleThumbnailPress(item.id, index)}
              onPress={() => handleAdPress(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Contact Modal */}
      <ContactModal
        visible={contactModalVisible}
        onClose={handleCloseContactModal}
        sellerName={
          selectedAdSellerProfile?.contact_person_name || 
          selectedAdSellerProfile?.business_name || 
          selectedAdSellerProfile?.email?.split('@')[0] || 
          'Seller'
        }
        phoneNumber={selectedAd?.phoneNumber || selectedAdSellerProfile?.phone_number || ''}
        email={selectedAdSellerProfile?.email || ''}
        profileImage={selectedAdSellerProfile?.business_logo_url ? { uri: selectedAdSellerProfile.business_logo_url } : undefined}
        isVerified={selectedAdSellerProfile?.is_verified || selectedAdSellerProfile?.verification_badge || false}
        isTradeSeller={selectedAdSellerProfile?.account_type === 'trade' || selectedAdSellerProfile?.account_type === 'brand'}
        timestamp={selectedAd?.createdAt ? formatTimeAgo(selectedAd.createdAt) : undefined}
      />

      {/* Enquiry Modal */}
      <EnquiryModal
        visible={enquiryModalVisible}
        onClose={handleCloseEnquiryModal}
        itemName={selectedAdForEnquiry?.itemName}
        onSubmit={handleEnquirySubmit}
      />

      <EnquirySuccessModal
        visible={enquirySuccessVisible}
        onClose={handleCloseEnquirySuccess}
        onBackToListings={handleBackToListings}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  logoContainer: {
    flex: 1,
  },
  logoImage: {
    width: 120,
    height: 36,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '400',
    color: '#374151',
    fontFamily: 'system-ui',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  placeAdButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  placeAdButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    textAlign: 'center',
    marginBottom: 32,
  },
  postFirstAdButton: {
    width: '100%',
    maxWidth: 300,
    height: 52,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postFirstAdButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  listContent: {
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
