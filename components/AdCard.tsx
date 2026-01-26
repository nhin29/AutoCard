import { AlertIcon } from '@/components/icons/AlertIcon';
import { LocationIcon } from '@/components/icons/LocationIcon';
import { LoveIcon } from '@/components/icons/LoveIcon';
import { MessageIcon } from '@/components/icons/MessageIcon';
import { PhoneIcon } from '@/components/icons/PhoneIcon';
import { ShareIcon } from '@/components/icons/ShareIcon';
import { VerifyIcon } from '@/components/icons/VerifyIcon';
import { ViewerIcon } from '@/components/icons/ViewerIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getProfile } from '@/services/profile';
import type { Ad } from '@/stores/useAdStore';
import type { Profile } from '@/types/database';
import { FONT_SIZES, SPACING, useResponsive, useScaledSize } from '@/utils/responsive';
import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AdCardProps {
  ad: Ad;
  onCall?: () => void;
  onMessage?: () => void;
  onNotify?: () => void;
  onThumbnailPress?: (index: number) => void;
  onPress?: () => void;
  availableHeight?: number; // Optional: available height for the card
}

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
 * Format number with K/M suffix (e.g., 20000 -> "20k")
 */
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return num.toString();
};

/**
 * Detailed Ad Card Component
 * 
 * Displays a single ad in full-screen format matching the design specification.
 * Shows seller info, images, details, engagement metrics, and action buttons.
 */
