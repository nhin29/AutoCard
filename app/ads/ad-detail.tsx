import { ContactModal } from '@/components/ContactModal';
import { EnquiryModal } from '@/components/EnquiryModal';
import { EnquirySuccessModal } from '@/components/EnquirySuccessModal';
import { AlertIcon } from '@/components/icons/AlertIcon';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { FuelIcon } from '@/components/icons/FuelIcon';
import { GearIcon } from '@/components/icons/GearIcon';
import { ImageCountIcon } from '@/components/icons/ImageCountIcon';
import { LocationIcon } from '@/components/icons/LocationIcon';
import { LoveIcon } from '@/components/icons/LoveIcon';
import { MessageIcon } from '@/components/icons/MessageIcon';
import { PhoneIcon } from '@/components/icons/PhoneIcon';
import { ShareIcon } from '@/components/icons/ShareIcon';
import { SpeedometerIcon } from '@/components/icons/SpeedometerIcon';
import { VerifyIcon } from '@/components/icons/VerifyIcon';
import { ViewerIcon } from '@/components/icons/ViewerIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { adService } from '@/services/ad';
import { getProfile } from '@/services/profile';
import { subscribeToAd } from '@/services/realtime';
import type { Ad } from '@/stores/useAdStore';
import { useAdStore } from '@/stores/useAdStore';
import type { Ad as DatabaseAd, Profile } from '@/types/database';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Format timestamp to relative time (e.g., "Just Now", "8 mins ago")
 */
const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const adDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - adDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just Now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

/**
 * Related Ad Card Component
 * 
 * Displays a single related ad card matching the design specification.
 * Fetches seller profile data independently for each card.
 */
