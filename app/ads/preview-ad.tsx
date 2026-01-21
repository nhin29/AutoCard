import { ContactModal } from '@/components/ContactModal';
import { EnquiryModal } from '@/components/EnquiryModal';
import { EnquirySuccessModal } from '@/components/EnquirySuccessModal';
import { AlertIcon } from '@/components/icons/AlertIcon';
import { LocationIcon } from '@/components/icons/LocationIcon';
import { LoveIcon } from '@/components/icons/LoveIcon';
import { MessageIcon } from '@/components/icons/MessageIcon';
import { PhoneIcon } from '@/components/icons/PhoneIcon';
import { ShareIcon } from '@/components/icons/ShareIcon';
import { VerifyIcon } from '@/components/icons/VerifyIcon';
import { ViewerIcon } from '@/components/icons/ViewerIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Ad } from '@/stores/useAdStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
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
  const router = useRouter();
  const params = useLocalSearchParams<{ adData?: string }>();
  const { user } = useAuthStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [enquiryModalVisible, setEnquiryModalVisible] = useState(false);
  const [enquirySuccessVisible, setEnquirySuccessVisible] = useState(false);
  
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
  const mainImage = images[currentImageIndex] || images[0] || null;
  
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
  const isTradeSeller = userProfile?.account_type === 'trade' || userProfile?.account_type === 'brand';
  const profileImageUrl = userProfile?.business_logo_url || null;

  const handleBack = () => {
    router.push('/ads/place-ad');
  };

  const handleRenewAd = () => {
    // TODO: Implement renew ad functionality
  };

  const handleCloseContactModal = () => {
    setContactModalVisible(false);
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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview Ad</Text>
        <TouchableOpacity
          style={styles.renewButton}
          onPress={handleRenewAd}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={styles.renewButtonText}>Renew Ad</Text>
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
            if (images.length > 1) {
              setCurrentImageIndex((prev) => (prev + 1) % images.length);
            }
          }}
          activeOpacity={images.length > 1 ? 0.9 : 1}
          {...(Platform.OS === 'web' && { cursor: images.length > 1 ? 'pointer' : 'default' })}>
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

        {/* Car Title and Engagement */}
        <View style={styles.titleSection}>
          <Text style={styles.carTitle}>{adData.itemName || 'Vehicle'}</Text>
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
        </View>

        {/* Location */}
        {adData.location && (
          <View style={styles.locationRow}>
            <LocationIcon width={16} height={16} />
            <Text style={styles.locationText}>{adData.location}</Text>
          </View>
        )}

        {/* Price and Contact Actions */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>
            {adData.currency} {parseInt(adData.amount || '0').toLocaleString()}
          </Text>
          <View style={styles.contactActions}>
            <View style={[styles.contactButton, styles.callButton]}>
              <PhoneIcon width={21} height={21} color="#1E40AF" />
            </View>
            <View style={[styles.contactButton, styles.messageButton]}>
              <MessageIcon width={20} height={19} color="#115E59" />
            </View>
            <View style={[styles.contactButton, styles.notifyButton]}>
              <AlertIcon width={21} height={22} color="#991B1B" />
              <View style={styles.notificationDot} />
            </View>
          </View>
        </View>

        {/* Key Features */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <IconSymbol name="calendar" size={20} color="#6B7280" />
            <Text style={styles.featureValue}>
              {adData.vanYearOfProduction || '2024'}
            </Text>
          </View>
          <View style={styles.featureCard}>
            <IconSymbol name="speed" size={20} color="#6B7280" />
            <Text style={styles.featureValue}>
              {adData.mileage ? `${adData.mileage} ${adData.mileageUnit}` : '80,000'}
            </Text>
          </View>
          <View style={styles.featureCard}>
            <IconSymbol name="local-gas-station" size={20} color="#6B7280" />
            <Text style={styles.featureValue}>Petrol</Text>
          </View>
          <View style={styles.featureCard}>
            <IconSymbol name="settings" size={20} color="#6B7280" />
            <Text style={styles.featureValue}>Automatic</Text>
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
          <Text style={styles.specTitle}>Specifications</Text>
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
              <Text style={styles.specValue}>---</Text>
            </View>
          </View>
        </View>

        {/* Seller Information */}
        <View style={styles.sellerSection}>
          <View style={styles.sellerInfo}>
            <View style={styles.profileImageContainer}>
              <Image
                source={require('@/assets/images/message-avatar.png')}
                style={styles.profileImage}
                resizeMode="cover"
              />
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
              {isTradeSeller && (
                <View style={styles.tradeSellerBadge}>
                  <Text style={styles.tradeSellerText}>Trade Seller</Text>
                </View>
              )}
            </View>
            <Text style={styles.postedTime}>Posted {formatTimeAgo(new Date().toISOString())}</Text>
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
        isTradeSeller={isTradeSeller}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  renewButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  renewButtonText: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    marginBottom: 12,
  },
  carTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    flex: 1,
  },
  engagementRow: {
    flexDirection: 'row',
    gap: 16,
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    marginBottom: 24,
  },
  price: {
    fontSize: 32,
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
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  featuresSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  featureValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'system-ui',
    textAlign: 'center',
  },
  descriptionSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    fontFamily: 'system-ui',
    lineHeight: 22,
  },
  specificationsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  specTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 16,
  },
  specGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  specGridItem: {
    flex: 1,
    maxWidth: '30%',
  },
  specLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 8,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
  },
  sellerSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  tradeSellerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tradeSellerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
    fontFamily: 'system-ui',
  },
  postedTime: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});
