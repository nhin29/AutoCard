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
import { FONT_SIZES, SPACING, useResponsive } from '@/utils/responsive';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { width: screenWidth } = useWindowDimensions();
  const { isSmall } = useResponsive();
  // Calculate card width to show 2 cards per row with responsive padding
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.base;
  const sectionPadding = horizontalPadding * 2;
  const cardGap = isSmall ? 4 : 6;
  const cardWidth = (screenWidth - sectionPadding - cardGap) / 2 - 2; // Subtract 2px for safety margin
  const [sellerProfile, setSellerProfile] = useState<Profile | null>(null);
  
  // Responsive sizes for related ad card
  const relatedAdImageHeight = isSmall ? 90 : 110;
  const relatedAdSpotlightIconSize = isSmall ? 8 : 10;
  const relatedAdSpotlightFontSize = isSmall ? 8 : 9;
  const imageCountIconSize = isSmall ? 7 : 9;
  const imageCountFontSize = isSmall ? 8 : 9;
  const relatedAdTitleFontSize = isSmall ? FONT_SIZES.xs : 13;
  const relatedAdPriceFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.sm;
  const relatedAdAvatarSize = isSmall ? 20 : 24;
  const relatedAdSellerNameFontSize = isSmall ? 10 : 11;
  const relatedAdLocationIconSize = isSmall ? 8 : 10;
  const relatedAdLocationFontSize = isSmall ? 8 : 9;
  const relatedAdSellerTypeFontSize = isSmall ? 7 : 8;

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
        // Error fetching profile handled silently
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
      <View style={[styles.relatedAdImageContainer, { height: relatedAdImageHeight }]}>
        {mainImage ? (
          <Image
            source={{ uri: mainImage }}
            style={[styles.relatedAdImage, { height: relatedAdImageHeight }]}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.relatedAdImagePlaceholder}>
            <IconSymbol name="photo" size={isSmall ? 20 : 24} color="#9CA3AF" />
          </View>
        )}
        
        {/* SPOTLIGHT Badge - Top Left */}
        {isSpotlight && (
          <View style={[styles.relatedAdSpotlightBadge, { paddingHorizontal: isSmall ? SPACING.xs : 6, paddingVertical: isSmall ? 2 : 3 }]}>
            <IconSymbol name="flame.fill" size={relatedAdSpotlightIconSize} color="#FFD700" />
            <Text style={[styles.relatedAdSpotlightText, { fontSize: relatedAdSpotlightFontSize }]}>SPOTLIGHT</Text>
          </View>
        )}
        
        {/* Image Count Badge - Top Right */}
        {additionalImages > 0 && (
          <View style={[styles.imageCountBadge, { paddingHorizontal: isSmall ? SPACING.xs : 6, paddingVertical: isSmall ? 2 : 3 }]}>
            <ImageCountIcon size={imageCountIconSize} color="#FFFFFF" />
            <Text style={[styles.imageCountText, { fontSize: imageCountFontSize }]}>+{additionalImages}</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={[styles.relatedAdContent, { padding: isSmall ? 4 : 5 }]}>
        {/* Car Title */}
        <Text style={[styles.relatedAdTitle, { fontSize: relatedAdTitleFontSize }]} numberOfLines={1}>
          {ad.itemName || 'Vehicle'}
        </Text>

        {/* Price */}
        <Text style={[styles.relatedAdPrice, { fontSize: relatedAdPriceFontSize }]}>
          {ad.currency} {parseInt(ad.amount || '0').toLocaleString()}
        </Text>

        {/* Seller Info Row */}
        <View style={styles.relatedAdSellerContainer}>
          {/* Left: Profile Image */}
          <View style={styles.relatedAdSellerAvatarContainer}>
            {profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl }}
                style={[styles.relatedAdSellerAvatar, { width: relatedAdAvatarSize, height: relatedAdAvatarSize, borderRadius: relatedAdAvatarSize / 2 }]}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('@/assets/images/message-avatar.png')}
                style={[styles.relatedAdSellerAvatar, { width: relatedAdAvatarSize, height: relatedAdAvatarSize, borderRadius: relatedAdAvatarSize / 2 }]}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Center: Name and Badge */}
          <View style={styles.relatedAdSellerInfoRight}>
            <View style={styles.relatedAdSellerNameRow}>
              <Text style={[styles.relatedAdSellerName, { fontSize: relatedAdSellerNameFontSize }]} numberOfLines={1} ellipsizeMode="tail">
                {sellerName}
              </Text>
            </View>
            
            {/* Badge - Below name */}
            <View style={[styles.relatedAdSellerTypeBadge, { minHeight: isSmall ? 12 : 14 }]}>
              <Text style={[styles.relatedAdSellerTypeText, { fontSize: relatedAdSellerTypeFontSize }]} numberOfLines={1}>
                {sellerTypeText}
              </Text>
            </View>
          </View>

          {/* Right: Location - Centered vertically */}
          {ad.location && (
            <View style={[styles.relatedAdLocation, { maxWidth: isSmall ? 45 : 50 }]}>
              <LocationIcon width={relatedAdLocationIconSize} height={relatedAdLocationIconSize} />
              <Text style={[styles.relatedAdLocationText, { fontSize: relatedAdLocationFontSize }]} numberOfLines={1} ellipsizeMode="tail">
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
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSmall } = useResponsive();
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
  
  // Image slider refs
  const imageFlatListRef = useRef<FlatList>(null);
  const isScrollingRef = useRef(false);

  // Calculate responsive values - reduced for small phones
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.base;
  // Add extra padding on top of safe area insets for better spacing from status bar
  const headerPaddingTop = insets.top + (isSmall ? SPACING.md : SPACING.base);
  const backIconSize = isSmall ? 20 : 24;
  const backButtonSize = isSmall ? 36 : 40;
  const viewStoryButtonPaddingH = isSmall ? SPACING.sm : SPACING.base;
  const viewStoryButtonPaddingV = isSmall ? SPACING.xs : SPACING.sm;
  const viewStoryButtonFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const heroImageHeight = isSmall ? 220 : 300;
  const spotlightIconSize = isSmall ? 12 : 16;
  const spotlightFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const spotlightPaddingH = isSmall ? SPACING.sm : 10;
  const spotlightPaddingV = isSmall ? SPACING.xs : SPACING.sm;
  const progressDotSize = isSmall ? 5 : 6;
  const progressDotGap = isSmall ? 4 : 6;
  const carTitleFontSize = isSmall ? FONT_SIZES.lg : 24;
  const locationIconSize = isSmall ? 14 : 16;
  const locationFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const metricIconSize = isSmall ? 12 : 15;
  const metricTextFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const priceFontSize = isSmall ? 22 : 28;
  const contactButtonSize = isSmall ? 40 : 48;
  const contactIconSize = isSmall ? 18 : 21;
  const featureCardSize = isSmall ? 70 : 90;
  const featureIconSize = isSmall ? 18 : 24;
  const featureValueFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const sectionTitleFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const descriptionFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const profileImageSize = isSmall ? 48 : 56;
  const addFriendBadgeSize = isSmall ? 16 : 20;
  const addFriendIconSize = isSmall ? 10 : 12;
  const sellerNameFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const verifiedBadgeSize = isSmall ? 14 : 18;
  const accountTypeFontSize = isSmall ? 9 : 10;
  const postedTimeFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const reportButtonHeight = isSmall ? 42 : 48;
  const reportButtonFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const relatedAdsTitleFontSize = isSmall ? FONT_SIZES.md : FONT_SIZES.lg;

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
          setAd(null);
        } else {
          // Convert database ad to store format
          const convertedAd = convertDatabaseAdToStore(result.ad);
          setAd(convertedAd);
        }
      } catch (error) {
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
        setUserProfile(null);
      }
    };
    
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad?.userId]);

  // Auto-slide images every 3 seconds with smooth transitions (must be called before early returns)
  const images = ad?.uploadedImages || [];
  
  useEffect(() => {
    if (!ad || images.length <= 1) {
      return;
    }

    autoSlideIntervalRef.current = setInterval(() => {
      if (!isScrollingRef.current) {
        const nextIndex = (currentImageIndex + 1) % images.length;
        setCurrentImageIndex(nextIndex);
        imageFlatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }
    }, 3000); // Changed from 1000ms to 3000ms for slower, smoother transitions

    return () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad?.id, images.length, currentImageIndex]);

  // Handle manual scroll to update current index
  const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isScrollingRef.current) {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
      if (index >= 0 && index < images.length && index !== currentImageIndex) {
        setCurrentImageIndex(index);
      }
    }
  };

  // Handle scroll begin to prevent auto-slide during manual scroll
  const handleScrollBeginDrag = () => {
    isScrollingRef.current = true;
  };

  // Handle scroll end to resume auto-slide
  const handleScrollEndDrag = () => {
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 500);
  };

  // Handle scroll to index failures
  const handleScrollToIndexFailed = (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
    // Wait a bit and try again
    setTimeout(() => {
      imageFlatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
      });
    }, 100);
  };

  // Set up real-time subscription for this specific ad (must be called before early returns)
  // Note: This hook is always called, but subscription only happens if ad exists
  // Subscription failures are handled gracefully - app continues to work without realtime updates
  useEffect(() => {
    if (!ad?.id) {
      return;
    }

    const adId = ad.id;
    let unsubscribe: (() => void) | null = null;
    
    try {
      unsubscribe = subscribeToAd(adId, (payload) => {
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
          // Silently handle errors in callback
        }
      });
    } catch (error) {
      // Silently handle subscription creation errors
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          // Silently handle cleanup errors
        }
      }
    };
  }, [ad?.id, router]);

  // Helper function to check if a string is a valid UUID format
  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Fetch related ads from database when ad is loaded (must be called before early returns)
  useEffect(() => {
    const fetchRelatedAds = async () => {
      if (!ad || !ad.category) {
        setRelatedAds([]);
        return;
      }

      // Check if ad.id is a valid UUID (database ID) or store-generated ID
      // Only fetch from database if we have a valid UUID
      if (!isValidUUID(ad.id)) {
        // Ad has store-generated ID, use store ads as fallback
        const fallbackAds = ads.filter((a) => a.id !== ad.id && a.category === ad.category).slice(0, 5);
        setRelatedAds(fallbackAds);
        return;
      }

      try {
        const result = await adService.getRelatedAds(ad.category, ad.id, 5);
        if (result.error) {
          // Fallback to store ads if database fetch fails
          const fallbackAds = ads.filter((a) => a.id !== ad.id && a.category === ad.category).slice(0, 5);
          setRelatedAds(fallbackAds);
        } else {
          // Convert database ads to store format
          const convertedAds = result.ads.map((dbAd) => convertDatabaseAdToStore(dbAd as DatabaseAd));
          setRelatedAds(convertedAds);
        }
      } catch (error) {
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
            onPress={() => router.replace('/(tabs)')}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


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
    // Navigate to home page instead of going back in history
    router.replace('/(tabs)');
  };

  const handleViewStory = () => {
    // Check if ad has stories
    const stories = ad?.uploadedStories || [];
    if (stories.length === 0) {
      Alert.alert(
        'No Stories',
        'This ad does not have any story images.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Navigate to preview story page with stories and adId
    router.push({
      pathname: '/story/preview-story',
      params: {
        stories: JSON.stringify(stories),
        adId: ad.id,
      },
    });
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
      <View style={[styles.header, { paddingTop: headerPaddingTop, paddingHorizontal: horizontalPadding }]}>
        <TouchableOpacity
          style={[styles.backButtonHeader, { width: backButtonSize, height: backButtonSize }]}
          onPress={handleBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={backIconSize} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewStoryButton,
            {
              paddingHorizontal: viewStoryButtonPaddingH,
              paddingVertical: viewStoryButtonPaddingV,
            }
          ]}
          onPress={handleViewStory}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={[styles.viewStoryButtonText, { fontSize: viewStoryButtonFontSize }]}>View Story</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Hero Image Slider */}
        <TouchableOpacity
          style={[styles.heroImageContainer, { height: heroImageHeight }]}
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
          {images.length > 0 ? (
            <FlatList
              ref={imageFlatListRef}
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${item}-${index}`}
              initialScrollIndex={currentImageIndex}
              onScroll={handleImageScroll}
              onScrollBeginDrag={handleScrollBeginDrag}
              onScrollEndDrag={handleScrollEndDrag}
              onMomentumScrollEnd={handleScrollEndDrag}
              scrollEventThrottle={16}
              onScrollToIndexFailed={handleScrollToIndexFailed}
              getItemLayout={(_, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
              renderItem={({ item, index }) => (
                <View style={{ width: screenWidth, height: heroImageHeight, overflow: 'hidden' }}>
                  <Image
                    source={{ uri: item }}
                    style={[styles.heroImage, { height: heroImageHeight, width: screenWidth }]}
                    resizeMode="cover"
                    onError={() => {
                      // Image load error handled silently
                    }}
                    onLoad={() => {
                      // Image loaded successfully
                    }}
                  />
                </View>
              )}
              decelerationRate="fast"
              snapToInterval={screenWidth}
              snapToAlignment="start"
            />
          ) : (
            <View style={styles.heroImagePlaceholder}>
              <IconSymbol name="photo" size={isSmall ? 40 : 48} color="#9CA3AF" />
            </View>
          )}
          {/* SPOTLIGHT Badge */}
          <View style={[
            styles.spotlightBadge,
            {
              paddingHorizontal: spotlightPaddingH,
              paddingVertical: spotlightPaddingV,
              top: isSmall ? SPACING.md : SPACING.base,
              left: isSmall ? SPACING.md : SPACING.base,
            }
          ]}>
            <IconSymbol name="flame.fill" size={spotlightIconSize} color="#FFD700" />
            <Text style={[styles.spotlightText, { fontSize: spotlightFontSize }]}>SPOTLIGHT</Text>
          </View>
          
          {/* Progress Dots - Overlay on Image */}
          {images.length > 1 && (
            <View style={[styles.progressDotsContainer, { gap: progressDotGap, bottom: isSmall ? SPACING.sm : SPACING.md }]}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    {
                      width: progressDotSize,
                      height: progressDotSize,
                      borderRadius: progressDotSize / 2,
                    },
                    index === currentImageIndex && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Car Title */}
        <View style={[styles.titleSection, { paddingHorizontal: horizontalPadding }]}>
          <Text style={[styles.carTitle, { fontSize: carTitleFontSize }]}>{ad.itemName || 'Vehicle'}</Text>
        </View>

        {/* Location */}
        {ad.location && (
          <View style={[styles.locationRow, { paddingHorizontal: horizontalPadding }]}>
            <LocationIcon width={locationIconSize} height={locationIconSize} />
            <Text style={[styles.locationText, { fontSize: locationFontSize }]}>{ad.location}</Text>
          </View>
        )}

        {/* Engagement Stats */}
        <View style={[styles.engagementRow, { paddingHorizontal: horizontalPadding, gap: isSmall ? SPACING.sm : SPACING.base }]}>
          <View style={styles.metric}>
            <ViewerIcon width={metricIconSize} height={Math.floor(metricIconSize * 0.73)} />
            <Text style={[styles.metricText, { fontSize: metricTextFontSize }]}>{formatNumber(views)}</Text>
          </View>
          <View style={styles.metric}>
            <LoveIcon width={metricIconSize} height={Math.floor(metricIconSize * 0.92)} />
            <Text style={[styles.metricText, { fontSize: metricTextFontSize }]}>{formatNumber(likes)}</Text>
          </View>
          <View style={styles.metric}>
            <ShareIcon width={Math.floor(metricIconSize * 0.85)} height={metricIconSize} />
            <Text style={[styles.metricText, { fontSize: metricTextFontSize }]}>{formatNumber(shares)}</Text>
          </View>
        </View>

        {/* Price and Contact Actions */}
        <View style={[styles.priceSection, { paddingHorizontal: horizontalPadding, marginBottom: isSmall ? SPACING.lg : 24 }]}>
          <Text style={[styles.price, { fontSize: priceFontSize }]}>
            {ad.currency} {parseInt(ad.amount || '0').toLocaleString()}
          </Text>
          <View style={[styles.contactActions, { gap: isSmall ? SPACING.sm : 12 }]}>
            <TouchableOpacity
              style={[styles.contactButton, styles.callButton, { width: contactButtonSize, height: contactButtonSize }]}
              onPress={handleCall}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <PhoneIcon width={contactIconSize} height={contactIconSize} color="#1E40AF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactButton, styles.messageButton, { width: contactButtonSize, height: contactButtonSize }]}
              onPress={handleMessage}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <MessageIcon width={contactIconSize} height={Math.floor(contactIconSize * 0.9)} color="#115E59" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactButton, styles.notifyButton, { width: contactButtonSize, height: contactButtonSize }]}
              onPress={handleNotify}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <AlertIcon width={contactIconSize} height={Math.floor(contactIconSize * 1.05)} color="#991B1B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Key Features */}
        <View style={[styles.featuresSection, { paddingHorizontal: horizontalPadding, gap: isSmall ? SPACING.sm : 12, marginBottom: isSmall ? SPACING.lg : 24 }]}>
          <View style={[styles.featureCard, { width: featureCardSize, height: featureCardSize, padding: isSmall ? SPACING.sm : SPACING.base }]}>
            <CalendarIcon width={featureIconSize} height={featureIconSize} color="#9CA3AF" />
            <Text style={[styles.featureValue, { fontSize: featureValueFontSize }]}>
              {ad.vanYearOfProduction || '2024'}
            </Text>
          </View>
          <View style={[styles.featureCard, { width: featureCardSize, height: featureCardSize, padding: isSmall ? SPACING.sm : SPACING.base }]}>
            <SpeedometerIcon width={Math.floor(featureIconSize * 0.96)} height={Math.floor(featureIconSize * 0.88)} color="#9CA3AF" />
            <Text style={[styles.featureValue, { fontSize: featureValueFontSize }]}>
              {ad.mileage ? `${ad.mileage}` : '80,000'}
            </Text>
          </View>
          <View style={[styles.featureCard, { width: featureCardSize, height: featureCardSize, padding: isSmall ? SPACING.sm : SPACING.base }]}>
            <FuelIcon width={Math.floor(featureIconSize * 0.92)} height={Math.floor(featureIconSize * 0.92)} color="#9CA3AF" />
            <Text style={[styles.featureValue, { fontSize: featureValueFontSize }]}>Petrol</Text>
          </View>
          <View style={[styles.featureCard, { width: featureCardSize, height: featureCardSize, padding: isSmall ? SPACING.sm : SPACING.base }]}>
            <GearIcon width={Math.floor(featureIconSize * 0.63)} height={Math.floor(featureIconSize * 0.83)} color="#9CA3AF" />
            <Text style={[styles.featureValue, { fontSize: featureValueFontSize }]} numberOfLines={1}>Automatic</Text>
          </View>
        </View>

        {/* Description */}
        {ad.description && (
          <View style={[styles.descriptionSection, { paddingHorizontal: horizontalPadding, marginBottom: isSmall ? SPACING.lg : 24 }]}>
            <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>Description</Text>
            <Text style={[styles.descriptionText, { fontSize: descriptionFontSize }]}>{ad.description}</Text>
          </View>
        )}

        {/* Specifications */}
        <View style={[styles.specificationsSection, { paddingHorizontal: horizontalPadding, marginBottom: isSmall ? SPACING.lg : 24 }]}>
          <View style={[styles.specificationsCard, { padding: isSmall ? SPACING.md : SPACING.lg }]}>
            <View style={[styles.specGrid, { gap: isSmall ? SPACING.md : SPACING.base, marginBottom: isSmall ? SPACING.md : SPACING.base }]}>
              {/* Row 1 */}
              <View style={styles.specGridItem}>
                <Text style={[styles.specLabel, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm, marginBottom: isSmall ? 6 : 8 }]}>Make</Text>
                <Text style={[styles.specValue, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]} numberOfLines={1}>
                  {ad.vanMake || '---'}
                </Text>
              </View>
              <View style={styles.specGridItem}>
                <Text style={[styles.specLabel, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm, marginBottom: isSmall ? 6 : 8 }]}>Model</Text>
                <Text style={[styles.specValue, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]} numberOfLines={1}>
                  {ad.vanModel || ad.itemName || '---'}
                </Text>
              </View>
              <View style={styles.specGridItem}>
                <Text style={[styles.specLabel, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm, marginBottom: isSmall ? 6 : 8 }]}>Seats</Text>
                <Text style={[styles.specValue, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>---</Text>
              </View>
            </View>
            <View style={[styles.specGrid, { gap: isSmall ? SPACING.md : SPACING.base }]}>
              {/* Row 2 */}
              <View style={styles.specGridItem}>
                <Text style={[styles.specLabel, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm, marginBottom: isSmall ? 6 : 8 }]}>Color</Text>
                <Text style={[styles.specValue, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>---</Text>
              </View>
              <View style={styles.specGridItem}>
                <Text style={[styles.specLabel, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm, marginBottom: isSmall ? 6 : 8 }]}>Door</Text>
                <Text style={[styles.specValue, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>---</Text>
              </View>
              <View style={styles.specGridItem}>
                <Text style={[styles.specLabel, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm, marginBottom: isSmall ? 6 : 8 }]}>Trim</Text>
                <Text style={[styles.specValue, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>---</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Seller Information */}
        <View style={[styles.sellerSection, { paddingHorizontal: horizontalPadding, marginBottom: isSmall ? SPACING.lg : 24 }]}>
          <View style={styles.sellerInfo}>
            <View style={styles.profileImageContainer}>
              {profileImageUrl ? (
                <Image
                  source={{ uri: profileImageUrl }}
                  style={[styles.profileImage, { width: profileImageSize, height: profileImageSize, borderRadius: profileImageSize / 2 }]}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('@/assets/images/message-avatar.png')}
                  style={[styles.profileImage, { width: profileImageSize, height: profileImageSize, borderRadius: profileImageSize / 2 }]}
                  resizeMode="cover"
                />
              )}
              <View style={[styles.addFriendBadge, { width: addFriendBadgeSize, height: addFriendBadgeSize, borderRadius: addFriendBadgeSize / 2 }]}>
                <IconSymbol name="plus" size={addFriendIconSize} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.sellerDetails}>
              <View style={styles.sellerNameRow}>
                <Text style={[styles.sellerName, { fontSize: sellerNameFontSize }]}>{sellerName}</Text>
                {isVerified && (
                  <View style={[styles.verifiedBadge, { width: verifiedBadgeSize, height: verifiedBadgeSize }]}>
                    <VerifyIcon width={verifiedBadgeSize} height={verifiedBadgeSize} />
                  </View>
                )}
              </View>
              {userProfile?.account_type && (
                <View style={[styles.accountTypeBadge, { minWidth: isSmall ? 75 : 87, height: isSmall ? 15 : 17 }]}>
                  <Text style={[styles.accountTypeText, { fontSize: accountTypeFontSize }]}>
                    {userProfile.account_type === 'trade' ? 'Trade Seller' : 
                     userProfile.account_type === 'private' ? 'Private Seller' : 
                     userProfile.account_type === 'brand' ? 'Brand' : 
                     'Seller'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.postedTimeContainer}>
              <Text style={[styles.postedTimeLabel, { fontSize: postedTimeFontSize }]}>Posted</Text>
              <Text style={[styles.postedTime, { fontSize: postedTimeFontSize }]}>{formatTimeAgo(ad.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Report Ad Button */}
        <View style={[styles.reportButtonContainer, { paddingHorizontal: horizontalPadding, marginBottom: isSmall ? SPACING.lg : 32 }]}>
          <TouchableOpacity
            style={[styles.reportButton, { height: reportButtonHeight }]}
            onPress={handleReportAd}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={[styles.reportButtonText, { fontSize: reportButtonFontSize }]}>Report Ad</Text>
          </TouchableOpacity>
        </View>

        {/* Related Ads Section */}
        {relatedAds.length > 0 && (
          <View style={[styles.relatedAdsSection, { paddingHorizontal: horizontalPadding, marginBottom: isSmall ? SPACING.lg : 24 }]}>
            <Text style={[styles.relatedAdsTitle, { fontSize: relatedAdsTitleFontSize }]}>Related Ads</Text>
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
    paddingBottom: SPACING.base,
    // paddingTop and paddingHorizontal set dynamically
  },
  backButtonHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    // width and height set dynamically
  },
  viewStoryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    // paddingHorizontal and paddingVertical set dynamically
  },
  viewStoryButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroImageContainer: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    // height set dynamically
  },
  heroImage: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    // height set dynamically
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 9999,
    gap: SPACING.xs,
    // top, left, paddingHorizontal, and paddingVertical set dynamically
  },
  spotlightText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    letterSpacing: 0.5,
    // fontSize set dynamically
  },
  progressDotsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // bottom and gap set dynamically
  },
  progressDot: {
    backgroundColor: '#D1D5DB',
    // width, height, and borderRadius set dynamically
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
  },
  titleSection: {
    paddingTop: SPACING.base,
    marginBottom: SPACING.sm,
    // paddingHorizontal set dynamically
  },
  carTitle: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    // paddingHorizontal set dynamically
  },
  locationText: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  engagementRow: {
    flexDirection: 'row',
    marginBottom: 20,
    // paddingHorizontal and gap set dynamically, marginBottom adjusted inline
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metricText: {
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom and paddingHorizontal set dynamically
  },
  price: {
    fontWeight: '700',
    color: '#4CAF50',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  contactActions: {
    flexDirection: 'row',
    // gap set dynamically
  },
  contactButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    // width and height set dynamically
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
    justifyContent: 'center',
    // marginBottom, paddingHorizontal and gap set dynamically
  },
  featureCard: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#F9FAFB',
    // width, height, and padding set dynamically
  },
  featureValue: {
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'Source Sans Pro',
    textAlign: 'center',
    lineHeight: 12,
    letterSpacing: 0,
    flexShrink: 0,
    width: '100%',
    // fontSize set dynamically
  },
  descriptionSection: {
    // marginBottom and paddingHorizontal set dynamically
  },
  sectionTitle: {
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Source Sans Pro',
    marginBottom: SPACING.md,
    lineHeight: 14,
    letterSpacing: 0,
    // fontSize set dynamically
  },
  descriptionText: {
    fontWeight: '400',
    color: '#374151',
    fontFamily: 'Source Sans Pro',
    lineHeight: 12,
    letterSpacing: 0,
    // fontSize set dynamically
  },
  specificationsSection: {
    // marginBottom and paddingHorizontal set dynamically
  },
  specificationsCard: {
    backgroundColor: '#FCFCFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // padding set dynamically
  },
  specGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // gap and marginBottom set dynamically
  },
  specGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  specLabel: {
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Source Sans Pro',
    lineHeight: 16,
    letterSpacing: 0.2,
    // fontSize and marginBottom set dynamically
  },
  specValue: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Source Sans Pro',
    lineHeight: 18,
    letterSpacing: 0,
    // fontSize set dynamically
  },
  sellerSection: {
    // marginBottom and paddingHorizontal set dynamically
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
    borderWidth: 2,
    borderColor: '#4CAF50',
    // width, height, and borderRadius set dynamically
  },
  addFriendBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    // width, height, and borderRadius set dynamically
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
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  verifiedBadge: {
    // width and height set dynamically
  },
  accountTypeBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: SPACING.base,
    alignSelf: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderRadius: 4,
    marginTop: SPACING.xs,
    // minWidth and height set dynamically
  },
  accountTypeText: {
    fontWeight: '400',
    color: '#15803D',
    fontFamily: 'Source Sans Pro',
    lineHeight: 13,
    textAlign: 'center',
    // fontSize set dynamically
  },
  postedTimeContainer: {
    alignItems: 'flex-end',
  },
  postedTimeLabel: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  postedTime: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  reportButtonContainer: {
    width: '100%',
    alignItems: 'center',
    // marginBottom and paddingHorizontal set dynamically
  },
  reportButton: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // height set dynamically
  },
  reportButtonText: {
    fontWeight: '700',
    color: '#EF4444',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  relatedAdsSection: {
    // marginBottom and paddingHorizontal set dynamically
  },
  relatedAdsTitle: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: SPACING.base,
    // fontSize set dynamically
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
    position: 'relative',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    // height set dynamically
  },
  relatedAdImage: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    // height set dynamically
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
    top: SPACING.xs,
    left: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    gap: 3,
    // paddingHorizontal and paddingVertical set dynamically
  },
  relatedAdSpotlightText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    letterSpacing: 0.5,
    // fontSize set dynamically
  },
  imageCountBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    gap: 3,
    // paddingHorizontal and paddingVertical set dynamically
  },
  imageCountText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  relatedAdContent: {
    backgroundColor: '#F9FAFB',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'visible',
    // padding set dynamically
  },
  relatedAdTitle: {
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'system-ui',
    marginBottom: 3,
    lineHeight: 16,
    // fontSize set dynamically
  },
  relatedAdPrice: {
    fontWeight: '700',
    color: '#4CAF50',
    fontFamily: 'system-ui',
    marginBottom: SPACING.xs,
    lineHeight: 18,
    // fontSize set dynamically
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
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    // width, height, and borderRadius set dynamically
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
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'system-ui',
    flexShrink: 1,
    minWidth: 0,
    lineHeight: 14,
    marginRight: SPACING.xs,
    includeFontPadding: false,
    // fontSize set dynamically
  },
  relatedAdLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 1,
    justifyContent: 'center',
    marginLeft: 2,
    // maxWidth set dynamically
  },
  relatedAdLocationText: {
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
    flexShrink: 1,
    includeFontPadding: false,
    // fontSize set dynamically
  },
  relatedAdSellerTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: '#F0FDF4',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    flexShrink: 0,
    margin: 0,
    marginTop: 0,
    position: 'relative',
    // minHeight set dynamically
  },
  relatedAdSellerTypeText: {
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
    // fontSize set dynamically
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
