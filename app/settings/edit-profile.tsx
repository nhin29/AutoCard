import { ImageEditor } from '@/components/ImageEditor';
import { ImagePickerModal } from '@/components/place-ad/ImagePickerModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { profileService } from '@/services/profile';
import { storageService } from '@/services/storage';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Profile } from '@/types/database';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
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
  const { user, setProfile } = useAuthStore();
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
      return;
    }

    try {
      setIsLoading(true);
      const { profile: profileData, error } = await profileService.getCurrentProfile();
      
      if (error) {
        Alert.alert('Error', 'Failed to load profile. Please try again.');
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
      }
    } catch (error) {
      console.error('[EditProfile] Load error:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
      router.back();
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
      console.error('[EditProfile] Camera error:', e);
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
      console.error('[EditProfile] Library error:', e);
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
      console.error('[EditProfile] DocumentPicker error:', e);
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

  const handleRemoveLogo = () => {
    setLogoUri(null);
  };

  const handlePickBanner = () => {
    if (isPickingBanner) return;
    setShowBannerPicker(true);
  };

  const handleRemoveBanner = () => {
    setBannerUri(null);
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
      console.error('[EditProfile] Banner camera error:', e);
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
      console.error('[EditProfile] Banner library error:', e);
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
      console.error('[EditProfile] Banner file picker error:', e);
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
      console.error('[EditProfile] Save error:', error);
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Profile Banner Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Banner</Text>
            <View style={styles.bannerContainer}>
              {bannerUri ? (
                <View style={styles.bannerPreview}>
                  <Image source={{ uri: bannerUri }} style={styles.bannerImage} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.removeBannerButton}
                    onPress={handleRemoveBanner}
                    {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                    <IconSymbol name="xmark.circle.fill" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.bannerPlaceholder}>
                  <IconSymbol name="photo" size={40} color="#9CA3AF" />
                </View>
              )}
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickBanner}
                disabled={isPickingBanner}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                {isPickingBanner ? (
                  <ActivityIndicator size="small" color="#4CAF50" />
                ) : (
                  <>
                    <IconSymbol name="camera.fill" size={20} color="#4CAF50" />
                    <Text style={styles.uploadButtonText}>
                      {bannerUri ? 'Change Banner' : 'Upload Banner'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Logo Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Logo</Text>
            <View style={styles.logoContainer}>
              {logoUri ? (
                <View style={styles.logoPreview}>
                  <Image source={{ uri: logoUri }} style={styles.logoImage} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.removeLogoButton}
                    onPress={handleRemoveLogo}
                    {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                    <IconSymbol name="xmark.circle.fill" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.logoPlaceholder}>
                  <IconSymbol name="photo" size={40} color="#9CA3AF" />
                </View>
              )}
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickLogo}
                disabled={isPicking}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                {isPicking ? (
                  <ActivityIndicator size="small" color="#4CAF50" />
                ) : (
                  <>
                    <IconSymbol name="camera.fill" size={20} color="#4CAF50" />
                    <Text style={styles.uploadButtonText}>
                      {logoUri ? 'Change Logo' : 'Upload Logo'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Business Information */}
          {(profile?.account_type === 'trade' || profile?.account_type === 'brand') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Business Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Name *</Text>
                <TextInput
                  style={[styles.input, errors.businessName && styles.inputError]}
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
                <Text style={styles.label}>Business Address</Text>
                <TextInput
                  style={styles.input}
                  value={businessAddress}
                  onChangeText={setBusinessAddress}
                  placeholder="Enter business address"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Person Name *</Text>
                <TextInput
                  style={[styles.input, errors.contactPersonName && styles.inputError]}
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
                <Text style={styles.label}>VAT Number</Text>
                <TextInput
                  style={styles.input}
                  value={vatNumber}
                  onChangeText={setVatNumber}
                  placeholder="Enter VAT number (optional)"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Dealer License</Text>
                <TextInput
                  style={styles.input}
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
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
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
            <Text style={styles.sectionTitle}>Social Links</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instagram</Text>
              <TextInput
                style={styles.input}
                value={instagramLink}
                onChangeText={setInstagramLink}
                placeholder="https://instagram.com/yourprofile"
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Facebook</Text>
              <TextInput
                style={styles.input}
                value={facebookLink}
                onChangeText={setFacebookLink}
                placeholder="https://facebook.com/yourprofile"
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
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
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            {...(Platform.OS === 'web' && { cursor: isSaving ? 'not-allowed' : 'pointer' })}>
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
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
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'system-ui',
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 16,
  },
  bannerContainer: {
    alignItems: 'center',
    gap: 16,
  },
  bannerPreview: {
    position: 'relative',
    width: '100%',
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  removeBannerButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  bannerPlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 16,
  },
  logoPreview: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#60A5FA',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  removeLogoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'system-ui',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000000',
    fontFamily: 'system-ui',
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
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
});
