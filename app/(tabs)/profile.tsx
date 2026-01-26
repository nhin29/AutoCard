import { Sidebar } from '@/components/Sidebar';
import { ImageCountIcon } from '@/components/icons/ImageCountIcon';
import { LocationIcon } from '@/components/icons/LocationIcon';
import { LoveIcon } from '@/components/icons/LoveIcon';
import { MenuIcon } from '@/components/icons/MenuIcon';
import { ShareIcon } from '@/components/icons/ShareIcon';
import { ViewerIcon } from '@/components/icons/ViewerIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { adService } from '@/services/ad';
import { profileService } from '@/services/profile';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Ad as DatabaseAd, Profile } from '@/types/database';
import { FONT_SIZES, SPACING, useResponsive } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


/**
 * Format number with K/M suffix
 */
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return num.toString();
}

/**
 * Profile Screen
 * 
 * Displays user profile with:
 * - Profile banner and picture
 * - User information and stats
 * - Details and social links
 * - Content tabs (Ads/About)
 */
export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSmall, width: screenWidth } = useResponsive();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ adsCount: 0, followersCount: 0, followingCount: 0 });
  const [activeTab, setActiveTab] = useState<'ads' | 'about'>('about');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [editingField, setEditingField] = useState<'address' | 'phone' | null>(null);
  const [addressValue, setAddressValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingSocial, setEditingSocial] = useState<'facebook' | 'instagram' | 'twitter' | 'youtube' | null>(null);
  const [socialLinkValue, setSocialLinkValue] = useState('');
  const [adFilter, setAdFilter] = useState<'active' | 'expired' | 'pending' | 'rejected'>('active');
  const [userAds, setUserAds] = useState<DatabaseAd[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(false);

  // Track if profile was just updated to avoid unnecessary reload
  const profileUpdateTimestampRef = useRef<number>(0);

  // Calculate responsive values - reduced for small phones
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.base;
  // Add extra padding on top of safe area insets for better spacing from status bar
  const topNavPaddingTop = insets.top + (isSmall ? SPACING.md : SPACING.base);
  const topNavPaddingBottom = isSmall ? SPACING.sm : SPACING.base;
  const navTitleFontSize = isSmall ? FONT_SIZES.base : 18;
  const navIconSize = isSmall ? 18 : 24;
  const navButtonSize = isSmall ? 36 : 40;
  const bannerHeight = isSmall ? 140 : 180;
  const profilePicSize = isSmall ? 90 : 120;
  const profilePicBorderWidth = isSmall ? 3 : 4;
  const userNameFontSize = isSmall ? FONT_SIZES.lg : 22;
  const locationFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const editButtonPaddingH = isSmall ? SPACING.sm : SPACING.md;
  const editButtonPaddingV = isSmall ? 6 : 8;
  const editButtonFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const editButtonIconSize = isSmall ? 12 : 14;
  const editButtonMinWidth = isSmall ? 100 : 120;
  const statNumberFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const statLabelFontSize = isSmall ? 10 : 11;
  const tabFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const tabPaddingH = isSmall ? SPACING.md : 24;
  const tabPaddingV = isSmall ? 6 : 8;
  const sectionTitleFontSize = isSmall ? FONT_SIZES.sm : 14;
  const sectionPadding = isSmall ? SPACING.sm : 12;
  const detailTextFontSize = isSmall ? 11 : 12;
  const detailInputFontSize = isSmall ? 11 : 12;
  const socialPlatformFontSize = isSmall ? FONT_SIZES.sm : 14;
  const socialStatusFontSize = isSmall ? 11 : 12;
  const socialIconSize = isSmall ? 28 : 32;
  const linkButtonFontSize = isSmall ? 11 : 12;
  const adFilterTabFontSize = isSmall ? FONT_SIZES.sm : 14;
  const adFilterTabPaddingH = isSmall ? SPACING.sm : 8;
  const adFilterTabPaddingV = isSmall ? 10 : 12;
  const profileAdImageHeight = isSmall ? 140 : 180;
  const profileAdTitleFontSize = isSmall ? FONT_SIZES.md : 16;
  const profileAdLocationFontSize = isSmall ? 11 : 12;
  const profileAdMetricFontSize = isSmall ? 10 : 11;
  const profileAdPriceFontSize = isSmall ? FONT_SIZES.md : 16;
  const profileAdMonthlyFontSize = isSmall ? 11 : 12;
  const cardPadding = isSmall ? SPACING.sm : SPACING.base;
  const cardGap = isSmall ? SPACING.sm : SPACING.base;
  // Guest profile responsive values
  const guestContentPaddingTop = isSmall ? SPACING.md : 20;
  const guestContentPaddingBottom = isSmall ? SPACING.xl : 40;
  const guestMessageMarginBottom = isSmall ? SPACING.xl : 32;
  const guestMessagePaddingTop = isSmall ? SPACING.md : 20;
  const guestMessageTitleMarginBottom = isSmall ? SPACING.sm : 8;
  const guestMessageSubtitleMarginBottom = isSmall ? SPACING.md : 24;
  const guestSectionMarginBottom = isSmall ? SPACING.xl : 32;
  const guestSectionTitleMarginBottom = isSmall ? SPACING.sm : 16;
  const guestMenuItemPaddingV = isSmall ? SPACING.sm : 12;
  const guestMenuItemGap = isSmall ? SPACING.sm : 12;
  const loginNowButtonMaxWidth = isSmall ? 280 : 300;

  useEffect(() => {
    // Only reload if profile is not in auth store or if it's been more than 5 seconds since last update
    // This prevents unnecessary reloads after save operations
    const shouldReload = !user?.profile || 
      (Date.now() - profileUpdateTimestampRef.current > 5000);
    
    if (shouldReload) {
      loadProfileData();
    } else if (user?.profile) {
      // Use profile from auth store if available and recent
      setProfile(user.profile);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Load user's ads when ads tab is active
  useEffect(() => {
    if (activeTab === 'ads' && user?.id) {
      loadUserAds();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.id, adFilter]);

  // Listen to profile updates from auth store (realtime updates)
  useEffect(() => {
    if (user?.profile) {
      setProfile(user.profile);
      profileUpdateTimestampRef.current = Date.now();
    }
  }, [user?.profile]);

  const loadProfileData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Use profile from auth store if available, otherwise fetch
      if (user.profile) {
        setProfile(user.profile);
        profileUpdateTimestampRef.current = Date.now();
      } else {
        const { profile: profileData, error: profileError } = await profileService.getCurrentProfile();
        if (profileError) {
        } else if (profileData) {
          setProfile(profileData);
          profileUpdateTimestampRef.current = Date.now();
        }
      }

      // Load stats (only if not recently loaded)
      const statsData = await profileService.getUserStats(user.id);
      if (!statsData.error) {
        setStats(statsData);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserAds = async () => {
    if (!user?.id) return;

    try {
      setIsLoadingAds(true);
      const { ads, error } = await adService.getAdsByUserId(user.id);
      
      if (error) {
        setUserAds([]);
      } else {
        setUserAds(ads || []);
      }
    } catch (error) {
      setUserAds([]);
    } finally {
      setIsLoadingAds(false);
    }
  };

  // Filter ads based on selected filter
  const getFilteredAds = () => {
    if (!userAds.length) return [];
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (adFilter) {
      case 'active':
        return userAds.filter(ad => ad.is_active);
      case 'expired':
        return userAds.filter(ad => !ad.is_active || new Date(ad.created_at) < thirtyDaysAgo);
      case 'pending':
        // For now, treat as ads that are not active but recently created
        return userAds.filter(ad => !ad.is_active && new Date(ad.created_at) >= thirtyDaysAgo);
      case 'rejected':
        // For now, return empty - can be extended when rejection status is added
        return [];
      default:
        return userAds;
    }
  };

  const getFilterCounts = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      active: userAds.filter(ad => ad.is_active).length,
      expired: userAds.filter(ad => !ad.is_active || new Date(ad.created_at) < thirtyDaysAgo).length,
      pending: userAds.filter(ad => !ad.is_active && new Date(ad.created_at) >= thirtyDaysAgo).length,
      rejected: 0, // Can be extended when rejection status is added
    };
  };

  const handleEditProfile = () => {
    router.push('/settings/edit-profile');
  };

  const handleAddAddress = () => {
    setAddressValue(profile?.business_address || '');
    setEditingField('address');
  };

  const handleAddPhone = () => {
    setPhoneValue(profile?.phone_number || '');
    setEditingField('phone');
  };


  const handleSaveAddress = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      const { profile: updatedProfile, error } = await profileService.updateCurrentProfile(
        {
          business_address: addressValue.trim() || null,
        },
        user.id
      );

      if (error) {
        return;
      }

      if (updatedProfile) {
        setProfile(updatedProfile);
        setEditingField(null);
        setAddressValue('');
      }
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePhone = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      const { profile: updatedProfile, error } = await profileService.updateCurrentProfile(
        {
          phone_number: phoneValue.trim() || null,
        },
        user.id
      );

      if (error) {
        return;
      }

      if (updatedProfile) {
        setProfile(updatedProfile);
        setEditingField(null);
        setPhoneValue('');
      }
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkSocial = (platform: 'facebook' | 'instagram' | 'twitter' | 'youtube') => {
    // Get current link value if exists
    let currentLink = '';
    switch (platform) {
      case 'facebook':
        currentLink = profile?.facebook_link || '';
        break;
      case 'instagram':
        currentLink = profile?.instagram_link || '';
        break;
      case 'twitter':
        currentLink = ''; // Twitter not in schema yet
        break;
      case 'youtube':
        currentLink = profile?.website_link || '';
        break;
    }
    setSocialLinkValue(currentLink);
    setEditingSocial(platform);
  };


  const handleSaveSocialLink = async (platform: 'facebook' | 'instagram' | 'twitter' | 'youtube') => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      const updates: any = {};
      
      switch (platform) {
        case 'facebook':
          updates.facebook_link = socialLinkValue.trim() || null;
          break;
        case 'instagram':
          updates.instagram_link = socialLinkValue.trim() || null;
          break;
        case 'twitter':
          // Twitter not in schema yet, skip for now
          break;
        case 'youtube':
          updates.website_link = socialLinkValue.trim() || null;
          break;
      }

      const { profile: updatedProfile, error } = await profileService.updateCurrentProfile(
        updates,
        user.id
      );

      if (error) {
        return;
      }

      if (updatedProfile) {
        setProfile(updatedProfile);
        setEditingSocial(null);
        setSocialLinkValue('');
      }
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnlinkSocial = async (platform: 'facebook' | 'instagram' | 'twitter' | 'youtube') => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      const updates: any = {};
      
      switch (platform) {
        case 'facebook':
          updates.facebook_link = null;
          break;
        case 'instagram':
          updates.instagram_link = null;
          break;
        case 'twitter':
          // Twitter not in schema yet
          break;
        case 'youtube':
          updates.website_link = null;
          break;
      }

      const { profile: updatedProfile, error } = await profileService.updateCurrentProfile(
        updates,
        user.id
      );

      if (error) {
        return;
      }

      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const getSocialLinkDisplay = (platform: 'facebook' | 'instagram' | 'twitter' | 'youtube') => {
    switch (platform) {
      case 'facebook':
        return profile?.facebook_link || '';
      case 'instagram':
        return profile?.instagram_link || '';
      case 'twitter':
        return '';
      case 'youtube':
        return profile?.website_link || '';
      default:
        return '';
    }
  };

  // Profile Ad Card Component
  const ProfileAdCard = ({ ad }: { ad: DatabaseAd }) => {
    const mainImage = ad.uploaded_images?.[0] || null;
    const imageCount = ad.uploaded_images?.length || 0;
    const remainingImages = Math.max(0, imageCount - 1);
    const cardWidth = (screenWidth - (cardPadding * 2) - cardGap) / 2;

    const handleEditAd = () => {
      router.push({
        pathname: '/ads/place-ad',
        params: { adId: ad.id },
      });
    };

    const handleAdPress = () => {
      router.push({
        pathname: '/ads/ad-detail',
        params: { adId: ad.id },
      });
    };

    return (
      <TouchableOpacity
        style={[styles.profileAdCard, { width: cardWidth }]}
        onPress={handleAdPress}
        activeOpacity={0.9}
        {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
        {/* Image Container */}
        <View style={[styles.profileAdImageContainer, { height: profileAdImageHeight }]}>
          {mainImage ? (
            <Image
              source={{ uri: mainImage }}
              style={styles.profileAdImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profileAdImagePlaceholder}>
              <IconSymbol name="photo" size={isSmall ? 32 : 40} color="#9CA3AF" />
            </View>
          )}

          {/* SPOTLIGHT Badge */}
          <View style={styles.spotlightBadge}>
            <IconSymbol name="flame.fill" size={isSmall ? 10 : 12} color="#FCD34D" />
            <Text style={[styles.spotlightText, { fontSize: isSmall ? 9 : 10 }]}>SPOTLIGHT</Text>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={[styles.profileAdEditButton, { width: isSmall ? 28 : 32, height: isSmall ? 28 : 32, borderRadius: isSmall ? 14 : 16 }]}
            onPress={(e) => {
              e.stopPropagation();
              handleEditAd();
            }}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <IconSymbol name="pencil" size={isSmall ? 12 : 14} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Image Count Indicator */}
          {remainingImages > 0 && (
            <View style={styles.profileAdImageCount}>
              <ImageCountIcon size={isSmall ? 10 : 12} color="#FFFFFF" />
              <Text style={[styles.profileAdImageCountText, { fontSize: isSmall ? 9 : 10 }]}>+{remainingImages}</Text>
            </View>
          )}

          {/* Image Navigation Dots */}
          {imageCount > 1 && (
            <View style={styles.profileAdDots}>
              {Array.from({ length: Math.min(3, imageCount) }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.profileAdDot,
                    { width: isSmall ? 5 : 6, height: isSmall ? 5 : 6, borderRadius: isSmall ? 2.5 : 3 },
                    index === 0 && styles.profileAdDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Ad Details */}
        <View style={[styles.profileAdDetails, { padding: isSmall ? SPACING.sm : 12 }]}>
          <Text style={[styles.profileAdTitle, { fontSize: profileAdTitleFontSize }]} numberOfLines={1}>
            {ad.item_name}
          </Text>

          {/* Location */}
          {ad.location && (
            <View style={styles.profileAdLocation}>
              <LocationIcon width={isSmall ? 10 : 12} height={isSmall ? 10 : 12} />
              <Text style={[styles.profileAdLocationText, { fontSize: profileAdLocationFontSize }]} numberOfLines={1}>
                {ad.location}
              </Text>
            </View>
          )}

          {/* Engagement Metrics */}
          <View style={styles.profileAdMetrics}>
            <View style={styles.profileAdMetric}>
              <ViewerIcon width={isSmall ? 10 : 12} height={isSmall ? 8 : 9} />
              <Text style={[styles.profileAdMetricText, { fontSize: profileAdMetricFontSize }]}>
                {formatNumber(ad.views_count || 0)}
              </Text>
            </View>
            <View style={styles.profileAdMetric}>
              <LoveIcon width={isSmall ? 9 : 11} height={isSmall ? 8 : 10} />
              <Text style={[styles.profileAdMetricText, { fontSize: profileAdMetricFontSize }]}>
                {formatNumber(0)} {/* Likes not in DB yet */}
              </Text>
            </View>
            <View style={styles.profileAdMetric}>
              <ShareIcon width={isSmall ? 8 : 10} height={isSmall ? 8 : 10} />
              <Text style={[styles.profileAdMetricText, { fontSize: profileAdMetricFontSize }]}>
                {formatNumber(0)} {/* Shares not in DB yet */}
              </Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.profileAdPrice}>
            <Text style={[styles.profileAdPriceText, { fontSize: profileAdPriceFontSize }]}>
              {ad.currency} {ad.amount ? parseInt(ad.amount.toString()).toLocaleString() : '0'}
            </Text>
            <Text style={[styles.profileAdMonthlyPayment, { fontSize: profileAdMonthlyFontSize }]}>
              {' '}from {ad.currency}{Math.floor((ad.amount || 0) / 48).toLocaleString()}/mo
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Get display name - prefer business name for trade accounts, otherwise contact person or email
  const getDisplayName = () => {
    if (profile?.business_name) return profile.business_name;
    if (profile?.contact_person_name) return profile.contact_person_name;
    return profile?.email?.split('@')[0] || 'User';
  };

  // Get location - use business address or default
  const getLocation = () => {
    if (profile?.business_address) return profile.business_address;
    return 'Ireland'; // Default location
  };

  // Check if social account is connected
  const isSocialConnected = (platform: 'facebook' | 'instagram' | 'twitter' | 'youtube') => {
    switch (platform) {
      case 'facebook':
        return !!profile?.facebook_link;
      case 'instagram':
        return !!profile?.instagram_link;
      case 'twitter':
        return false; // Twitter not in schema yet
      case 'youtube':
        return !!profile?.website_link; // Using website_link for YouTube
      default:
        return false;
    }
  };

  // Check if user is a guest (no session/user = guest)
  const isGuest = !user;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Guest user view
  if (isGuest) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />

        {/* Top Navigation Bar */}
        <View style={[styles.topNav, { paddingTop: topNavPaddingTop, paddingBottom: topNavPaddingBottom, paddingHorizontal: horizontalPadding }]}>
          <TouchableOpacity
            style={[styles.navButton, { width: navButtonSize, height: navButtonSize }]}
            onPress={() => setSidebarVisible(true)}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <MenuIcon width={isSmall ? 16 : 19} height={isSmall ? 14 : 17} color="#1F2937" />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { fontSize: navTitleFontSize }]}>My Account</Text>
          <TouchableOpacity
            style={[styles.navButton, { width: navButtonSize, height: navButtonSize }]}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <IconSymbol name="bell" size={navIconSize} color="#000000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.guestScrollView} contentContainerStyle={[styles.guestContentContainer, { paddingHorizontal: horizontalPadding, paddingTop: guestContentPaddingTop, paddingBottom: guestContentPaddingBottom }]}>
          {/* Guest Message */}
          <View style={[styles.guestMessageContainer, { marginBottom: guestMessageMarginBottom, paddingTop: guestMessagePaddingTop }]}>
            <Text style={[styles.guestMessageTitle, { fontSize: isSmall ? FONT_SIZES.md : 18, marginBottom: guestMessageTitleMarginBottom }]}>You are currently viewing as a guest</Text>
            <Text style={[styles.guestMessageSubtitle, { fontSize: isSmall ? FONT_SIZES.sm : 14, marginBottom: guestMessageSubtitleMarginBottom }]}>Log in or create an account to unlock full features.</Text>
            <TouchableOpacity
              style={[styles.loginNowButton, { height: isSmall ? 44 : 48, maxWidth: loginNowButtonMaxWidth }]}
              onPress={() => router.push('/auth/signin')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Text style={[styles.loginNowButtonText, { fontSize: isSmall ? FONT_SIZES.sm : FONT_SIZES.md }]}>Log in Now</Text>
            </TouchableOpacity>
          </View>

          {/* Settings Section */}
          <View style={[styles.guestSection, { marginBottom: guestSectionMarginBottom }]}>
            <Text style={[styles.guestSectionTitle, { fontSize: isSmall ? FONT_SIZES.md : FONT_SIZES.lg, marginBottom: guestSectionTitleMarginBottom }]}>Settings</Text>
            
            <TouchableOpacity
              style={[styles.guestMenuItem, { paddingVertical: guestMenuItemPaddingV, gap: guestMenuItemGap }]}
              onPress={() => router.push('/settings/about')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={[styles.guestInfoIcon, { width: isSmall ? 18 : 20, height: isSmall ? 18 : 20, borderRadius: isSmall ? 9 : 10 }]}>
                <Text style={[styles.guestInfoIconText, { fontSize: isSmall ? 10 : 12 }]}>i</Text>
              </View>
              <Text style={[styles.guestMenuItemText, { fontSize: isSmall ? FONT_SIZES.sm : FONT_SIZES.md }]}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.guestMenuItem, { paddingVertical: guestMenuItemPaddingV, gap: guestMenuItemGap }]}
              onPress={() => router.push('/legal/terms-of-service')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="creditcard.fill" size={isSmall ? 18 : 20} color="#1F2937" />
              <Text style={[styles.guestMenuItemText, { fontSize: isSmall ? FONT_SIZES.sm : FONT_SIZES.md }]}>Terms of Service</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.guestMenuItem, { paddingVertical: guestMenuItemPaddingV, gap: guestMenuItemGap }]}
              onPress={() => router.push('/legal/privacy-policy')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="shield.checkmark" size={isSmall ? 18 : 20} color="#1F2937" />
              <Text style={[styles.guestMenuItemText, { fontSize: isSmall ? FONT_SIZES.sm : FONT_SIZES.md }]}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.guestMenuItem, { paddingVertical: guestMenuItemPaddingV, gap: guestMenuItemGap }]}
              onPress={() => router.push('/settings/support')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="message.fill" size={isSmall ? 18 : 20} color="#1F2937" />
              <Text style={[styles.guestMenuItemText, { fontSize: isSmall ? FONT_SIZES.sm : FONT_SIZES.md }]}>Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.guestMenuItem, { paddingVertical: guestMenuItemPaddingV, gap: guestMenuItemGap }]}
              onPress={() => router.push('/settings/data-request')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="arrow.down" size={isSmall ? 18 : 20} color="#1F2937" />
              <Text style={[styles.guestMenuItemText, { fontSize: isSmall ? FONT_SIZES.sm : FONT_SIZES.md }]}>Data Request</Text>
            </TouchableOpacity>
          </View>

          {/* Follow us on Section */}
          <View style={[styles.guestSection, { marginBottom: guestSectionMarginBottom }]}>
            <Text style={[styles.guestSectionTitle, { fontSize: isSmall ? FONT_SIZES.md : FONT_SIZES.lg, marginBottom: guestSectionTitleMarginBottom }]}>Follow us on</Text>
            
            <TouchableOpacity
              style={[styles.guestMenuItem, { paddingVertical: guestMenuItemPaddingV, gap: guestMenuItemGap }]}
              onPress={() => {}}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="house.fill" size={isSmall ? 18 : 20} color="#1F2937" />
              <Text style={[styles.guestMenuItemText, { fontSize: isSmall ? FONT_SIZES.sm : FONT_SIZES.md }]}>www.AutoCart.ie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.guestMenuItem, { paddingVertical: guestMenuItemPaddingV, gap: guestMenuItemGap }]}
              onPress={() => {}}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={[styles.guestSocialIcon, styles.guestFacebookIcon, { width: isSmall ? 18 : 20, height: isSmall ? 18 : 20 }]}>
                <Text style={[styles.guestSocialIconText, { fontSize: isSmall ? 9 : 10 }]}>f</Text>
              </View>
              <Text style={[styles.guestMenuItemText, { fontSize: isSmall ? FONT_SIZES.sm : FONT_SIZES.md }]}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.guestMenuItem, { paddingVertical: guestMenuItemPaddingV, gap: guestMenuItemGap }]}
              onPress={() => {}}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={[styles.guestSocialIcon, styles.guestInstagramIcon, { width: isSmall ? 18 : 20, height: isSmall ? 18 : 20 }]}>
                <IconSymbol name="camera.fill" size={isSmall ? 12 : 14} color="#FFFFFF" />
              </View>
              <Text style={[styles.guestMenuItemText, { fontSize: isSmall ? FONT_SIZES.sm : FONT_SIZES.md }]}>Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.guestMenuItem, { paddingVertical: guestMenuItemPaddingV, gap: guestMenuItemGap }]}
              onPress={() => {}}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={[styles.guestSocialIcon, styles.guestTiktokIcon, { width: isSmall ? 18 : 20, height: isSmall ? 18 : 20 }]}>
                <Text style={[styles.guestSocialIconText, { fontSize: isSmall ? 9 : 10 }]}>T</Text>
              </View>
              <Text style={[styles.guestMenuItemText, { fontSize: isSmall ? FONT_SIZES.sm : FONT_SIZES.md }]}>TikTok</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Sidebar */}
        <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <StatusBar style="dark" />

      {/* Top Navigation Bar */}
      <View style={[styles.topNav, { paddingTop: topNavPaddingTop, paddingBottom: topNavPaddingBottom, paddingHorizontal: horizontalPadding }]}>
        <TouchableOpacity
          style={[styles.navButton, { width: navButtonSize, height: navButtonSize }]}
          onPress={() => setSidebarVisible(true)}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <MenuIcon width={isSmall ? 16 : 19} height={isSmall ? 14 : 17} color="#1F2937" />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { fontSize: navTitleFontSize }]}>My Account</Text>
        <TouchableOpacity
          style={[styles.navButton, { width: navButtonSize, height: navButtonSize }]}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="bell" size={navIconSize} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Header: Banner Image and Avatar */}
        <View style={[styles.headerContainer, { height: bannerHeight }]}>
          <View style={[styles.bannerContainer, { height: bannerHeight }]}>
            {profile?.profile_banner_url ? (
              <Image
                source={{ uri: profile.profile_banner_url }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.bannerPlaceholder}>
                <IconSymbol name="photo" size={isSmall ? 32 : 40} color="#9CA3AF" />
              </View>
            )}
            {profile?.account_type === 'trade' && (
              <View style={styles.tradeBadge}>
                <Text style={[styles.tradeBadgeText, { fontSize: isSmall ? 9 : 10 }]}>Trade Seller</Text>
              </View>
            )}
          </View>

          {/* Profile Picture - Overlapping banner */}
          <View style={[styles.profilePicContainer, { left: horizontalPadding, bottom: -(profilePicSize / 2) }]}>
            {profile?.business_logo_url ? (
              <Image
                source={{ uri: profile.business_logo_url }}
                style={[styles.profilePic, { width: profilePicSize, height: profilePicSize, borderRadius: profilePicSize / 2, borderWidth: profilePicBorderWidth }]}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.profilePicPlaceholder, { width: profilePicSize, height: profilePicSize, borderRadius: profilePicSize / 2, borderWidth: profilePicBorderWidth }]}>
                <IconSymbol name="person.fill" size={isSmall ? 24 : 30} color="#9CA3AF" />
              </View>
            )}
          </View>
        </View>

        {/* Body: User Info Below Avatar */}
        <View style={[styles.bodyContainer, { paddingTop: profilePicSize / 2 + (isSmall ? SPACING.sm : SPACING.base), paddingHorizontal: horizontalPadding }]}>
          {/* User Info Row */}
          <View style={styles.userInfoRow}>
            {/* Left side: Name and Location */}
            <View style={styles.nameLocationContainer}>
              <View style={styles.nameRow}>
                <View style={styles.nameContainer}>
                  <Text style={[styles.userName, { fontSize: userNameFontSize }]}>{getDisplayName()}</Text>
                  {profile?.verification_badge && (
                    <IconSymbol name="checkmark.seal.fill" size={isSmall ? 14 : 16} color="#4CAF50" />
                  )}
                </View>
              </View>

              {/* Location below name */}
              <View style={styles.locationRow}>
                <LocationIcon width={isSmall ? 14 : 16} height={isSmall ? 14 : 16} color="#6B7280" />
                <Text style={[styles.locationText, { fontSize: locationFontSize }]}>{getLocation()}</Text>
              </View>
            </View>

            {/* Right side: Edit Button */}
            <TouchableOpacity
              style={[styles.editButton, { paddingHorizontal: editButtonPaddingH, paddingVertical: editButtonPaddingV, minWidth: editButtonMinWidth }]}
              onPress={handleEditProfile}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="pencil" size={editButtonIconSize} color="#4CAF50" />
              <Text style={[styles.editButtonText, { fontSize: editButtonFontSize }]}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

        {/* Stats Section */}
        <View style={[styles.statsContainer, { marginHorizontal: -horizontalPadding, paddingHorizontal: horizontalPadding }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { fontSize: statNumberFontSize }]}>{stats.adsCount}</Text>
            <Text style={[styles.statLabel, { fontSize: statLabelFontSize }]}>Ads</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { fontSize: statNumberFontSize }]}>{stats.followersCount}</Text>
            <Text style={[styles.statLabel, { fontSize: statLabelFontSize }]}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { fontSize: statNumberFontSize }]}>{stats.followingCount}</Text>
            <Text style={[styles.statLabel, { fontSize: statLabelFontSize }]}>Following</Text>
          </View>
        </View>

        {/* Content Tabs */}
        <View style={[styles.tabsContainer, { marginHorizontal: -horizontalPadding, paddingLeft: horizontalPadding + (isSmall ? SPACING.sm : SPACING.md), paddingRight: horizontalPadding }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ads' && styles.tabActive, activeTab === 'ads' && { paddingVertical: tabPaddingV, paddingHorizontal: tabPaddingH }]}
            onPress={() => setActiveTab('ads')}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={[styles.tabText, { fontSize: tabFontSize }, activeTab === 'ads' && styles.tabTextActive]}>
              Ads
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.tabActive, activeTab === 'about' && { paddingVertical: tabPaddingV, paddingHorizontal: tabPaddingH }]}
            onPress={() => setActiveTab('about')}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={[styles.tabText, { fontSize: tabFontSize }, activeTab === 'about' && styles.tabTextActive]}>
              About
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        {activeTab === 'about' && (
          <View style={styles.contentArea}>
              {/* Details Section */}
              <View style={[styles.section, { padding: sectionPadding }]}>
                <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>Details</Text>
                
                {/* Address Field */}
                {editingField === 'address' ? (
                  <View style={styles.detailItem}>
                    <LocationIcon width={isSmall ? 14 : 16} height={isSmall ? 14 : 16} color="#374151" />
                    <TextInput
                      style={[styles.detailInput, { fontSize: detailInputFontSize }]}
                      placeholder="Enter address"
                      placeholderTextColor="#9CA3AF"
                      value={addressValue}
                      onChangeText={setAddressValue}
                      autoFocus
                    />
                    <TouchableOpacity
                      onPress={handleSaveAddress}
                      disabled={isSaving}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={[styles.saveButton, { fontSize: isSmall ? FONT_SIZES.sm : 14 }]}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.detailItem}
                    onPress={handleAddAddress}
                    {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                    <LocationIcon width={isSmall ? 14 : 16} height={isSmall ? 14 : 16} color="#374151" />
                    <Text style={[styles.detailText, { fontSize: detailTextFontSize }]}>
                      {profile?.business_address || 'Add Address'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Phone Field */}
                {editingField === 'phone' ? (
                  <View style={[styles.detailItem, styles.detailItemLast]}>
                    <IconSymbol name="phone" size={isSmall ? 14 : 16} color="#374151" />
                    <TextInput
                      style={[styles.detailInput, { fontSize: detailInputFontSize }]}
                      placeholder="Enter phone number"
                      placeholderTextColor="#9CA3AF"
                      value={phoneValue}
                      onChangeText={setPhoneValue}
                      keyboardType="phone-pad"
                      autoFocus
                    />
                    <TouchableOpacity
                      onPress={handleSavePhone}
                      disabled={isSaving}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={[styles.saveButton, { fontSize: isSmall ? FONT_SIZES.sm : 14 }]}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.detailItem, styles.detailItemLast]}
                    onPress={handleAddPhone}
                    {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                    <IconSymbol name="phone" size={isSmall ? 14 : 16} color="#374151" />
                    <Text style={[styles.detailText, { fontSize: detailTextFontSize }]}>
                      {profile?.phone_number || 'Phone No.'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Social Links Section */}
              <View style={[styles.section, { padding: sectionPadding }]}>
                <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>Social Links</Text>
                
                {/* Facebook */}
                <View style={styles.socialItem}>
                  <View style={styles.socialLeft}>
                    <View style={[styles.socialIcon, styles.facebookIcon, { width: socialIconSize, height: socialIconSize, borderRadius: socialIconSize / 2 }]}>
                      <Text style={[styles.socialIconText, { fontSize: isSmall ? 12 : 14 }]}>f</Text>
                    </View>
                    {editingSocial === 'facebook' ? (
                      <View style={styles.socialInputContainer}>
                        <IconSymbol name="link" size={isSmall ? 12 : 14} color="#9CA3AF" />
                        <TextInput
                          style={[styles.socialInput, { fontSize: detailInputFontSize }]}
                          placeholder="Enter user id or URL"
                          placeholderTextColor="#9CA3AF"
                          value={socialLinkValue}
                          onChangeText={setSocialLinkValue}
                          autoFocus
                          autoCapitalize="none"
                        />
                      </View>
                    ) : (
                      <View style={styles.socialTextContainer}>
                        <Text style={[styles.socialPlatformName, { fontSize: socialPlatformFontSize }]}>Facebook</Text>
                        <Text style={[styles.socialStatus, { fontSize: socialStatusFontSize }]}>
                          {isSocialConnected('facebook') ? getSocialLinkDisplay('facebook') : 'Not Connected'}
                        </Text>
                      </View>
                    )}
                  </View>
                  {editingSocial === 'facebook' ? (
                    <TouchableOpacity
                      onPress={() => handleSaveSocialLink('facebook')}
                      disabled={isSaving}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={[styles.linkButtonText, { fontSize: linkButtonFontSize }]}>Link</Text>
                    </TouchableOpacity>
                  ) : isSocialConnected('facebook') ? (
                    <TouchableOpacity
                      onPress={() => handleUnlinkSocial('facebook')}
                      disabled={isSaving}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={[styles.unlinkButtonText, { fontSize: linkButtonFontSize }]}>Unlink Account</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleLinkSocial('facebook')}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={[styles.linkButtonText, { fontSize: linkButtonFontSize }]}>Link Account</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Instagram */}
                <View style={styles.socialItem}>
                  <View style={styles.socialLeft}>
                    <View style={[styles.socialIcon, styles.instagramIcon, { width: socialIconSize, height: socialIconSize }]}>
                      <IconSymbol name="camera.fill" size={isSmall ? 12 : 14} color="#FFFFFF" />
                    </View>
                    {editingSocial === 'instagram' ? (
                      <View style={styles.socialInputContainer}>
                        <IconSymbol name="link" size={isSmall ? 12 : 14} color="#9CA3AF" />
                        <TextInput
                          style={[styles.socialInput, { fontSize: detailInputFontSize }]}
                          placeholder="Enter user id or URL"
                          placeholderTextColor="#9CA3AF"
                          value={socialLinkValue}
                          onChangeText={setSocialLinkValue}
                          autoFocus
                          autoCapitalize="none"
                        />
                      </View>
                    ) : (
                      <View style={styles.socialTextContainer}>
                        <Text style={[styles.socialPlatformName, { fontSize: socialPlatformFontSize }]}>Instagram</Text>
                        <Text style={[styles.socialStatus, { fontSize: socialStatusFontSize }]}>
                          {isSocialConnected('instagram') ? getSocialLinkDisplay('instagram') : 'Not Connected'}
                        </Text>
                      </View>
                    )}
                  </View>
                  {editingSocial === 'instagram' ? (
                    <TouchableOpacity
                      onPress={() => handleSaveSocialLink('instagram')}
                      disabled={isSaving}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={[styles.linkButtonText, { fontSize: linkButtonFontSize }]}>Link</Text>
                    </TouchableOpacity>
                  ) : isSocialConnected('instagram') ? (
                    <TouchableOpacity
                      onPress={() => handleUnlinkSocial('instagram')}
                      disabled={isSaving}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={[styles.unlinkButtonText, { fontSize: linkButtonFontSize }]}>Unlink Account</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleLinkSocial('instagram')}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={[styles.linkButtonText, { fontSize: linkButtonFontSize }]}>Link Account</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Twitter/X */}
                <View style={styles.socialItem}>
                  <View style={styles.socialLeft}>
                    <View style={[styles.socialIcon, styles.twitterIcon, { width: socialIconSize, height: socialIconSize }]}>
                      <Text style={[styles.socialIconText, styles.twitterIconText, { fontSize: isSmall ? 10 : 12 }]}>X</Text>
                    </View>
                    {editingSocial === 'twitter' ? (
                      <View style={styles.socialInputContainer}>
                        <IconSymbol name="link" size={isSmall ? 12 : 14} color="#9CA3AF" />
                        <TextInput
                          style={[styles.socialInput, { fontSize: detailInputFontSize }]}
                          placeholder="Enter user id or URL"
                          placeholderTextColor="#9CA3AF"
                          value={socialLinkValue}
                          onChangeText={setSocialLinkValue}
                          autoFocus
                          autoCapitalize="none"
                        />
                      </View>
                    ) : (
                      <View style={styles.socialTextContainer}>
                        <Text style={[styles.socialPlatformName, { fontSize: socialPlatformFontSize }]}>Twitter</Text>
                        <Text style={[styles.socialStatus, { fontSize: socialStatusFontSize }]}>
                          {isSocialConnected('twitter') ? getSocialLinkDisplay('twitter') : 'Not Connected'}
                        </Text>
                      </View>
                    )}
                  </View>
                  {editingSocial === 'twitter' ? (
                    <TouchableOpacity
                      onPress={() => handleSaveSocialLink('twitter')}
                      disabled={isSaving}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={[styles.linkButtonText, { fontSize: linkButtonFontSize }]}>Link</Text>
                    </TouchableOpacity>
                  ) : isSocialConnected('twitter') ? (
                    <TouchableOpacity
                      onPress={() => handleUnlinkSocial('twitter')}
                      disabled={isSaving}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={[styles.unlinkButtonText, { fontSize: linkButtonFontSize }]}>Unlink Account</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleLinkSocial('twitter')}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={[styles.linkButtonText, { fontSize: linkButtonFontSize }]}>Link Account</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* YouTube */}
                <View style={[styles.socialItem, styles.socialItemLast]}>
                  <View style={styles.socialLeft}>
                    <View style={[styles.socialIcon, styles.youtubeIcon, { width: socialIconSize, height: socialIconSize }]}>
                      <IconSymbol name="play.fill" size={isSmall ? 10 : 12} color="#FFFFFF" />
                    </View>
                    {editingSocial === 'youtube' ? (
                      <View style={styles.socialInputContainer}>
                        <IconSymbol name="link" size={isSmall ? 12 : 14} color="#9CA3AF" />
                        <TextInput
                          style={[styles.socialInput, { fontSize: detailInputFontSize }]}
                          placeholder="Enter user id or URL"
                          placeholderTextColor="#9CA3AF"
                          value={socialLinkValue}
                          onChangeText={setSocialLinkValue}
                          autoFocus
                          autoCapitalize="none"
                        />
                      </View>
                    ) : (
                      <View style={styles.socialTextContainer}>
                        <Text style={[styles.socialPlatformName, { fontSize: socialPlatformFontSize }]}>Youtube</Text>
                        <Text style={[styles.socialStatus, { fontSize: socialStatusFontSize }]}>
                          {isSocialConnected('youtube') ? getSocialLinkDisplay('youtube') : 'Not Connected'}
                        </Text>
                      </View>
                    )}
                  </View>
                  {editingSocial === 'youtube' ? (
                    <TouchableOpacity
                      onPress={() => handleSaveSocialLink('youtube')}
                      disabled={isSaving}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={[styles.linkButtonText, { fontSize: linkButtonFontSize }]}>Link</Text>
                    </TouchableOpacity>
                  ) : isSocialConnected('youtube') ? (
                    <TouchableOpacity
                      onPress={() => handleUnlinkSocial('youtube')}
                      disabled={isSaving}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={[styles.unlinkButtonText, { fontSize: linkButtonFontSize }]}>Unlink Account</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleLinkSocial('youtube')}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={[styles.linkButtonText, { fontSize: linkButtonFontSize }]}>Link Account</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

        {activeTab === 'ads' && (
          <View style={[styles.adsContentArea, { marginHorizontal: -horizontalPadding, paddingHorizontal: 0 }]}>
            {/* Filter Tabs */}
            <View style={[styles.adFilterTabs, { paddingLeft: horizontalPadding, paddingRight: horizontalPadding }]}>
              <TouchableOpacity
                style={[styles.adFilterTab, { paddingVertical: adFilterTabPaddingV, paddingHorizontal: adFilterTabPaddingH }, adFilter === 'active' && styles.adFilterTabActive]}
                onPress={() => setAdFilter('active')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={[styles.adFilterTabText, { fontSize: adFilterTabFontSize }, adFilter === 'active' && styles.adFilterTabTextActive]}>
                  Active ({getFilterCounts().active})
                </Text>
                {adFilter === 'active' && <View style={[styles.adFilterTabUnderline, { left: adFilterTabPaddingH, right: adFilterTabPaddingH }]} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.adFilterTab, { paddingVertical: adFilterTabPaddingV, paddingHorizontal: adFilterTabPaddingH }, adFilter === 'expired' && styles.adFilterTabActive]}
                onPress={() => setAdFilter('expired')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={[styles.adFilterTabText, { fontSize: adFilterTabFontSize }, adFilter === 'expired' && styles.adFilterTabTextActive]}>
                  Expired ({getFilterCounts().expired})
                </Text>
                {adFilter === 'expired' && <View style={[styles.adFilterTabUnderline, { left: adFilterTabPaddingH, right: adFilterTabPaddingH }]} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.adFilterTab, { paddingVertical: adFilterTabPaddingV, paddingHorizontal: adFilterTabPaddingH }, adFilter === 'pending' && styles.adFilterTabActive]}
                onPress={() => setAdFilter('pending')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={[styles.adFilterTabText, { fontSize: adFilterTabFontSize }, adFilter === 'pending' && styles.adFilterTabTextActive]}>
                  Pending ({getFilterCounts().pending})
                </Text>
                {adFilter === 'pending' && <View style={[styles.adFilterTabUnderline, { left: adFilterTabPaddingH, right: adFilterTabPaddingH }]} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.adFilterTab, { paddingVertical: adFilterTabPaddingV, paddingHorizontal: adFilterTabPaddingH }, adFilter === 'rejected' && styles.adFilterTabActive]}
                onPress={() => setAdFilter('rejected')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={[styles.adFilterTabText, { fontSize: adFilterTabFontSize }, adFilter === 'rejected' && styles.adFilterTabTextActive]}>
                  Rejected ({getFilterCounts().rejected})
                </Text>
                {adFilter === 'rejected' && <View style={[styles.adFilterTabUnderline, { left: adFilterTabPaddingH, right: adFilterTabPaddingH }]} />}
              </TouchableOpacity>
            </View>

            {/* Ads Grid */}
            {isLoadingAds ? (
              <View style={styles.adsLoadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
              </View>
            ) : getFilteredAds().length === 0 ? (
              <View style={styles.emptyAdsContainer}>
                <Text style={styles.emptyText}>No ads found</Text>
              </View>
            ) : (
              <View style={[styles.adsGridContainer, { paddingLeft: horizontalPadding, paddingRight: horizontalPadding }]}>
                <FlatList
                  data={getFilteredAds()}
                  numColumns={2}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.adsGrid}
                  columnWrapperStyle={[styles.adsGridRow, { gap: cardGap }]}
                  renderItem={({ item }) => <ProfileAdCard ad={item} />}
                  scrollEnabled={false}
                />
              </View>
            )}
          </View>
        )}
        </View>
      </ScrollView>

      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    // paddingTop, paddingBottom, paddingHorizontal set dynamically
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    // width and height set dynamically
  },
  navTitle: {
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 0,
    // height set dynamically
  },
  bannerContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    // height set dynamically
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tradeBadgeText: {
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  profilePicContainer: {
    position: 'absolute',
    zIndex: 10,
    // left and bottom set dynamically
  },
  profilePic: {
    borderColor: '#60A5FA',
    backgroundColor: '#F3F4F6',
    // width, height, borderRadius, borderWidth set dynamically
  },
  profilePicPlaceholder: {
    borderColor: '#60A5FA',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    // width, height, borderRadius, borderWidth set dynamically
  },
  bodyContainer: {
    flex: 1,
    // paddingTop and paddingHorizontal set dynamically
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingLeft: 12, // Small left padding to move name/location slightly to the right
    gap: 12,
  },
  nameLocationContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  userName: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    gap: 4,
    alignSelf: 'flex-end',
    // paddingHorizontal, paddingVertical, and minWidth set dynamically
  },
  editButtonText: {
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 10,
    borderBottomWidth: 3,
    borderColor: '#E5E7EB',
    // marginHorizontal and paddingHorizontal set dynamically
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  statNumber: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 2,
    // fontSize set dynamically
  },
  statLabel: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 10,
    alignItems: 'center',
    // marginHorizontal, paddingLeft, paddingRight set dynamically
  },
  tab: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    // paddingVertical and paddingHorizontal set dynamically for active tab
  },
  tabActive: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    // paddingVertical and paddingHorizontal set dynamically
  },
  tabText: {
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  contentArea: {
    paddingHorizontal: 0,
    paddingBottom: 8,
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // padding set dynamically
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 10,
    // fontSize set dynamically
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailItemLast: {
    borderBottomWidth: 0,
  },
  detailText: {
    fontWeight: '400',
    color: '#374151',
    textDecorationLine: 'underline',
    // fontSize set dynamically
  },
  detailInput: {
    flex: 1,
    fontWeight: '400',
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 4,
    paddingHorizontal: 0,
    marginRight: 12,
    // fontSize set dynamically
  },
  saveButton: {
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  socialItemLast: {
    borderBottomWidth: 0,
  },
  socialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  socialTextContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  socialPlatformName: {
    fontWeight: '400',
    color: '#374151',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  socialIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    // width and height set dynamically
  },
  facebookIcon: {
    backgroundColor: '#1877F2',
    borderRadius: 16,
  },
  instagramIcon: {
    backgroundColor: '#E4405F',
    borderRadius: 4,
  },
  twitterIcon: {
    backgroundColor: '#000000',
    borderRadius: 4,
  },
  youtubeIcon: {
    backgroundColor: '#FF0000',
    borderRadius: 4,
  },
  socialIconText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  twitterIconText: {
    // fontSize set dynamically
  },
  socialStatus: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  linkButtonText: {
    fontWeight: '400',
    color: '#374151',
    fontFamily: 'system-ui',
    textDecorationLine: 'underline',
    // fontSize set dynamically
  },
  unlinkButtonText: {
    fontWeight: '400',
    color: '#EF4444',
    fontFamily: 'system-ui',
    textDecorationLine: 'underline',
    // fontSize set dynamically
  },
  socialInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 4,
    marginLeft: 8,
  },
  socialInput: {
    flex: 1,
    fontWeight: '400',
    color: '#374151',
    paddingVertical: 0,
    paddingHorizontal: 0,
    // fontSize set dynamically
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    textAlign: 'center',
    paddingVertical: 40,
  },
  // Guest user styles
  guestScrollView: {
    flex: 1,
  },
  guestContentContainer: {
    // paddingTop, paddingBottom, paddingHorizontal set dynamically
  },
  guestMessageContainer: {
    alignItems: 'center',
    // marginBottom and paddingTop set dynamically
  },
  guestMessageTitle: {
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    textAlign: 'center',
    // fontSize and marginBottom set dynamically
  },
  guestMessageSubtitle: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    textAlign: 'center',
    // fontSize and marginBottom set dynamically
  },
  loginNowButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // height and maxWidth set dynamically
  },
  loginNowButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  guestSection: {
    // marginBottom set dynamically
  },
  guestSectionTitle: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    // fontSize and marginBottom set dynamically
  },
  guestMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    // paddingVertical and gap set dynamically
  },
  guestMenuItemText: {
    fontWeight: '400',
    color: '#1F2937',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  guestInfoIcon: {
    borderWidth: 1.5,
    borderColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    // width, height, borderRadius set dynamically
  },
  guestInfoIconText: {
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  guestSocialIcon: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    // width and height set dynamically
  },
  guestFacebookIcon: {
    backgroundColor: '#1877F2',
  },
  guestInstagramIcon: {
    backgroundColor: '#E4405F',
  },
  guestTiktokIcon: {
    backgroundColor: '#000000',
  },
  guestSocialIconText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  // Ad Filter Tabs
  adsContentArea: {
    paddingBottom: 8,
    flex: 1,
    // marginHorizontal and paddingHorizontal set dynamically
  },
  adFilterTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    // paddingLeft and paddingRight set dynamically
  },
  adFilterTab: {
    marginRight: 16,
    position: 'relative',
    // paddingVertical and paddingHorizontal set dynamically
  },
  adFilterTabActive: {
    // Active state handled by text color
  },
  adFilterTabText: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Source Sans Pro',
    // fontSize set dynamically
  },
  adFilterTabTextActive: {
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'Source Sans Pro',
    // fontSize set dynamically
  },
  adFilterTabUnderline: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: '#4CAF50',
    // left and right set dynamically
  },
  // Profile Ad Card
  profileAdCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  profileAdImageContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#F3F4F6',
    // height set dynamically
  },
  profileAdImage: {
    width: '100%',
    height: '100%',
  },
  profileAdImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  spotlightBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    zIndex: 2,
  },
  spotlightText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Source Sans Pro',
    letterSpacing: 0.5,
    // fontSize set dynamically
  },
  profileAdEditButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    // width, height, borderRadius set dynamically
  },
  profileAdImageCount: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
    zIndex: 2,
  },
  profileAdImageCountText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Source Sans Pro',
    // fontSize set dynamically
  },
  profileAdDots: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    zIndex: 2,
  },
  profileAdDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    // width, height, borderRadius set dynamically
  },
  profileAdDotActive: {
    backgroundColor: '#FFFFFF',
  },
  profileAdDetails: {
    // padding set dynamically
  },
  profileAdTitle: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Source Sans Pro',
    marginBottom: 6,
    // fontSize set dynamically
  },
  profileAdLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  profileAdLocationText: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Source Sans Pro',
    flex: 1,
    // fontSize set dynamically
  },
  profileAdMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  profileAdMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileAdMetricText: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Source Sans Pro',
    // fontSize set dynamically
  },
  profileAdPrice: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  profileAdPriceText: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Source Sans Pro',
    lineHeight: 24,
    letterSpacing: 0,
    // fontSize set dynamically
  },
  profileAdMonthlyPayment: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Source Sans Pro',
    // fontSize set dynamically
  },
  adsGridContainer: {
    // paddingLeft and paddingRight set dynamically
  },
  adsGrid: {
    paddingBottom: 20,
  },
  adsGridRow: {
    justifyContent: 'space-between',
    // gap set dynamically
  },
  adsLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyAdsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});
