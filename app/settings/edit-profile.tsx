import { ImageEditor } from '@/components/ImageEditor';
import { ImagePickerModal } from '@/components/place-ad/ImagePickerModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { profileService } from '@/services/profile';
import { storageService } from '@/services/storage';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import type { Profile } from '@/types/database';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

/**
 * Edit Profile Screen
 * 
 * Allows users to edit their profile information including:
 * - Business name, address, contact person
 * - Phone number
 * - Business logo upload
 * - Social media links
 */
export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSmall, width: screenWidth } = useResponsive();
  const { user, setProfile } = useAuthStore();
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate responsive values
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.base;
  // Add extra padding on top of safe area insets for better spacing from status bar
  const headerPaddingTop = insets.top + (isSmall ? SPACING.md : SPACING.base);
  const headerPaddingBottom = isSmall ? SPACING.sm : SPACING.base;
  const backButtonSize = isSmall ? 36 : 40;
  const backIconSize = isSmall ? 20 : 24;
  const headerTitleFontSize = isSmall ? FONT_SIZES.md : 18;
  const scrollPaddingTop = 0; // No top padding since banner starts at top
  const scrollPaddingBottom = isSmall ? SPACING.xl : 32;
  const sectionTitleFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const bannerHeight = isSmall ? 180 : 220;
  const logoSize = isSmall ? 100 : 120;
  const logoBorderWidth = isSmall ? 4 : 5;
  const cameraIconSize = isSmall ? 20 : 24;
  const inputLabelFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const inputFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const inputHeight = isSmall ? 44 : 48;
  const saveButtonHeight = isSmall ? 48 : 52;
  const saveButtonFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const reviewMessageFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;

  // Form fields
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [dealerLicense, setDealerLicense] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');

  // Logo upload
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);

  // Banner upload
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [isPickingBanner, setIsPickingBanner] = useState(false);
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const [tempBannerUri, setTempBannerUri] = useState<string | null>(null);
  const [showBannerEditor, setShowBannerEditor] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) {
      setIsLoading(false);
      Alert.alert('Error', 'User not found. Please sign in again.');
      router.back();
      return;
    }

    try {
      setIsLoading(true);
      
      // Try to use profile from auth store first (faster, avoids network call)
      if (user.profile) {
        setProfileState(user.profile);
        setBusinessName(user.profile.business_name || '');
        setBusinessAddress(user.profile.business_address || '');
        setContactPersonName(user.profile.contact_person_name || '');
        setPhoneNumber(user.profile.phone_number || '');
        setVatNumber(user.profile.vat_number || '');
        setDealerLicense(user.profile.dealer_license || '');
        setInstagramLink(user.profile.instagram_link || '');
        setFacebookLink(user.profile.facebook_link || '');
        setWebsiteLink(user.profile.website_link || '');
        setLogoUri(user.profile.business_logo_url || null);
        setBannerUri(user.profile.profile_banner_url || null);
        setIsLoading(false);
        
        // Still fetch latest from server in background to ensure we have the most up-to-date data
        profileService.getCurrentProfile().then(({ profile: profileData, error }) => {
          if (!error && profileData) {
            setProfileState(profileData);
            setBusinessName(profileData.business_name || '');
            setBusinessAddress(profileData.business_address || '');
            setContactPersonName(profileData.contact_person_name || '');
            setPhoneNumber(profileData.phone_number || '');
            setVatNumber(profileData.vat_number || '');
            setDealerLicense(profileData.dealer_license || '');
            setInstagramLink(profileData.instagram_link || '');
            setFacebookLink(profileData.facebook_link || '');
            setWebsiteLink(profileData.website_link || '');
            setLogoUri(profileData.business_logo_url || null);
            setBannerUri(profileData.profile_banner_url || null);
          }
        }).catch((err) => {
          // Silently fail background update - we already have data from auth store
        });
        return;
      }
      
      // If no profile in auth store, fetch from server
      const { profile: profileData, error } = await profileService.getCurrentProfile();
      
      if (error) {
        Alert.alert(
          'Error', 
          error.includes('Not authenticated') 
            ? 'Please sign in again to edit your profile.'
            : 'Failed to load profile. Please check your connection and try again.'
        );
        router.back();
        return;
      }

      if (profileData) {
        setProfileState(profileData);
        setBusinessName(profileData.business_name || '');
        setBusinessAddress(profileData.business_address || '');
        setContactPersonName(profileData.contact_person_name || '');
        setPhoneNumber(profileData.phone_number || '');
        setVatNumber(profileData.vat_number || '');
        setDealerLicense(profileData.dealer_license || '');
        setInstagramLink(profileData.instagram_link || '');
        setFacebookLink(profileData.facebook_link || '');
        setWebsiteLink(profileData.website_link || '');
        setLogoUri(profileData.business_logo_url || null);
        setBannerUri(profileData.profile_banner_url || null);
      } else {
        // No profile data returned - might be a new user
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      Alert.alert(
        'Error', 
        errorMessage.includes('network') || errorMessage.includes('fetch')
          ? 'Network error. Please check your connection and try again.'
          : 'Failed to load profile. Please try again.'
      );
      // Don't navigate back immediately - let user try again
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take a photo.',
          [{ text: 'OK' }]
        );
        setIsPicking(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        openImageEditor(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Camera Error', 'Unable to open camera. Please try again.');
    } finally {
      setIsPicking(false);
    }
  };

  const pickFromPhotoLibrary = async () => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const statusString = status as string;
      if (statusString !== 'granted' && statusString !== 'limited') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library.',
          [{ text: 'OK' }]
        );
        setIsPicking(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        openImageEditor(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Error', 'Unable to open photo library. Please try again.');
    } finally {
      setIsPicking(false);
    }
  };

  const pickFromFiles = async () => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'public.image'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets?.[0]) {
        openImageEditor(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Error', 'Unable to open file picker. Please try again.');
    } finally {
      setIsPicking(false);
    }
  };

  const openImageEditor = (uri: string) => {
    setTempImageUri(uri);
    setShowImageEditor(true);
  };

  const openBannerEditor = (uri: string) => {
    setTempBannerUri(uri);
    setShowBannerEditor(true);
  };

  const handleImageEditorSave = (uri: string) => {
    setLogoUri(uri);
    setShowImageEditor(false);
    setTempImageUri(null);
  };

  const handleBannerEditorSave = (uri: string) => {
    setBannerUri(uri);
    setShowBannerEditor(false);
    setTempBannerUri(null);
  };

  const handleImageEditorCancel = () => {
    setShowImageEditor(false);
    setTempImageUri(null);
  };

  const handleBannerEditorCancel = () => {
    setShowBannerEditor(false);
    setTempBannerUri(null);
  };

  const handlePickLogo = () => {
    if (isPicking) return;
    setShowImagePicker(true);
  };

  const handlePickBanner = () => {
    if (isPickingBanner) return;
    setShowBannerPicker(true);
  };

  const takeBannerPhoto = async () => {
    if (isPickingBanner) return;
    setIsPickingBanner(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your camera.', [{ text: 'OK' }]);
        setIsPickingBanner(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        openBannerEditor(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Camera Error', 'Unable to open camera. Please try again.');
    } finally {
      setIsPickingBanner(false);
    }
  };

  const pickBannerFromPhotoLibrary = async () => {
    if (isPickingBanner) return;
    setIsPickingBanner(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const statusString = status as string;
      if (statusString !== 'granted' && statusString !== 'limited') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.', [{ text: 'OK' }]);
        setIsPickingBanner(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        openBannerEditor(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Error', 'Unable to open photo library. Please try again.');
    } finally {
      setIsPickingBanner(false);
    }
  };

  const pickBannerFromFiles = async () => {
    if (isPickingBanner) return;
    setIsPickingBanner(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'public.image'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets?.[0]) {
        openBannerEditor(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Error', 'Unable to open file picker. Please try again.');
    } finally {
      setIsPickingBanner(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (profile?.account_type === 'trade') {
      if (!businessName.trim()) {
        newErrors.businessName = 'Business name is required';
      }
      if (!contactPersonName.trim()) {
        newErrors.contactPersonName = 'Contact person name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Get current user from Supabase auth directly (more reliable than store)
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser?.id) {
        Alert.alert('Error', 'Authentication required. Please sign in again.');
        setIsSaving(false);
        return;
      }

      const userId = authUser.id;
      let logoUrl = profile?.business_logo_url || null;
      let bannerUrl = profile?.profile_banner_url || null;

      // Upload logo if a new one was selected
      if (logoUri && logoUri !== profile?.business_logo_url) {
        const uploadResult = await storageService.uploadBusinessLogo(logoUri, userId);
        if (uploadResult.error) {
          Alert.alert('Upload Error', uploadResult.error);
          setIsSaving(false);
          return;
        }
        if (uploadResult.url) {
          logoUrl = uploadResult.url;
        }
      } else if (!logoUri && profile?.business_logo_url) {
        // Logo was removed
        logoUrl = null;
      }

      // Upload banner if a new one was selected
      if (bannerUri && bannerUri !== profile?.profile_banner_url) {
        const uploadResult = await storageService.uploadProfileBanner(bannerUri, userId);
        if (uploadResult.error) {
          Alert.alert('Upload Error', uploadResult.error);
          setIsSaving(false);
          return;
        }
        if (uploadResult.url) {
          bannerUrl = uploadResult.url;
        }
      } else if (!bannerUri && profile?.profile_banner_url) {
        // Banner was removed
        bannerUrl = null;
      }

      // Prepare update data
      const updates: any = {
        business_name: businessName.trim() || null,
        business_address: businessAddress.trim() || null,
        contact_person_name: contactPersonName.trim() || null,
        phone_number: phoneNumber.trim() || null,
        vat_number: vatNumber.trim() || null,
        dealer_license: dealerLicense.trim() || null,
        instagram_link: instagramLink.trim() || null,
        facebook_link: facebookLink.trim() || null,
        website_link: websiteLink.trim() || null,
        business_logo_url: logoUrl,
        profile_banner_url: bannerUrl,
      };

      // Update profile - pass userId directly to avoid extra auth call
      const { profile: updatedProfile, error } = await profileService.updateCurrentProfile(
        updates,
        userId
      );

      if (error) {
        Alert.alert('Error', error);
        setIsSaving(false);
        return;
      }

      if (updatedProfile) {
        // Update auth store
        setProfile(updatedProfile);
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: headerPaddingTop, paddingBottom: headerPaddingBottom, paddingHorizontal: horizontalPadding }]}>
        <TouchableOpacity
          style={[styles.backButton, { width: backButtonSize, height: backButtonSize }]}
          onPress={() => router.back()}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={backIconSize} color="#000000" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.headerButton, { width: backButtonSize, height: backButtonSize }]}
          onPress={handlePickLogo}
          disabled={isPicking}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="camera.fill" size={backIconSize} color="#000000" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Header: Banner Image and Logo */}
          <View style={[styles.headerContainer, { height: bannerHeight }]}>
            <View style={[styles.bannerContainer, { height: bannerHeight }]}>
              {bannerUri ? (
                <Image
                  source={{ uri: bannerUri }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.bannerPlaceholder}>
                  <IconSymbol name="photo" size={isSmall ? 32 : 40} color="#9CA3AF" />
                </View>
              )}
              
              {/* Camera Icon for Banner Edit - Top Right */}
              <TouchableOpacity
                style={[styles.bannerEditButton, { width: cameraIconSize + 16, height: cameraIconSize + 16 }]}
                onPress={handlePickBanner}
                disabled={isPickingBanner}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                {isPickingBanner ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={styles.cameraIconWrapper}>
                    <IconSymbol name="camera.fill" size={cameraIconSize} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Logo - Overlapping banner and content area */}
            <View style={[styles.logoContainer, { left: (screenWidth - logoSize) / 2, bottom: -(logoSize / 2) }]}>
              {logoUri ? (
                <View style={[styles.logoImageContainer, { width: logoSize, height: logoSize, borderRadius: logoSize / 2, borderWidth: logoBorderWidth }]}>
                  <Image
                    source={{ uri: logoUri }}
                    style={[styles.logoImage, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}
                    resizeMode="cover"
                  />
                  {/* Camera Icon Overlay - Centered */}
                  <TouchableOpacity
                    style={styles.logoEditButton}
                    onPress={handlePickLogo}
                    disabled={isPicking}
                    {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                    {isPicking ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <View style={styles.cameraIconWrapper}>
                        <IconSymbol name="camera.fill" size={cameraIconSize} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.logoPlaceholder, { width: logoSize, height: logoSize, borderRadius: logoSize / 2, borderWidth: logoBorderWidth }]}>
                  <IconSymbol name="photo" size={isSmall ? 32 : 40} color="#9CA3AF" />
                  {/* Camera Icon Overlay - Centered */}
                  <TouchableOpacity
                    style={styles.logoEditButton}
                    onPress={handlePickLogo}
                    disabled={isPicking}
                    {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                    {isPicking ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <View style={styles.cameraIconWrapper}>
                        <IconSymbol name="camera.fill" size={cameraIconSize} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Review Message */}
          <View style={[styles.reviewMessageContainer, { paddingTop: logoSize / 2 + (isSmall ? SPACING.md : SPACING.base), paddingHorizontal: horizontalPadding }]}>
            <Text style={[styles.reviewMessage, { fontSize: reviewMessageFontSize }]}>
              Please review your details below to ensure they are up to date.
            </Text>
          </View>

          {/* Form Content */}
          <View style={[styles.formContent, { paddingHorizontal: horizontalPadding }]}>

          {/* Business Information */}
          {(profile?.account_type === 'trade' || profile?.account_type === 'brand') && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>Business Information</Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontSize: inputLabelFontSize }]}>Business Name *</Text>
                <TextInput
                  style={[styles.input, { height: inputHeight, fontSize: inputFontSize }, errors.businessName && styles.inputError]}
                  value={businessName}
                  onChangeText={(text) => {
                    setBusinessName(text);
                    if (errors.businessName) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.businessName;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Enter business name"
                  placeholderTextColor="#9CA3AF"
                />
                {errors.businessName && (
                  <Text style={styles.errorText}>{errors.businessName}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontSize: inputLabelFontSize }]}>Business Address</Text>
                <TextInput
                  style={[styles.input, { height: inputHeight, fontSize: inputFontSize }]}
                  value={businessAddress}
                  onChangeText={setBusinessAddress}
                  placeholder="Enter business address"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontSize: inputLabelFontSize }]}>Contact Person Name *</Text>
                <TextInput
                  style={[styles.input, { height: inputHeight, fontSize: inputFontSize }, errors.contactPersonName && styles.inputError]}
                  value={contactPersonName}
                  onChangeText={(text) => {
                    setContactPersonName(text);
                    if (errors.contactPersonName) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.contactPersonName;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Enter contact person name"
                  placeholderTextColor="#9CA3AF"
                />
                {errors.contactPersonName && (
                  <Text style={styles.errorText}>{errors.contactPersonName}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontSize: inputLabelFontSize }]}>VAT Number</Text>
                <TextInput
                  style={[styles.input, { height: inputHeight, fontSize: inputFontSize }]}
                  value={vatNumber}
                  onChangeText={setVatNumber}
                  placeholder="Enter VAT number (optional)"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontSize: inputLabelFontSize }]}>Dealer License</Text>
                <TextInput
                  style={[styles.input, { height: inputHeight, fontSize: inputFontSize }]}
                  value={dealerLicense}
                  onChangeText={setDealerLicense}
                  placeholder="Enter dealer license (optional)"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          )}

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>Contact Information</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontSize: inputLabelFontSize }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { height: inputHeight, fontSize: inputFontSize }]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Social Links */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>Social Links</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontSize: inputLabelFontSize }]}>Instagram</Text>
              <TextInput
                style={[styles.input, { height: inputHeight, fontSize: inputFontSize }]}
                value={instagramLink}
                onChangeText={setInstagramLink}
                placeholder="https://instagram.com/yourprofile"
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontSize: inputLabelFontSize }]}>Facebook</Text>
              <TextInput
                style={[styles.input, { height: inputHeight, fontSize: inputFontSize }]}
                value={facebookLink}
                onChangeText={setFacebookLink}
                placeholder="https://facebook.com/yourprofile"
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontSize: inputLabelFontSize }]}>Website</Text>
              <TextInput
                style={[styles.input, { height: inputHeight, fontSize: inputFontSize }]}
                value={websiteLink}
                onChangeText={setWebsiteLink}
                placeholder="https://yourwebsite.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { height: saveButtonHeight }, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              {...(Platform.OS === 'web' && { cursor: isSaving ? 'not-allowed' : 'pointer' })}>
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={[styles.saveButtonText, { fontSize: saveButtonFontSize }]}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onTakePhoto={takePhoto}
        onPickFromLibrary={pickFromPhotoLibrary}
        onPickFromFiles={pickFromFiles}
        isPicking={isPicking}
        title="Select Image Source"
      />

      {/* Banner Picker Modal */}
      <ImagePickerModal
        visible={showBannerPicker}
        onClose={() => setShowBannerPicker(false)}
        onTakePhoto={takeBannerPhoto}
        onPickFromLibrary={pickBannerFromPhotoLibrary}
        onPickFromFiles={pickBannerFromFiles}
        isPicking={isPickingBanner}
        title="Select Banner Image"
      />

      {/* Image Editor */}
      {tempImageUri && (
        <ImageEditor
          visible={showImageEditor}
          imageUri={tempImageUri}
          onSave={handleImageEditorSave}
          onCancel={handleImageEditorCancel}
        />
      )}

      {/* Banner Editor */}
      {tempBannerUri && (
        <ImageEditor
          visible={showBannerEditor}
          imageUri={tempBannerUri}
          onSave={handleBannerEditorSave}
          onCancel={handleBannerEditorCancel}
        />
      )}
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    // paddingTop, paddingBottom, paddingHorizontal set dynamically
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    // width and height set dynamically
  },
  headerTitle: {
    flex: 1,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    // width and height set dynamically
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingBottom set dynamically
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
  bannerEditButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    // Add shadow for visibility
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logoContainer: {
    position: 'absolute',
    zIndex: 10,
    // left and bottom set dynamically
  },
  logoImageContainer: {
    position: 'relative',
    borderColor: '#4CAF50', // Vibrant green border
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    // width, height, borderRadius, borderWidth set dynamically
  },
  logoImage: {
    // width, height, borderRadius set dynamically
  },
  logoPlaceholder: {
    position: 'relative',
    borderColor: '#4CAF50', // Vibrant green border
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // width, height, borderRadius, borderWidth set dynamically
  },
  logoEditButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconWrapper: {
    // Wrapper to add shadow/visibility effects to the icon
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  reviewMessageContainer: {
    paddingBottom: 16,
    // paddingTop and paddingHorizontal set dynamically
  },
  reviewMessage: {
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'system-ui',
    textAlign: 'left',
    // fontSize set dynamically
  },
  formContent: {
    // paddingHorizontal set dynamically
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 16,
    // fontSize set dynamically
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'system-ui',
    marginBottom: 8,
    // fontSize set dynamically
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#000000',
    fontFamily: 'system-ui',
    // height and fontSize set dynamically
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'system-ui',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    // height set dynamically
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
});
