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
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');


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
          console.error('[Profile] Load error:', profileError);
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
      console.error('[Profile] Load exception:', error);
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
        console.error('[Profile] Error loading ads:', error);
        setUserAds([]);
      } else {
        setUserAds(ads || []);
      }
    } catch (error) {
      console.error('[Profile] Exception loading ads:', error);
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
        console.error('[Profile] Save address error:', error);
        return;
      }

      if (updatedProfile) {
        setProfile(updatedProfile);
        setEditingField(null);
        setAddressValue('');
      }
    } catch (error) {
      console.error('[Profile] Save address exception:', error);
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
        console.error('[Profile] Save phone error:', error);
        return;
      }

      if (updatedProfile) {
        setProfile(updatedProfile);
        setEditingField(null);
        setPhoneValue('');
      }
    } catch (error) {
      console.error('[Profile] Save phone exception:', error);
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
        console.error('[Profile] Save social link error:', error);
        return;
      }

      if (updatedProfile) {
        setProfile(updatedProfile);
        setEditingSocial(null);
        setSocialLinkValue('');
      }
    } catch (error) {
      console.error('[Profile] Save social link exception:', error);
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
        console.error('[Profile] Unlink social error:', error);
        return;
      }

      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('[Profile] Unlink social exception:', error);
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
    const cardWidth = (SCREEN_WIDTH - 48) / 2; // 16px padding on each side + 16px gap

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
        <View style={styles.profileAdImageContainer}>
          {mainImage ? (
            <Image
              source={{ uri: mainImage }}
              style={styles.profileAdImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profileAdImagePlaceholder}>
              <IconSymbol name="photo" size={40} color="#9CA3AF" />
            </View>
          )}

          {/* SPOTLIGHT Badge */}
          <View style={styles.spotlightBadge}>
            <IconSymbol name="flame.fill" size={12} color="#FCD34D" />
            <Text style={styles.spotlightText}>SPOTLIGHT</Text>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.profileAdEditButton}
            onPress={(e) => {
              e.stopPropagation();
              handleEditAd();
            }}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <IconSymbol name="pencil" size={14} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Image Count Indicator */}
          {remainingImages > 0 && (
            <View style={styles.profileAdImageCount}>
              <ImageCountIcon size={12} color="#FFFFFF" />
              <Text style={styles.profileAdImageCountText}>+{remainingImages}</Text>
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
                    index === 0 && styles.profileAdDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Ad Details */}
        <View style={styles.profileAdDetails}>
          <Text style={styles.profileAdTitle} numberOfLines={1}>
            {ad.item_name}
          </Text>

          {/* Location */}
          {ad.location && (
            <View style={styles.profileAdLocation}>
              <LocationIcon width={12} height={12} />
              <Text style={styles.profileAdLocationText} numberOfLines={1}>
                {ad.location}
              </Text>
            </View>
          )}

          {/* Engagement Metrics */}
          <View style={styles.profileAdMetrics}>
            <View style={styles.profileAdMetric}>
              <ViewerIcon width={12} height={9} />
              <Text style={styles.profileAdMetricText}>
                {formatNumber(ad.views_count || 0)}
              </Text>
            </View>
            <View style={styles.profileAdMetric}>
              <LoveIcon width={11} height={10} />
              <Text style={styles.profileAdMetricText}>
                {formatNumber(0)} {/* Likes not in DB yet */}
              </Text>
            </View>
            <View style={styles.profileAdMetric}>
              <ShareIcon width={10} height={10} />
              <Text style={styles.profileAdMetricText}>
                {formatNumber(0)} {/* Shares not in DB yet */}
              </Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.profileAdPrice}>
            <Text style={styles.profileAdPriceText}>
              {ad.currency} {ad.amount ? parseInt(ad.amount.toString()).toLocaleString() : '0'}
            </Text>
            <Text style={styles.profileAdMonthlyPayment}>
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
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setSidebarVisible(true)}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <MenuIcon width={19} height={17} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>My Account</Text>
          <TouchableOpacity
            style={styles.navButton}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <IconSymbol name="bell" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.guestScrollView} contentContainerStyle={styles.guestContentContainer}>
          {/* Guest Message */}
          <View style={styles.guestMessageContainer}>
            <Text style={styles.guestMessageTitle}>You are currently viewing as a guest</Text>
            <Text style={styles.guestMessageSubtitle}>Log in or create an account to unlock full features.</Text>
            <TouchableOpacity
              style={styles.loginNowButton}
              onPress={() => router.push('/auth/signin')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Text style={styles.loginNowButtonText}>Log in Now</Text>
            </TouchableOpacity>
          </View>

          {/* Settings Section */}
          <View style={styles.guestSection}>
            <Text style={styles.guestSectionTitle}>Settings</Text>
            
            <TouchableOpacity
              style={styles.guestMenuItem}
              onPress={() => router.push('/settings/about')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={styles.guestInfoIcon}>
                <Text style={styles.guestInfoIconText}>i</Text>
              </View>
              <Text style={styles.guestMenuItemText}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestMenuItem}
              onPress={() => router.push('/legal/terms-of-service')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="creditcard.fill" size={20} color="#1F2937" />
              <Text style={styles.guestMenuItemText}>Terms of Service</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestMenuItem}
              onPress={() => router.push('/legal/privacy-policy')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="shield.checkmark" size={20} color="#1F2937" />
              <Text style={styles.guestMenuItemText}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestMenuItem}
              onPress={() => router.push('/settings/support')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="message.fill" size={20} color="#1F2937" />
              <Text style={styles.guestMenuItemText}>Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestMenuItem}
              onPress={() => router.push('/settings/data-request')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="arrow.down" size={20} color="#1F2937" />
              <Text style={styles.guestMenuItemText}>Data Request</Text>
            </TouchableOpacity>
          </View>

          {/* Follow us on Section */}
          <View style={styles.guestSection}>
            <Text style={styles.guestSectionTitle}>Follow us on</Text>
            
            <TouchableOpacity
              style={styles.guestMenuItem}
              onPress={() => {}}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="house.fill" size={20} color="#1F2937" />
              <Text style={styles.guestMenuItemText}>www.AutoCart.ie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestMenuItem}
              onPress={() => {}}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={[styles.guestSocialIcon, styles.guestFacebookIcon]}>
                <Text style={styles.guestSocialIconText}>f</Text>
              </View>
              <Text style={styles.guestMenuItemText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestMenuItem}
              onPress={() => {}}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={[styles.guestSocialIcon, styles.guestInstagramIcon]}>
                <IconSymbol name="camera.fill" size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.guestMenuItemText}>Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestMenuItem}
              onPress={() => {}}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={[styles.guestSocialIcon, styles.guestTiktokIcon]}>
                <Text style={styles.guestSocialIconText}>T</Text>
              </View>
              <Text style={styles.guestMenuItemText}>TikTok</Text>
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
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setSidebarVisible(true)}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <MenuIcon width={19} height={17} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Account</Text>
        <TouchableOpacity
          style={styles.navButton}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="bell" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Header: Banner Image and Avatar */}
        <View style={styles.headerContainer}>
          <View style={styles.bannerContainer}>
            {profile?.profile_banner_url ? (
              <Image
                source={{ uri: profile.profile_banner_url }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.bannerPlaceholder}>
                <IconSymbol name="photo" size={40} color="#9CA3AF" />
              </View>
            )}
            {profile?.account_type === 'trade' && (
              <View style={styles.tradeBadge}>
                <Text style={styles.tradeBadgeText}>Trade Seller</Text>
              </View>
            )}
          </View>

          {/* Profile Picture - Overlapping banner */}
          <View style={styles.profilePicContainer}>
            {profile?.business_logo_url ? (
              <Image
                source={{ uri: profile.business_logo_url }}
                style={styles.profilePic}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profilePicPlaceholder}>
                <IconSymbol name="person.fill" size={30} color="#9CA3AF" />
              </View>
            )}
          </View>
        </View>

        {/* Body: User Info Below Avatar */}
        <View style={styles.bodyContainer}>
          {/* User Info Row */}
          <View style={styles.userInfoRow}>
            {/* Left side: Name and Location */}
            <View style={styles.nameLocationContainer}>
              <View style={styles.nameRow}>
                <View style={styles.nameContainer}>
                  <Text style={styles.userName}>{getDisplayName()}</Text>
                  {profile?.verification_badge && (
                    <IconSymbol name="checkmark.seal.fill" size={16} color="#4CAF50" />
                  )}
                </View>
              </View>

              {/* Location below name */}
              <View style={styles.locationRow}>
                <LocationIcon width={16} height={16} color="#6B7280" />
                <Text style={styles.locationText}>{getLocation()}</Text>
              </View>
            </View>

            {/* Right side: Edit Button */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="pencil" size={16} color="#4CAF50" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.adsCount}</Text>
            <Text style={styles.statLabel}>Ads</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ads' && styles.tabActive]}
            onPress={() => setActiveTab('ads')}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={[styles.tabText, activeTab === 'ads' && styles.tabTextActive]}>
              Ads
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.tabActive]}
            onPress={() => setActiveTab('about')}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>
              About
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        {activeTab === 'about' && (
          <View style={styles.contentArea}>
              {/* Details Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Details</Text>
                
                {/* Address Field */}
                {editingField === 'address' ? (
                  <View style={styles.detailItem}>
                    <LocationIcon width={16} height={16} color="#374151" />
                    <TextInput
                      style={styles.detailInput}
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
                      <Text style={styles.saveButton}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.detailItem}
                    onPress={handleAddAddress}
                    {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                    <LocationIcon width={16} height={16} color="#374151" />
                    <Text style={styles.detailText}>
                      {profile?.business_address || 'Add Address'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Phone Field */}
                {editingField === 'phone' ? (
                  <View style={[styles.detailItem, styles.detailItemLast]}>
                    <IconSymbol name="phone" size={16} color="#374151" />
                    <TextInput
                      style={styles.detailInput}
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
                      <Text style={styles.saveButton}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.detailItem, styles.detailItemLast]}
                    onPress={handleAddPhone}
                    {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                    <IconSymbol name="phone" size={16} color="#374151" />
                    <Text style={styles.detailText}>
                      {profile?.phone_number || 'Phone No.'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Social Links Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Social Links</Text>
                
                {/* Facebook */}
                <View style={styles.socialItem}>
                  <View style={styles.socialLeft}>
                    <View style={[styles.socialIcon, styles.facebookIcon]}>
                      <Text style={styles.socialIconText}>f</Text>
                    </View>
                    {editingSocial === 'facebook' ? (
                      <View style={styles.socialInputContainer}>
                        <IconSymbol name="link" size={14} color="#9CA3AF" />
                        <TextInput
                          style={styles.socialInput}
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
                        <Text style={styles.socialPlatformName}>Facebook</Text>
                        <Text style={styles.socialStatus}>
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
                      <Text style={styles.linkButtonText}>Link</Text>
                    </TouchableOpacity>
                  ) : isSocialConnected('facebook') ? (
                    <TouchableOpacity
                      onPress={() => handleUnlinkSocial('facebook')}
                      disabled={isSaving}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={styles.unlinkButtonText}>Unlink Account</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleLinkSocial('facebook')}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={styles.linkButtonText}>Link Account</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Instagram */}
                <View style={styles.socialItem}>
                  <View style={styles.socialLeft}>
                    <View style={[styles.socialIcon, styles.instagramIcon]}>
                      <IconSymbol name="camera.fill" size={14} color="#FFFFFF" />
                    </View>
                    {editingSocial === 'instagram' ? (
                      <View style={styles.socialInputContainer}>
                        <IconSymbol name="link" size={14} color="#9CA3AF" />
                        <TextInput
                          style={styles.socialInput}
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
                        <Text style={styles.socialPlatformName}>Instagram</Text>
                        <Text style={styles.socialStatus}>
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
                      <Text style={styles.linkButtonText}>Link</Text>
                    </TouchableOpacity>
                  ) : isSocialConnected('instagram') ? (
                    <TouchableOpacity
                      onPress={() => handleUnlinkSocial('instagram')}
                      disabled={isSaving}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={styles.unlinkButtonText}>Unlink Account</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleLinkSocial('instagram')}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={styles.linkButtonText}>Link Account</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Twitter/X */}
                <View style={styles.socialItem}>
                  <View style={styles.socialLeft}>
                    <View style={[styles.socialIcon, styles.twitterIcon]}>
                      <Text style={[styles.socialIconText, styles.twitterIconText]}>X</Text>
                    </View>
                    {editingSocial === 'twitter' ? (
                      <View style={styles.socialInputContainer}>
                        <IconSymbol name="link" size={14} color="#9CA3AF" />
                        <TextInput
                          style={styles.socialInput}
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
                        <Text style={styles.socialPlatformName}>Twitter</Text>
                        <Text style={styles.socialStatus}>
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
                      <Text style={styles.linkButtonText}>Link</Text>
                    </TouchableOpacity>
                  ) : isSocialConnected('twitter') ? (
                    <TouchableOpacity
                      onPress={() => handleUnlinkSocial('twitter')}
                      disabled={isSaving}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={styles.unlinkButtonText}>Unlink Account</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleLinkSocial('twitter')}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={styles.linkButtonText}>Link Account</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* YouTube */}
                <View style={[styles.socialItem, styles.socialItemLast]}>
                  <View style={styles.socialLeft}>
                    <View style={[styles.socialIcon, styles.youtubeIcon]}>
                      <IconSymbol name="play.fill" size={12} color="#FFFFFF" />
                    </View>
                    {editingSocial === 'youtube' ? (
                      <View style={styles.socialInputContainer}>
                        <IconSymbol name="link" size={14} color="#9CA3AF" />
                        <TextInput
                          style={styles.socialInput}
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
                        <Text style={styles.socialPlatformName}>Youtube</Text>
                        <Text style={styles.socialStatus}>
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
                      <Text style={styles.linkButtonText}>Link</Text>
                    </TouchableOpacity>
                  ) : isSocialConnected('youtube') ? (
                    <TouchableOpacity
                      onPress={() => handleUnlinkSocial('youtube')}
                      disabled={isSaving}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={styles.unlinkButtonText}>Unlink Account</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleLinkSocial('youtube')}
                      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                      <Text style={styles.linkButtonText}>Link Account</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

        {activeTab === 'ads' && (
          <View style={styles.adsContentArea}>
            {/* Filter Tabs */}
            <View style={styles.adFilterTabs}>
              <TouchableOpacity
                style={[styles.adFilterTab, adFilter === 'active' && styles.adFilterTabActive]}
                onPress={() => setAdFilter('active')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={[styles.adFilterTabText, adFilter === 'active' && styles.adFilterTabTextActive]}>
                  Active ({getFilterCounts().active})
                </Text>
                {adFilter === 'active' && <View style={styles.adFilterTabUnderline} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.adFilterTab, adFilter === 'expired' && styles.adFilterTabActive]}
                onPress={() => setAdFilter('expired')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={[styles.adFilterTabText, adFilter === 'expired' && styles.adFilterTabTextActive]}>
                  Expired ({getFilterCounts().expired})
                </Text>
                {adFilter === 'expired' && <View style={styles.adFilterTabUnderline} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.adFilterTab, adFilter === 'pending' && styles.adFilterTabActive]}
                onPress={() => setAdFilter('pending')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={[styles.adFilterTabText, adFilter === 'pending' && styles.adFilterTabTextActive]}>
                  Pending ({getFilterCounts().pending})
                </Text>
                {adFilter === 'pending' && <View style={styles.adFilterTabUnderline} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.adFilterTab, adFilter === 'rejected' && styles.adFilterTabActive]}
                onPress={() => setAdFilter('rejected')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={[styles.adFilterTabText, adFilter === 'rejected' && styles.adFilterTabTextActive]}>
                  Rejected ({getFilterCounts().rejected})
                </Text>
                {adFilter === 'rejected' && <View style={styles.adFilterTabUnderline} />}
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
              <View style={styles.adsGridContainer}>
                <FlatList
                  data={getFilteredAds()}
                  numColumns={2}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.adsGrid}
                  columnWrapperStyle={styles.adsGridRow}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
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
    height: 180,
    marginBottom: 0,
  },
  bannerContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
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
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'system-ui',
  },
  profilePicContainer: {
    position: 'absolute',
    left: 16,
    bottom: -30,
    zIndex: 10,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#60A5FA',
    backgroundColor: '#F3F4F6',
  },
  profilePicPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#60A5FA',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyContainer: {
    paddingTop: 40,
    paddingHorizontal: 16,
    flex: 1,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'stretch',
    minWidth: 160,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 10,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderColor: '#E5E7EB',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 10,
    marginHorizontal: -16,
    paddingLeft: 24,
    paddingRight: 16,
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'system-ui',
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
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 10,
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
    fontSize: 12,
    fontWeight: '400',
    color: '#374151',
    textDecorationLine: 'underline',
  },
  detailInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 4,
    paddingHorizontal: 0,
    marginRight: 12,
  },
  saveButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
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
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    fontFamily: 'system-ui',
  },
  socialIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  twitterIconText: {
    fontSize: 12,
  },
  socialStatus: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#374151',
    fontFamily: 'system-ui',
    textDecorationLine: 'underline',
  },
  unlinkButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#EF4444',
    fontFamily: 'system-ui',
    textDecorationLine: 'underline',
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
    fontSize: 12,
    fontWeight: '400',
    color: '#374151',
    paddingVertical: 0,
    paddingHorizontal: 0,
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  guestMessageContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  guestMessageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 8,
    textAlign: 'center',
  },
  guestMessageSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    marginBottom: 24,
    textAlign: 'center',
  },
  loginNowButton: {
    width: '100%',
    maxWidth: 300,
    height: 48,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginNowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  guestSection: {
    marginBottom: 32,
  },
  guestSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 16,
  },
  guestMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  guestMenuItemText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1F2937',
    fontFamily: 'system-ui',
  },
  guestInfoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestInfoIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'system-ui',
  },
  guestSocialIcon: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  // Ad Filter Tabs
  adsContentArea: {
    marginHorizontal: -16,
    paddingHorizontal: 0,
    paddingBottom: 8,
    flex: 1,
  },
  adFilterTabs: {
    flexDirection: 'row',
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  adFilterTab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 16,
    position: 'relative',
  },
  adFilterTabActive: {
    // Active state handled by text color
  },
  adFilterTabText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Source Sans Pro',
  },
  adFilterTabTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'Source Sans Pro',
  },
  adFilterTabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: '#4CAF50',
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
    height: 180,
    position: 'relative',
    backgroundColor: '#F3F4F6',
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
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Source Sans Pro',
    letterSpacing: 0.5,
  },
  profileAdEditButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
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
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Source Sans Pro',
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  profileAdDotActive: {
    backgroundColor: '#FFFFFF',
  },
  profileAdDetails: {
    padding: 12,
  },
  profileAdTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Source Sans Pro',
    marginBottom: 6,
  },
  profileAdLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  profileAdLocationText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Source Sans Pro',
    flex: 1,
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
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Source Sans Pro',
  },
  profileAdPrice: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  profileAdPriceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Source Sans Pro',
    lineHeight: 24,
    letterSpacing: 0,
  },
  profileAdMonthlyPayment: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Source Sans Pro',
  },
  adsGridContainer: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  adsGrid: {
    paddingBottom: 20,
  },
  adsGridRow: {
    justifyContent: 'space-between',
    gap: 16,
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
