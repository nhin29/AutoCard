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
import { useEffect, useState } from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AdCardProps {
  ad: Ad;
  onCall?: () => void;
  onMessage?: () => void;
  onNotify?: () => void;
  onThumbnailPress?: (index: number) => void;
  onPress?: () => void;
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
  onPress
}: AdCardProps) {
  const mainImage = ad.uploadedImages[0] || null;
  const thumbnails = ad.uploadedImages.slice(1, 4); // Show first 3 thumbnails
  const remainingImages = Math.max(0, ad.uploadedImages.length - 4);
  
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
        console.error('[AdCard] Error fetching user profile:', error);
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
  const isVerified = userProfile?.is_verified || userProfile?.verification_badge || false;
  const isTradeSeller = userProfile?.account_type === 'trade' || userProfile?.account_type === 'brand';
  const profileImageUrl = userProfile?.business_logo_url || null;
  
  // Placeholder engagement metrics (can be added to Ad interface)
  const views = 20000;
  const likes = 10000;
  const shares = 237;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.95}
      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
      {/* Seller Information Header */}
      <View style={styles.sellerHeader}>
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
            <Text style={styles.timestamp}>{formatTimeAgo(ad.createdAt)}</Text>
          </View>
        </View>
        {isTradeSeller && (
          <TouchableOpacity
            style={styles.tradeSellerButton}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={styles.tradeSellerButtonText}>Trade Seller</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Advertisement Image */}
      <View style={styles.mainImageContainer}>
        <View style={styles.mainImageWrapper}>
          {mainImage ? (
            <Image
              source={{ uri: mainImage }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.mainImagePlaceholder}>
              <IconSymbol name="photo" size={48} color="#9CA3AF" />
            </View>
          )}
          {/* SPOTLIGHT Badge */}
          <View style={styles.spotlightBadge}>
            <IconSymbol name="flame.fill" size={16} color="#FFD700" />
            <Text style={styles.spotlightText}>SPOTLIGHT</Text>
          </View>
        </View>
      </View>

      {/* Thumbnail Images */}
      {thumbnails.length > 0 && (
        <View style={styles.thumbnailsContainer}>
          {thumbnails.map((thumbnail, index) => (
            <TouchableOpacity
              key={index}
              style={styles.thumbnail}
              onPress={() => onThumbnailPress?.(index + 1)}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Image
                source={{ uri: thumbnail }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
              {index === thumbnails.length - 1 && remainingImages > 0 && (
                <View style={styles.thumbnailOverlay}>
                  <Text style={styles.remainingImagesText}>+{remainingImages}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Car Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.carModel}>{ad.itemName || 'Vehicle'}</Text>
        {ad.location && (
          <View style={styles.locationRow}>
            <LocationIcon width={16} height={16} />
            <Text style={styles.locationText}>{ad.location}</Text>
          </View>
        )}
      </View>

      {/* Engagement Metrics */}
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

      {/* Description */}
      {ad.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText} numberOfLines={2} ellipsizeMode="tail">
            {ad.description}
          </Text>
        </View>
      )}

      {/* Pricing Information */}
      <View style={styles.pricingContainer}>
        <View style={styles.priceSection}>
          <Text style={styles.primaryPrice}>
            {ad.currency} {parseInt(ad.amount || '0').toLocaleString()}
          </Text>
          <Text style={styles.monthlyPayment}>
            From {ad.currency}{Math.floor(parseInt(ad.amount || '0') / 48).toLocaleString()}/mo
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={onCall}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <PhoneIcon width={21} height={21} color="#1E40AF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={onMessage}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <MessageIcon width={20} height={19} color="#115E59" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.notifyButton]}
            onPress={onNotify}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <AlertIcon width={21} height={22} color="#991B1B" />
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
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
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
  timestamp: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
  },
  tradeSellerButton: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tradeSellerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
    fontFamily: 'system-ui',
  },
  mainImageContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  mainImageWrapper: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
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
    top: 12,
    left: 12,
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
  thumbnailsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  thumbnail: {
    width: (SCREEN_WIDTH - 48) / 3,
    height: (SCREEN_WIDTH - 48) / 3,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  detailsContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  carModel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    flex: 1,
  },
  engagementRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 24,
    marginBottom: 16,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'system-ui',
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    lineHeight: 18,
  },
  pricingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    minHeight: 64,
  },
  priceSection: {
    flex: 1,
    justifyContent: 'center',
  },
  primaryPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CAF50',
    fontFamily: 'system-ui',
    marginBottom: 4,
  },
  monthlyPayment: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