function RelatedAdCard({ ad, onPress }: { ad: Ad; onPress: () => void }) {
  // Calculate card width to show 2 cards per row
  // Screen width - section padding (16px each side = 32px) - gap between cards (6px) / 2
  // Add extra margin to ensure cards don't get cut off
  const sectionPadding = 16 * 2; // 16px on each side
  const cardGap = 6; // reduced gap between cards
  const cardWidth = (SCREEN_WIDTH - sectionPadding - cardGap) / 2 - 4; // Subtract 4px for safety margin
  const [sellerProfile, setSellerProfile] = useState<Profile | null>(null);

  // Fetch seller profile for this ad
  useEffect(() => {
    const fetchProfile = async () => {
      if (!ad.userId) {
        return;
      }

      try {
        const result = await getProfile(ad.userId);
        if (result.profile) {
          setSellerProfile(result.profile);
        }
      } catch (error) {
        console.error('[RelatedAdCard] Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [ad.userId]);

  // Get seller information
  const sellerName = sellerProfile?.contact_person_name || 
                     sellerProfile?.business_name || 
                     sellerProfile?.email?.split('@')[0] || 
                     'Seller';
  const isPrivateSeller = sellerProfile?.account_type === 'private';
  const isTradeSeller = sellerProfile?.account_type === 'trade';
  const isBrandSeller = sellerProfile?.account_type === 'brand';
  const profileImageUrl = sellerProfile?.business_logo_url || null;
  
  // Determine seller type badge text
  const sellerTypeText = isPrivateSeller ? 'Private Seller' : 
                        isTradeSeller ? 'Trade Seller' : 
                        isBrandSeller ? 'Brand' : 
                        'Seller';

  const mainImage = ad.uploadedImages[0] || null;
  const imageCount = ad.uploadedImages.length;
  const additionalImages = Math.max(0, imageCount - 1);

  // Check if ad is featured (for SPOTLIGHT badge)
  // Show SPOTLIGHT badge - can be based on is_featured from database
  // For now showing it for ads with multiple images as a visual indicator
  const isSpotlight = imageCount > 1;

  return (
    <TouchableOpacity
      style={[styles.relatedAdCard, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.9}
      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
      {/* Image Container */}
      <View style={styles.relatedAdImageContainer}>
        {mainImage ? (
          <Image
            source={{ uri: mainImage }}
            style={styles.relatedAdImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.relatedAdImagePlaceholder}>
            <IconSymbol name="photo" size={24} color="#9CA3AF" />
          </View>
        )}
        
        {/* SPOTLIGHT Badge - Top Left */}
        {isSpotlight && (
          <View style={styles.relatedAdSpotlightBadge}>
            <IconSymbol name="flame.fill" size={10} color="#FFD700" />
            <Text style={styles.relatedAdSpotlightText}>SPOTLIGHT</Text>
          </View>
        )}
        
        {/* Image Count Badge - Top Right */}
        {additionalImages > 0 && (
          <View style={styles.imageCountBadge}>
            <ImageCountIcon size={9} color="#FFFFFF" />
            <Text style={styles.imageCountText}>+{additionalImages}</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.relatedAdContent}>
        {/* Car Title */}
        <Text style={styles.relatedAdTitle} numberOfLines={1}>
          {ad.itemName || 'Vehicle'}
        </Text>

        {/* Price */}
        <Text style={styles.relatedAdPrice}>
          {ad.currency} {parseInt(ad.amount || '0').toLocaleString()}
        </Text>

        {/* Seller Info Row */}
        <View style={styles.relatedAdSellerContainer}>
          {/* Left: Profile Image */}
          <View style={styles.relatedAdSellerAvatarContainer}>
            {profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.relatedAdSellerAvatar}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('@/assets/images/message-avatar.png')}
                style={styles.relatedAdSellerAvatar}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Center: Name and Badge */}
          <View style={styles.relatedAdSellerInfoRight}>
            <View style={styles.relatedAdSellerNameRow}>
              <Text style={styles.relatedAdSellerName} numberOfLines={1} ellipsizeMode="tail">
                {sellerName}
              </Text>
            </View>
            
            {/* Badge - Below name */}
            <View style={styles.relatedAdSellerTypeBadge}>
              <Text style={styles.relatedAdSellerTypeText} numberOfLines={1}>
                {sellerTypeText}
              </Text>
            </View>
          </View>

          {/* Right: Location - Centered vertically */}
          {ad.location && (
            <View style={styles.relatedAdLocation}>
              <LocationIcon width={10} height={10} />
              <Text style={styles.relatedAdLocationText} numberOfLines={1} ellipsizeMode="tail">
                {ad.location}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Format number with K/M suffix (e.g., 20000 -> "20k")
 */
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return num.toString();
};

/**
 * Ad Detail Screen
 * 
 * Displays detailed information about a specific ad listing,
 * including images, specifications, seller info, and related ads.
 */
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

export default function AdDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ adId?: string }>();
  const ads = useAdStore((state) => state.ads);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [enquiryModalVisible, setEnquiryModalVisible] = useState(false);
  const [enquirySuccessVisible, setEnquirySuccessVisible] = useState(false);
  const autoSlideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Ad state - can come from store or database
  const [ad, setAd] = useState<Ad | null>(null);
  const [isLoadingAd, setIsLoadingAd] = useState(true);
  
  // User profile state
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  
  // Related ads state
  const [relatedAds, setRelatedAds] = useState<Ad[]>([]);

  // Load ad from store or database
  useEffect(() => {
    const loadAd = async () => {
      if (!params.adId) {
        setIsLoadingAd(false);
        return;
      }

      // First check store
      const storeAd = ads.find((a) => a.id === params.adId);
      if (storeAd) {
        setAd(storeAd);
        setIsLoadingAd(false);
        return;
      }

      // If not in store, fetch from database
      try {
        setIsLoadingAd(true);
        const result = await adService.getAdById(params.adId);
        
        if (result.error || !result.ad) {
          console.error('[AdDetail] Error loading ad:', result.error);
          setAd(null);
        } else {
          // Convert database ad to store format
          const convertedAd = convertDatabaseAdToStore(result.ad);
          setAd(convertedAd);
        }
      } catch (error) {
        console.error('[AdDetail] Exception loading ad:', error);
        setAd(null);
      } finally {
        setIsLoadingAd(false);
      }
    };

    loadAd();
  }, [params.adId, ads]);

  // Fetch user profile when ad has userId (must be called before early returns)
  useEffect(() => {
    if (!ad || !ad.userId) {
      setUserProfile(null);
      return;
    }
    
    const userId = ad.userId;
    const fetchUserProfile = async () => {
      try {
        const result = await getProfile(userId);
        if (result.profile) {
          setUserProfile(result.profile);
        }
      } catch (error) {
        console.error('[AdDetail] Error fetching user profile:', error);
        setUserProfile(null);
      }
    };
    
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad?.userId]);

  // Auto-slide images every 1 second (must be called before early returns)
  const images = ad?.uploadedImages || [];
  useEffect(() => {
    if (!ad || images.length <= 1) {
      return;
    }

    autoSlideIntervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 1000);

    return () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad?.id, images.length]);

  // Set up real-time subscription for this specific ad (must be called before early returns)
  // Note: This hook is always called, but subscription only happens if ad exists
  useEffect(() => {
    if (!ad?.id) {
      return;
    }

    const adId = ad.id;
    
    const unsubscribe = subscribeToAd(adId, (payload) => {
      try {
        if (payload.event === 'UPDATE' && payload.new) {
          // Ad updated - update local state
          const convertedAd = convertDatabaseAdToStore(payload.new);
          setAd(convertedAd);
        } else if (payload.event === 'DELETE' && payload.old) {
          // Ad deleted - navigate back
          Alert.alert(
            'Ad Removed',
            'This ad has been removed by the seller.',
            [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]
          );
        }
      } catch (error) {
        console.error('[AdDetail] Error handling real-time update:', error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [ad?.id, router]);

  // Fetch related ads from database when ad is loaded (must be called before early returns)
  useEffect(() => {
    const fetchRelatedAds = async () => {
      if (!ad || !ad.category) {
        setRelatedAds([]);
        return;
      }

      try {
        const result = await adService.getRelatedAds(ad.category, ad.id, 5);
        if (result.error) {
          console.error('[AdDetail] Error fetching related ads:', result.error);
          // Fallback to store ads if database fetch fails
          const fallbackAds = ads.filter((a) => a.id !== ad.id && a.category === ad.category).slice(0, 5);
          setRelatedAds(fallbackAds);
        } else {
          // Convert database ads to store format
          const convertedAds = result.ads.map((dbAd) => convertDatabaseAdToStore(dbAd as DatabaseAd));
          setRelatedAds(convertedAds);
        }
      } catch (error) {
        console.error('[AdDetail] Exception fetching related ads:', error);
        // Fallback to store ads
        const fallbackAds = ads.filter((a) => a.id !== ad.id && a.category === ad.category).slice(0, 5);
        setRelatedAds(fallbackAds);
      }
    };

    fetchRelatedAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad?.id, ad?.category, ads]);

  // Early returns AFTER all hooks are called
  if (isLoadingAd) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </View>
    );
  }

  if (!ad) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ad not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const mainImage = images[currentImageIndex] || images[0] || null;

  // Placeholder engagement metrics
  const views = 20000;
  const likes = 10000;
  const shares = 237;

  // Get seller information from profile
  const sellerName = userProfile?.contact_person_name || 
                     userProfile?.business_name || 
                     userProfile?.email?.split('@')[0] || 
                     'Seller';
  const isVerified = userProfile?.is_verified || userProfile?.verification_badge || false;
  const isPrivateSeller = userProfile?.account_type === 'private';
  const profileImageUrl = userProfile?.business_logo_url || null;

  const handleBack = () => {
    router.back();
  };

  const handleViewStory = () => {
    // TODO: Navigate to story view
  };

  const handleCall = () => {
    if (ad.phoneNumber) {
      setContactModalVisible(true);
    }
  };

  const handleCloseContactModal = () => {
    setContactModalVisible(false);
  };

  const handleMessage = () => {
    setEnquiryModalVisible(true);
  };

  const handleCloseEnquiryModal = () => {
    setEnquiryModalVisible(false);
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

  const handleNotify = () => {
    // TODO: Implement notification/save functionality
  };

  const handleReportAd = () => {
    // TODO: Implement report ad functionality
  };


  const handleRelatedAdPress = (adId: string) => {
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
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={handleBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewStoryButton}
          onPress={handleViewStory}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={styles.viewStoryButtonText}>View Story</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Hero Image */}
        <TouchableOpacity
          style={styles.heroImageContainer}
          onPress={() => {
            router.push({
              pathname: '/ads/ad-images',
              params: {
                adId: ad.id,
                initialIndex: currentImageIndex.toString(),
              },
            });
          }}
          activeOpacity={0.9}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          {mainImage ? (
            <Image
              source={{ uri: mainImage }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroImagePlaceholder}>
              <IconSymbol name="photo" size={48} color="#9CA3AF" />
            </View>
          )}
          {/* SPOTLIGHT Badge */}
          <View style={styles.spotlightBadge}>
            <IconSymbol name="flame.fill" size={16} color="#FFD700" />
            <Text style={styles.spotlightText}>SPOTLIGHT</Text>
          </View>
          
          {/* Progress Dots - Overlay on Image */}
          {images.length > 1 && (
            <View style={styles.progressDotsContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentImageIndex && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Car Title */}
        <View style={styles.titleSection}>
          <Text style={styles.carTitle}>{ad.itemName || 'Vehicle'}</Text>
        </View>

        {/* Location */}
        {ad.location && (
          <View style={styles.locationRow}>
            <LocationIcon width={16} height={16} />
            <Text style={styles.locationText}>{ad.location}</Text>
          </View>
        )}

        {/* Engagement Stats */}
        <View style={styles.engagementRow}>
          <View style={styles.metric}>
            <ViewerIcon width={15} height={11} />
            <Text style={styles.metricText}>{formatNumber(views)}</Text>
          </View>
          <View style={styles.metric}>
            <LoveIcon width={13} height={12} />
            <Text style={styles.metricText}>{formatNumber(likes)}</Text>
          </View>
          <View style={styles.metric}>
            <ShareIcon width={11} height={12} />
            <Text style={styles.metricText}>{formatNumber(shares)}</Text>
          </View>
        </View>

        {/* Price and Contact Actions */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>
            {ad.currency} {parseInt(ad.amount || '0').toLocaleString()}
          </Text>
          <View style={styles.contactActions}>
            <TouchableOpacity
              style={[styles.contactButton, styles.callButton]}
              onPress={handleCall}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <PhoneIcon width={21} height={21} color="#1E40AF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactButton, styles.messageButton]}
              onPress={handleMessage}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <MessageIcon width={20} height={19} color="#115E59" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactButton, styles.notifyButton]}
              onPress={handleNotify}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <AlertIcon width={21} height={22} color="#991B1B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Key Features */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <CalendarIcon width={24} height={24} color="#9CA3AF" />
            <Text style={styles.featureValue}>
              {ad.vanYearOfProduction || '2024'}
            </Text>
          </View>
          <View style={styles.featureCard}>
            <SpeedometerIcon width={23} height={21} color="#9CA3AF" />
            <Text style={styles.featureValue}>
              {ad.mileage ? `${ad.mileage}` : '80,000'}
            </Text>
          </View>
          <View style={styles.featureCard}>
            <FuelIcon width={22} height={22} color="#9CA3AF" />
            <Text style={styles.featureValue}>Petrol</Text>
          </View>
          <View style={styles.featureCard}>
            <GearIcon width={15} height={20} color="#9CA3AF" />
            <Text style={styles.featureValue} numberOfLines={1}>Automatic</Text>
          </View>
        </View>

        {/* Description */}
        {ad.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{ad.description}</Text>
          </View>
        )}

        {/* Specifications */}
        <View style={styles.specificationsSection}>
          <View style={styles.specGrid}>
            {/* Row 1 */}
            <View style={styles.specGridItem}>
              <Text style={styles.specLabel}>Make</Text>
              <Text style={styles.specValue}>{ad.vanMake || 'BMW'}</Text>
            </View>
            <View style={styles.specGridItem}>
              <Text style={styles.specLabel}>Model</Text>
              <Text style={styles.specValue}>{ad.vanModel || ad.itemName || '520 M Sports'}</Text>
            </View>
            <View style={styles.specGridItem}>
              <Text style={styles.specLabel}>Seats</Text>
              <Text style={styles.specValue}>05</Text>
            </View>
          </View>
          <View style={styles.specGrid}>
            {/* Row 2 */}
            <View style={styles.specGridItem}>
              <Text style={styles.specLabel}>Color</Text>
              <Text style={styles.specValue}>White</Text>
            </View>
            <View style={styles.specGridItem}>
              <Text style={styles.specLabel}>Door</Text>
              <Text style={styles.specValue}>04</Text>
            </View>
            <View style={styles.specGridItem}>
              <Text style={styles.specLabel}>Trim</Text>
              <Text style={styles.specValue}>--</Text>
            </View>
          </View>
        </View>

        {/* Seller Information */}
        <View style={styles.sellerSection}>
          <View style={styles.sellerInfo}>
            <View style={styles.profileImageContainer}>
              {profileImageUrl ? (
                <Image
                  source={{ uri: profileImageUrl }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('@/assets/images/message-avatar.png')}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.addFriendBadge}>
                <IconSymbol name="plus" size={12} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.sellerDetails}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerName}>{sellerName}</Text>
                {isVerified && (
                  <View style={styles.verifiedBadge}>
                    <VerifyIcon width={16} height={16} />
                  </View>
                )}
              </View>
              {userProfile?.account_type && (
                <View style={styles.accountTypeBadge}>
                  <Text style={styles.accountTypeText}>
                    {userProfile.account_type === 'trade' ? 'Trade Seller' : 
                     userProfile.account_type === 'private' ? 'Private Seller' : 
                     userProfile.account_type === 'brand' ? 'Brand' : 
                     'Seller'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.postedTimeContainer}>
              <Text style={styles.postedTimeLabel}>Posted</Text>
              <Text style={styles.postedTime}>{formatTimeAgo(ad.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Report Ad Button */}
        <View style={styles.reportButtonContainer}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleReportAd}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={styles.reportButtonText}>Report Ad</Text>
          </TouchableOpacity>
        </View>

        {/* Related Ads Section */}
        {relatedAds.length > 0 && (
          <View style={styles.relatedAdsSection}>
            <Text style={styles.relatedAdsTitle}>Related Ads</Text>
            <FlatList
              data={relatedAds}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.relatedAdsList}
              renderItem={({ item }) => (
                <RelatedAdCard
                  ad={item}
                  onPress={() => handleRelatedAdPress(item.id)}
                />
              )}
            />
          </View>
        )}
      </ScrollView>

      {/* Contact Modal */}
      <ContactModal
        visible={contactModalVisible}
        onClose={handleCloseContactModal}
        sellerName={sellerName}
        phoneNumber={ad.phoneNumber || userProfile?.phone_number || ''}
        email={userProfile?.email || ''}
        profileImage={profileImageUrl ? { uri: profileImageUrl } : undefined}
        isVerified={isVerified}
        isTradeSeller={!isPrivateSeller}
        timestamp={formatTimeAgo(ad.createdAt)}
      />

      {/* Enquiry Modal */}
      <EnquiryModal
        visible={enquiryModalVisible}
        onClose={handleCloseEnquiryModal}
        itemName={ad.itemName}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewStoryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewStoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroImageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 6,
  },
  spotlightText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    letterSpacing: 0.5,
  },
  progressDotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 8,
  },
  carTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
  },
  engagementRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 20,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'system-ui',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CAF50',
    fontFamily: 'system-ui',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  callButton: {
    backgroundColor: '#DBEAFE',
  },
  messageButton: {
    backgroundColor: '#D1FAE5',
  },
  notifyButton: {
    backgroundColor: '#FEE2E2',
  },
  featuresSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
    justifyContent: 'center',
  },
  featureCard: {
    width: 90,
    height: 90,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
  },
  featureValue: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'Source Sans Pro',
    textAlign: 'center',
    lineHeight: 12,
    letterSpacing: 0,
    flexShrink: 0,
    width: '100%',
  },
  descriptionSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Source Sans Pro',
    marginBottom: 12,
    lineHeight: 14,
    letterSpacing: 0,
  },
  descriptionText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#374151',
    fontFamily: 'Source Sans Pro',
    lineHeight: 12,
    letterSpacing: 0,
  },
  specificationsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  specTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Source Sans Pro',
    marginBottom: 16,
    lineHeight: 14,
    letterSpacing: 0,
  },
  specGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  specGridItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  specLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Source Sans Pro',
    marginBottom: 8,
    lineHeight: 12,
    letterSpacing: 0,
    textAlign: 'center',
  },
  specValue: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Source Sans Pro',
    lineHeight: 12,
    letterSpacing: 0,
    textAlign: 'left',
  },
  sellerSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  addFriendBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sellerDetails: {
    flex: 1,
    justifyContent: 'center',
    height: 56,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  verifiedBadge: {
    width: 18,
    height: 18,
  },
  accountTypeBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    minWidth: 87,
    height: 17,
    backgroundColor: '#F0FDF4',
    borderRadius: 4,
    marginTop: 4,
  },
  accountTypeText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#15803D',
    fontFamily: 'Source Sans Pro',
    lineHeight: 13,
    textAlign: 'center',
  },
  postedTimeContainer: {
    alignItems: 'flex-end',
  },
  postedTimeLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
  },
  postedTime: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
  },
  reportButtonContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  reportButton: {
    width: '100%',
    maxWidth: 400,
    height: 48,
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    fontFamily: 'system-ui',
  },
  relatedAdsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  relatedAdsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 16,
  },
  relatedAdsList: {
    gap: 6,
    paddingRight: 16,
  },
  relatedAdCard: {
    marginRight: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexShrink: 0,
  },
  relatedAdImageContainer: {
    width: '100%',
    height: 110,
    position: 'relative',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  relatedAdImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  relatedAdImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  relatedAdSpotlightBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 16,
    gap: 3,
  },
  relatedAdSpotlightText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    letterSpacing: 0.5,
  },
  imageCountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },
  imageCountText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  relatedAdContent: {
    padding: 5,
    paddingBottom: 6,
    paddingHorizontal: 5,
    backgroundColor: '#F9FAFB',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'visible',
  },
  relatedAdTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'system-ui',
    marginBottom: 3,
    lineHeight: 16,
  },
  relatedAdPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
    fontFamily: 'system-ui',
    marginBottom: 4,
    lineHeight: 18,
  },
  relatedAdSellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    minHeight: 32,
    overflow: 'hidden',
    paddingRight: 2,
    margin: 0,
  },
  relatedAdSellerAvatarContainer: {
    position: 'relative',
  },
  relatedAdSellerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
  },
  relatedAdSellerInfoRight: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'flex-start',
    paddingTop: 0,
    paddingRight: 4,
    paddingLeft: 0,
    paddingBottom: 0,
    overflow: 'hidden',
    flexShrink: 1,
  },
  relatedAdSellerNameRow: {
    marginBottom: 1,
    width: '100%',
  },
  relatedAdSellerName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'system-ui',
    flexShrink: 1,
    minWidth: 0,
    lineHeight: 14,
    marginRight: 4,
    includeFontPadding: false,
  },
  relatedAdLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 1,
    justifyContent: 'center',
    maxWidth: 50,
    marginLeft: 2,
  },
  relatedAdLocationText: {
    fontSize: 9,
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
    flexShrink: 1,
    includeFontPadding: false,
  },
  relatedAdSellerTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: '#F0FDF4',
    borderRadius: 5,
    minHeight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    flexShrink: 0,
    margin: 0,
    marginTop: 0,
    position: 'relative',
  },
  relatedAdSellerTypeText: {
    fontSize: 8,
    fontWeight: '500',
    color: '#15803D',
    fontFamily: 'system-ui',
    lineHeight: 10,
    textAlign: 'center',
    includeFontPadding: false,
    flexShrink: 0,
    flexWrap: 'nowrap',
    margin: 0,
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
});