export function AdCard({ 
  ad, 
  onCall, 
  onMessage, 
  onNotify,
  onThumbnailPress,
  onPress,
  availableHeight
}: AdCardProps) {
  // Responsive design hooks - using scale factor for proportional sizing
  const { width: screenWidth, height: screenHeight, scaleFactor, isSmall } = useResponsive();
  
  // Use scaled padding that grows with screen size
  const horizontalPadding = useScaledSize(SPACING.base, SPACING.sm, SPACING.lg);
  
  // Calculate thumbnail size - must exactly match main image container width
  // Main image container inner width = screenWidth - (horizontalPadding * 2)
  const mainImageContainerWidth = screenWidth - (horizontalPadding * 2);
  const thumbnailGap = useScaledSize(8, 6, 10);
  
  // Calculate thumbnail size: 3 thumbnails + 2 gaps = mainImageContainerWidth
  // Formula: (totalWidth - (numberOfGaps * gapSize)) / numberOfThumbnails
  // For small phones, use smaller thumbnails to save vertical space
  const baseThumbnailSize = (mainImageContainerWidth - (thumbnailGap * 2)) / 3; // 3 thumbnails with 2 gaps between them
  const thumbnailSize = isSmall ? Math.floor(baseThumbnailSize * 0.85) : Math.floor(baseThumbnailSize);
  
  // Recalculate to ensure exact width match: 3 thumbnails + 2 gaps should equal mainImageContainerWidth
  // Adjust gap slightly if needed to ensure perfect alignment
  const calculatedTotalWidth = (thumbnailSize * 3) + (thumbnailGap * 2);
  const widthDifference = mainImageContainerWidth - calculatedTotalWidth;
  // Distribute any width difference to gaps for perfect alignment
  const adjustedGap = thumbnailGap + (widthDifference / 2);
  
  // Calculate responsive sizes using scale factor - ensures proper scaling on all devices
  const profileImageSize = useScaledSize(42, 36, 52);
  const addFriendBadgeSize = useScaledSize(17, 14, 22);
  const addFriendIconSize = useScaledSize(10, 8, 12);
  const sellerNameFontSize = useScaledSize(FONT_SIZES.sm, FONT_SIZES.xs, FONT_SIZES.md);
  const timestampFontSize = useScaledSize(11, 9, FONT_SIZES.sm);
  const tradeSellerButtonPaddingH = useScaledSize(SPACING.sm, SPACING.xs, SPACING.md);
  const tradeSellerButtonPaddingV = useScaledSize(4, 2, SPACING.sm);
  const tradeSellerButtonFontSize = useScaledSize(10, 9, FONT_SIZES.sm);
  
  // Main image height - will be calculated after we have thumbnails info
  // Start with a default that balances visibility with content fitting
  // Increased for larger phones like iPhone 16 Pro while ensuring content fits
  let mainImageHeight = useScaledSize(180, 150, 220);
  
  const spotlightIconSize = useScaledSize(14, 12, 18);
  const spotlightFontSize = useScaledSize(10, 9, FONT_SIZES.sm);
  const carModelFontSize = useScaledSize(20, FONT_SIZES.md, 26);
  const locationIconSize = useScaledSize(14, 12, 18);
  const locationFontSize = useScaledSize(11, 9, FONT_SIZES.sm);
  const metricIconSize = useScaledSize(12.5, 10, 16);
  const metricTextFontSize = useScaledSize(11, 9, FONT_SIZES.sm);
  const descriptionFontSize = useScaledSize(11, 9, FONT_SIZES.sm);
  const primaryPriceFontSize = useScaledSize(23, 18, 30);
  const monthlyPaymentFontSize = useScaledSize(11, 9, FONT_SIZES.sm);
  const actionButtonSize = useScaledSize(42, 36, 52);
  const actionIconSize = useScaledSize(18.5, 16, 24);
  const verifiedBadgeSize = useScaledSize(16, 14, 20);
  
  // Optimized spacing using percentage of available height for better scaling
  const heightBasedSpacing = availableHeight ? availableHeight * 0.015 : SPACING.sm; // ~1.5% of height
  const sellerHeaderPaddingTop = availableHeight ? availableHeight * 0.015 : useScaledSize(SPACING.sm, SPACING.xs, SPACING.base);
  const sellerHeaderPaddingBottom = availableHeight ? availableHeight * 0.012 : useScaledSize(SPACING.sm, SPACING.xs, SPACING.md);
  const mainImageMarginBottom = availableHeight ? availableHeight * 0.012 : useScaledSize(SPACING.sm, SPACING.xs, SPACING.md);
  const thumbnailsMarginBottom = availableHeight ? availableHeight * 0.010 : useScaledSize(SPACING.sm, SPACING.xs, SPACING.base);
  const detailsMarginBottom = availableHeight ? availableHeight * 0.012 : useScaledSize(SPACING.sm, SPACING.xs, SPACING.md);
  const engagementMarginBottom = availableHeight ? availableHeight * 0.010 : useScaledSize(SPACING.sm, SPACING.xs, SPACING.base);
  const descriptionMarginBottom = availableHeight ? availableHeight * 0.012 : useScaledSize(SPACING.sm, SPACING.xs, SPACING.md);
  const pricingPaddingBottom = availableHeight ? availableHeight * 0.010 : useScaledSize(SPACING.sm, SPACING.xs, SPACING.base);
  const pricingMinHeight = availableHeight ? availableHeight * 0.065 : useScaledSize(56, 48, 72); // ~6.5% of height
  
  // Additional responsive values for conditional sizing
  const containerPaddingBottom = useScaledSize(2, 0, 4);
  const placeholderIconSize = useScaledSize(44, 40, 50);
  const remainingImagesFontSize = useScaledSize(FONT_SIZES.md, FONT_SIZES.sm, FONT_SIZES.lg);
  const carModelMarginBottom = useScaledSize(SPACING.sm, SPACING.xs, SPACING.md);
  const engagementGap = useScaledSize(20, SPACING.sm, 24);
  const actionButtonsGap = useScaledSize(12, SPACING.sm, 16);
  
  // Get image data first (needed for height calculation)
  const mainImage = ad.uploadedImages[0] || null;
  const thumbnails = ad.uploadedImages.slice(1, 4); // Show first 3 thumbnails
  const remainingImages = Math.max(0, ad.uploadedImages.length - 4);
  
  // Calculate main image height using percentage of available height
  // This ensures proper scaling across all phone sizes (different heights)
  if (availableHeight && availableHeight > 0) {
    // Use percentage-based calculation for better scaling across different screen heights
    // Main image should take approximately 35-45% of available height
    // Adjust based on device size: larger phones can use more, small phones less
    const imageHeightPercentage = isSmall ? 0.35 : scaleFactor > 1.05 ? 0.42 : 0.38;
    const calculatedImageHeight = availableHeight * imageHeightPercentage;
    
    // Clamp between reasonable min and max (as percentage of screen height)
    const minImageHeightPercent = isSmall ? 0.28 : 0.32; // 28-32% of available height
    const maxImageHeightPercent = isSmall ? 0.40 : 0.48; // 40-48% of available height
    const minImageHeight = availableHeight * minImageHeightPercent;
    const maxImageHeight = availableHeight * maxImageHeightPercent;
    
    mainImageHeight = Math.max(minImageHeight, Math.min(calculatedImageHeight, maxImageHeight));
  }
  
  // User profile state
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Fetch user profile when ad has userId
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!ad.userId) {
        setIsLoadingProfile(false);
        return;
      }
      
      try {
        setIsLoadingProfile(true);
        const result = await getProfile(ad.userId);
        if (result.profile) {
          setUserProfile(result.profile);
        }
      } catch (error) {
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchUserProfile();
  }, [ad.userId]);
  
  // Get seller information from profile
  const sellerName = userProfile?.contact_person_name || 
                     userProfile?.business_name || 
                     userProfile?.email?.split('@')[0] || 
                     'Seller';
  const isVerified = userProfile?.verification_badge || userProfile?.is_verified || false;
  const accountType = userProfile?.account_type;
  const profileImageUrl = userProfile?.business_logo_url || null;
  
  // Determine account type text
  const accountTypeText = accountType === 'trade' ? 'Trade Seller' : 
                         accountType === 'private' ? 'Private Seller' : 
                         accountType === 'brand' ? 'Brand' : 
                         null;
  
  // Placeholder engagement metrics (can be added to Ad interface)
  const views = 20000;
  const likes = 10000;
  const shares = 237;

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        { 
          paddingBottom: containerPaddingBottom, 
          flex: 1, 
          height: availableHeight || '100%',
          justifyContent: 'flex-start',
        }
      ]}
      onPress={onPress}
      activeOpacity={0.95}
      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
      {/* Seller Information Header */}
      <View style={[styles.sellerHeader, { paddingHorizontal: horizontalPadding, paddingTop: sellerHeaderPaddingTop, paddingBottom: sellerHeaderPaddingBottom }]}>
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
            <Text style={[styles.timestamp, { fontSize: timestampFontSize }]}>{formatTimeAgo(ad.createdAt)}</Text>
          </View>
        </View>
        {accountTypeText && (
          <TouchableOpacity
            style={[
              styles.tradeSellerButton,
              {
                paddingHorizontal: tradeSellerButtonPaddingH,
                paddingVertical: tradeSellerButtonPaddingV,
              }
            ]}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={[styles.tradeSellerButtonText, { fontSize: tradeSellerButtonFontSize }]}>{accountTypeText}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Advertisement Image */}
      <View style={[styles.mainImageContainer, { paddingHorizontal: horizontalPadding, marginBottom: mainImageMarginBottom }]}>
        <View style={[styles.mainImageWrapper, { height: mainImageHeight }]}>
          {mainImage ? (
            <Image
              source={{ uri: mainImage }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.mainImagePlaceholder}>
              <IconSymbol name="photo" size={placeholderIconSize} color="#9CA3AF" />
            </View>
          )}
          {/* SPOTLIGHT Badge */}
          <View style={styles.spotlightBadge}>
            <IconSymbol name="flame.fill" size={spotlightIconSize} color="#FFD700" />
            <Text style={[styles.spotlightText, { fontSize: spotlightFontSize }]}>SPOTLIGHT</Text>
          </View>
        </View>
      </View>

      {/* Thumbnail Images */}
      {thumbnails.length > 0 && (
        <View style={[styles.thumbnailsContainer, { paddingHorizontal: horizontalPadding, marginBottom: thumbnailsMarginBottom }]}>
          {thumbnails.map((thumbnail, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnail, 
                { 
                  width: thumbnailSize, 
                  height: thumbnailSize,
                  marginRight: index < thumbnails.length - 1 ? adjustedGap : 0, // Add gap between thumbnails
                }
              ]}
              onPress={() => onThumbnailPress?.(index + 1)}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Image
                source={{ uri: thumbnail }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
              {index === thumbnails.length - 1 && remainingImages > 0 && (
                <View style={styles.thumbnailOverlay}>
                  <Text style={[styles.remainingImagesText, { fontSize: remainingImagesFontSize }]} maxFontSizeMultiplier={1.2}>+{remainingImages}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Car Details */}
      <View style={[styles.detailsContainer, { paddingHorizontal: horizontalPadding, marginBottom: detailsMarginBottom }]}>
        <Text style={[styles.carModel, { fontSize: carModelFontSize, marginBottom: carModelMarginBottom }]}>{ad.itemName || 'Vehicle'}</Text>
        {ad.location && (
          <View style={styles.locationRow}>
            <LocationIcon width={locationIconSize} height={locationIconSize} />
            <Text style={[styles.locationText, { fontSize: locationFontSize }]}>{ad.location}</Text>
          </View>
        )}
      </View>

      {/* Engagement Metrics */}
      <View style={[styles.engagementRow, { paddingHorizontal: horizontalPadding, gap: engagementGap, marginBottom: engagementMarginBottom }]}>
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

      {/* Description */}
      {ad.description && (
        <View style={[styles.descriptionContainer, { paddingHorizontal: horizontalPadding, marginBottom: descriptionMarginBottom }]}>
          <Text 
            style={[styles.descriptionText, { fontSize: descriptionFontSize, lineHeight: descriptionFontSize * 1.2 }]} 
            numberOfLines={2} 
            ellipsizeMode="tail">
            {ad.description}
          </Text>
        </View>
      )}

      {/* Pricing Information */}
      <View style={[styles.pricingContainer, { paddingHorizontal: horizontalPadding, minHeight: pricingMinHeight, paddingBottom: pricingPaddingBottom }]}>
        <View style={styles.priceSection}>
          <Text style={[styles.primaryPrice, { fontSize: primaryPriceFontSize }]}>
            {ad.currency} {parseInt(ad.amount || '0').toLocaleString()}
          </Text>
          <Text style={[styles.monthlyPayment, { fontSize: monthlyPaymentFontSize }]}>
            From {ad.currency}{Math.floor(parseInt(ad.amount || '0') / 48).toLocaleString()}/mo
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionButtons, { gap: actionButtonsGap }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton, { width: actionButtonSize, height: actionButtonSize }]}
            onPress={onCall}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <PhoneIcon width={actionIconSize} height={actionIconSize} color="#1E40AF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton, { width: actionButtonSize, height: actionButtonSize }]}
            onPress={onMessage}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <MessageIcon width={actionIconSize} height={Math.floor(actionIconSize * 0.9)} color="#115E59" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.notifyButton, { width: actionButtonSize, height: actionButtonSize }]}
            onPress={onNotify}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <AlertIcon width={actionIconSize} height={Math.floor(actionIconSize * 1.05)} color="#991B1B" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingBottom: 4,
    // Use flexbox to ensure content fits
    justifyContent: 'flex-start',
    // paddingBottom set to 0 on small screens via inline style if needed
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingTop, paddingBottom, and paddingHorizontal set dynamically
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: SPACING.md,
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
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sellerName: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  verifiedBadge: {
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    // width and height set dynamically
  },
  timestamp: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  tradeSellerButton: {
    backgroundColor: '#E0F2FE',
    borderRadius: 6,
    alignSelf: 'center',
    // paddingHorizontal and paddingVertical set dynamically
  },
  tradeSellerButtonText: {
    fontWeight: '600',
    color: '#0369A1',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  mainImageContainer: {
    width: '100%',
    // paddingHorizontal and marginBottom set dynamically
  },
  mainImageWrapper: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
    // height set dynamically
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  mainImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 9999,
    gap: SPACING.xs,
  },
  spotlightText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    letterSpacing: 0.5,
    // fontSize set dynamically
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    // paddingHorizontal and marginBottom set dynamically
    // Width matches main image container due to same paddingHorizontal
    // Gap is handled via marginRight on individual thumbnails for precise control
  },
  thumbnail: {
    // Width and height set dynamically via inline styles
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingImagesText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  detailsContainer: {
    // paddingHorizontal and marginBottom set dynamically
  },
  carModel: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    flexShrink: 1,
    // fontSize and marginBottom set dynamically
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  locationText: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    flex: 1,
    flexShrink: 1,
    // fontSize set dynamically
  },
  engagementRow: {
    flexDirection: 'row',
    gap: 24,
    // paddingHorizontal, gap, and marginBottom set dynamically
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
  descriptionContainer: {
    // paddingHorizontal and marginBottom set dynamically
  },
  descriptionText: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    lineHeight: 14, // Reduced from 18 for tighter line spacing
    flexShrink: 1,
    // fontSize set dynamically
  },
  pricingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal, paddingBottom, and minHeight set dynamically
  },
  priceSection: {
    flex: 1,
    justifyContent: 'center',
  },
  primaryPrice: {
    fontWeight: '700',
    color: '#4CAF50',
    fontFamily: 'system-ui',
    marginBottom: SPACING.xs,
    // fontSize set dynamically
  },
  monthlyPayment: {
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    // gap set dynamically
  },
  actionButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
});
