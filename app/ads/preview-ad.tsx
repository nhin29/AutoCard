import { ContactModal } from '@/components/ContactModal';
import { EnquiryModal } from '@/components/EnquiryModal';
import { EnquirySuccessModal } from '@/components/EnquirySuccessModal';
import { AlertIcon } from '@/components/icons/AlertIcon';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { FuelIcon } from '@/components/icons/FuelIcon';
import { GearIcon } from '@/components/icons/GearIcon';
import { LocationIcon } from '@/components/icons/LocationIcon';
import { LoveIcon } from '@/components/icons/LoveIcon';
import { MessageIcon } from '@/components/icons/MessageIcon';
import { PhoneIcon } from '@/components/icons/PhoneIcon';
import { ShareIcon } from '@/components/icons/ShareIcon';
import { SpeedometerIcon } from '@/components/icons/SpeedometerIcon';
import { VerifyIcon } from '@/components/icons/VerifyIcon';
import { ViewerIcon } from '@/components/icons/ViewerIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Ad } from '@/stores/useAdStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive, SPACING } from '@/utils/responsive';
import {
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
    useWindowDimensions
} from 'react-native';


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
 * Format number with K/M suffix (e.g., 20000 -> "20k")
 */
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return num.toString();
};

/**
 * Preview Ad Screen
 * 
 * Displays a preview of the ad with all entered information,
 * showing how it will appear to other users.
 */
export default function PreviewAdScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSmall } = useResponsive();
  const params = useLocalSearchParams<{ adData?: string }>();
  const { user } = useAuthStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [enquiryModalVisible, setEnquiryModalVisible] = useState(false);
  const [enquirySuccessVisible, setEnquirySuccessVisible] = useState(false);
  const autoSlideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Image slider refs
  const imageFlatListRef = useRef<FlatList>(null);
  const isScrollingRef = useRef(false);
  
  // Parse ad data from params
  const adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'> = params.adData
    ? JSON.parse(params.adData)
    : {
        category: '',
        phoneNumber: '',
        location: '',
        currency: '€',
        amount: '',
        description: '',
        itemName: '',
        uploadedImages: [],
        uploadedStories: [],
        vehicleLicenseNumber: '',
        status: '',
        adType: '',
        mileage: '',
        mileageUnit: 'KM',
        motNctStatus: '',
        vanMake: '',
        vanModel: '',
        vanYearOfProduction: '',
        loadCapacity: '',
      };

  const images = adData.uploadedImages || [];
  
  // Placeholder engagement metrics
  const views = 20000;
  const likes = 10000;
  const shares = 237;
  
  // Get seller information from current user profile
  const userProfile = user?.profile;
  const sellerName = userProfile?.contact_person_name || 
                     userProfile?.business_name || 
                     userProfile?.email?.split('@')[0] || 
                     'Seller';
  const isVerified = userProfile?.is_verified || userProfile?.verification_badge || false;
  const isPrivateSeller = userProfile?.account_type === 'private';
  const profileImageUrl = userProfile?.business_logo_url || null;

  // Auto-slide images every 3 seconds with smooth transitions
  useEffect(() => {
    if (images.length <= 1) {
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
    }, 3000);

    return () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
      }
    };
  }, [images.length, currentImageIndex]);

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
    setTimeout(() => {
      imageFlatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
      });
    }, 100);
  };

  const handleBack = () => {
    router.back();
  };

  const handleViewStory = () => {
    // TODO: Navigate to story view
  };

  const handleCall = () => {
    if (adData.phoneNumber) {
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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (isSmall ? SPACING.md : SPACING.base) }]}>
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
        
        {/* Hero Image Slider */}
        <TouchableOpacity
          style={styles.heroImageContainer}
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
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              )}
              decelerationRate="fast"
              snapToInterval={screenWidth}
              snapToAlignment="start"
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
          <Text style={styles.carTitle}>{adData.itemName || 'Vehicle'}</Text>
        </View>

        {/* Location */}
        {adData.location && (
          <View style={styles.locationRow}>
            <LocationIcon width={16} height={16} />
            <Text style={styles.locationText}>{adData.location}</Text>
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
            {adData.currency} {parseInt(adData.amount || '0').toLocaleString()}
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
              {adData.vanYearOfProduction || '2024'}
            </Text>
          </View>
          <View style={styles.featureCard}>
            <SpeedometerIcon width={23} height={21} color="#9CA3AF" />
            <Text style={styles.featureValue}>
              {adData.mileage ? `${adData.mileage}` : '80,000'}
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
        {adData.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{adData.description}</Text>
          </View>
        )}

        {/* Specifications */}
        <View style={styles.specificationsSection}>
          <View style={styles.specGrid}>
            {/* Row 1 */}
            <View style={styles.specGridItem}>
              <Text style={styles.specLabel}>Make</Text>
              <Text style={styles.specValue}>{adData.vanMake || 'BMW'}</Text>
            </View>
            <View style={styles.specGridItem}>
              <Text style={styles.specLabel}>Model</Text>
              <Text style={styles.specValue}>{adData.vanModel || adData.itemName || '520 M Sports'}</Text>
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
              <Text style={styles.postedTime}>{formatTimeAgo(new Date().toISOString())}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Contact Modal */}
      <ContactModal
        visible={contactModalVisible}
        onClose={handleCloseContactModal}
        sellerName={sellerName}
        phoneNumber={adData.phoneNumber || userProfile?.phone_number || ''}
        email={userProfile?.email || ''}
        profileImage={profileImageUrl ? { uri: profileImageUrl } : undefined}
        isVerified={isVerified}
        isTradeSeller={!isPrivateSeller}
        timestamp={formatTimeAgo(new Date().toISOString())}
      />

      {/* Enquiry Modal */}
      <EnquiryModal
        visible={enquiryModalVisible}
        onClose={handleCloseEnquiryModal}
        itemName={adData.itemName}
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
    // paddingTop set dynamically via inline style using SafeAreaInsets
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
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 300,
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
});
