import { ImageEditor } from '@/components/ImageEditor';
import { ImagePickerModal } from '@/components/place-ad/ImagePickerModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuthStore } from '@/stores/useAuthStore';
import * as Device from 'expo-device';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * Sign Up Screen - Step 3: Create your Trade seller account
 *
 * Shown when user selects Trade Seller in step 2 and taps Continue.
 * Form: Business Name, Address, Contact Person, VAT (Recommended),
 * Dealer License (Optional), Upload Business Logo.
 * 
 * Data is stored in auth store for use in final signup step.
 */
export default function SignUpStep3Screen() {
  const router = useRouter();
  const { signupData, setSignupBusinessInfo } = useAuthStore();
  
  // Initialize form state from auth store (supports back navigation)
  const [email, setEmail] = useState(signupData.email || '');
  const [businessName, setBusinessName] = useState(signupData.businessName || '');
  const [address, setAddress] = useState(signupData.businessAddress || '');
  const [contactPersonName, setContactPersonName] = useState(signupData.contactPersonName || '');
  const [vatNumber, setVatNumber] = useState(signupData.vatNumber || '');
  const [dealerLicense, setDealerLicense] = useState(signupData.dealerLicense || '');
  const [logoUri, setLogoUri] = useState<string | null>(signupData.businessLogoUri || null);
  const [bannerUri, setBannerUri] = useState<string | null>(signupData.profileBannerUri || null);
  const [isPicking, setIsPicking] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isPickingBanner, setIsPickingBanner] = useState(false);
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  
  // For custom image editor
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [tempBannerUri, setTempBannerUri] = useState<string | null>(null);
  const [showBannerEditor, setShowBannerEditor] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<{
    email?: string;
    businessName?: string;
    address?: string;
    contactPersonName?: string;
    logoUri?: string;
  }>({});

  const handleBack = () => {
    // Save current form data before navigating back
    setSignupBusinessInfo({
      email,
      businessName,
      businessAddress: address,
      contactPersonName,
      vatNumber,
      dealerLicense,
      businessLogoUri: logoUri,
      profileBannerUri: bannerUri,
    });
    router.back();
  };

  /**
   * Opens the custom image editor with the selected image.
   */
  const openImageEditor = (uri: string) => {
    setTempImageUri(uri);
    setShowImageEditor(true);
  };

  /**
   * Opens the custom image editor for banner.
   */
  const openBannerEditor = (uri: string) => {
    setTempBannerUri(uri);
    setShowBannerEditor(true);
  };

  /**
   * Handles saving the edited image from the custom editor.
   */
  const handleImageEditorSave = (uri: string) => {
    setLogoUri(uri);
    setShowImageEditor(false);
    setTempImageUri(null);
    // Clear logo error when image is selected
    if (errors.logoUri) {
      setErrors((prev) => ({ ...prev, logoUri: undefined }));
    }
  };

  /**
   * Handles saving the edited banner from the custom editor.
   */
  const handleBannerEditorSave = (uri: string) => {
    setBannerUri(uri);
    setShowBannerEditor(false);
    setTempBannerUri(null);
  };

  /**
   * Handles canceling the image editor.
   */
  const handleImageEditorCancel = () => {
    setShowImageEditor(false);
    setTempImageUri(null);
  };

  /**
   * Handles canceling the banner editor.
   */
  const handleBannerEditorCancel = () => {
    setShowBannerEditor(false);
    setTempBannerUri(null);
  };

  /**
   * Take photo using camera, then open custom editor.
   */
  const takePhoto = async () => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      // Check if running on iOS Simulator - camera doesn't work there
      // Android emulators can use virtual camera, so we only block iOS
      if (Platform.OS === 'ios' && !Device.isDevice) {
        Alert.alert(
          'Camera Not Available',
          'Camera is not available on iOS Simulator. Please use "Photo Library" or "Browse Files" instead, or test on a real device.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your camera to take a photo.',
          [{ text: 'OK' }]
        );
        setIsPicking(false);
        return;
      }

      // Ensure modal is fully closed before launching camera
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Launch camera WITHOUT native editing - we'll use our custom editor
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        // Open custom image editor
        openImageEditor(result.assets[0].uri);
      }
    } catch (e: any) {
      if (__DEV__) console.error('[SignUpStep3] Camera error:', e);
      
      const errorMessage = e?.message || 'Unknown error';
      const isPermissionError = errorMessage.toLowerCase().includes('permission') || 
                                errorMessage.toLowerCase().includes('denied');
      
      Alert.alert(
        'Camera Error',
        isPermissionError 
          ? 'Camera permission was denied. Please enable camera access in your device settings.'
          : 'Unable to open camera. Please use "Photo Library" or "Browse Files" instead.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPicking(false);
    }
  };

  /**
   * Pick image from Photo Library, then open custom editor.
   */
  const pickFromPhotoLibrary = async () => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      // Request permission - iOS can return 'granted' or 'limited' (both are acceptable)
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      // Type assertion needed because TypeScript doesn't recognize 'limited' as valid PermissionStatus
      const statusString = status as string;
      if (statusString !== 'granted' && statusString !== 'limited') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload a logo.',
          [{ text: 'OK' }]
        );
        setIsPicking(false);
        return;
      }

      // Ensure modal is fully closed before launching library
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Launch library WITHOUT native editing - we'll use our custom editor
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        // Open custom image editor
        openImageEditor(result.assets[0].uri);
      }
    } catch (e: any) {
      if (__DEV__) console.error('[SignUpStep3] ImagePicker error:', e);
      
      const errorMessage = e?.message || 'Unknown error';
      const isPermissionError = errorMessage.toLowerCase().includes('permission') || 
                                errorMessage.toLowerCase().includes('denied') ||
                                errorMessage.toLowerCase().includes('rejected');
      
      Alert.alert(
        'Photo Library Error',
        isPermissionError
          ? 'Photo library permission was denied. Please enable photo access in your device settings.'
          : 'Unable to select from Photo Library. Please try "Browse Files" instead.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPicking(false);
    }
  };

  /**
   * Pick image from Files, then open custom editor.
   */
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
        // Open custom image editor
        openImageEditor(result.assets[0].uri);
      }
    } catch (e) {
      if (__DEV__) console.error('[SignUpStep3] DocumentPicker error:', e);
      Alert.alert(
        'Upload',
        'Unable to open the file picker. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPicking(false);
    }
  };


  /**
   * Show custom bottom sheet for image selection.
   */
  const handlePickLogo = () => {
    if (isPicking) return;
    setShowImagePicker(true);
  };

  const handleRemoveLogo = () => {
    setLogoUri(null);
  };

  /**
   * Banner upload handlers
   */
  const takeBannerPhoto = async () => {
    if (isPickingBanner) return;
    setIsPickingBanner(true);
    try {
      if (Platform.OS === 'ios' && !Device.isDevice) {
        Alert.alert(
          'Camera Not Available',
          'Camera is not available on iOS Simulator. Please use "Photo Library" or "Browse Files" instead.',
          [{ text: 'OK' }]
        );
        return;
      }

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
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        openBannerEditor(result.assets[0].uri);
      }
    } catch (e: any) {
      console.error('[SignUpStep3] Banner camera error:', e);
      Alert.alert('Camera Error', 'Unable to open camera. Please try again.', [{ text: 'OK' }]);
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
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        openBannerEditor(result.assets[0].uri);
      }
    } catch (e: any) {
      console.error('[SignUpStep3] Banner picker error:', e);
      Alert.alert('Photo Library Error', 'Unable to select image. Please try again.', [{ text: 'OK' }]);
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
    } catch (e) {
      console.error('[SignUpStep3] Banner file picker error:', e);
      Alert.alert('Upload', 'Unable to open the file picker. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsPickingBanner(false);
    }
  };

  const handlePickBanner = () => {
    if (isPickingBanner) return;
    setShowBannerPicker(true);
  };

  const handleRemoveBanner = () => {
    setBannerUri(null);
  };

  const handleContinue = () => {
    // Validate required fields and set error messages
    const newErrors: typeof errors = {};
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }
    
    if (!businessName.trim()) {
      newErrors.businessName = 'Please enter your Business Name.';
    }
    if (!address.trim()) {
      newErrors.address = 'Please enter your Address.';
    }
    if (!contactPersonName.trim()) {
      newErrors.contactPersonName = 'Please enter Contact Person Name.';
    }
    if (!logoUri) {
      newErrors.logoUri = 'Please upload a Business Logo.';
    }

    setErrors(newErrors);

    // If there are errors, don't navigate
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Save form data to auth store (including email)
    setSignupBusinessInfo({
      email,
      businessName,
      businessAddress: address,
      contactPersonName,
      vatNumber,
      dealerLicense,
      businessLogoUri: logoUri,
      profileBannerUri: bannerUri,
    });

    // Navigate to step 4
    router.push('/auth/signup-step4');
  };

  const handleLogin = () => {
    router.replace('/auth/signin');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header: Back + Title */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Create your Trade seller account
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Form Content - No scroll, fits on screen */}
      <View style={styles.formContent}>
        {/* Email Address */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>

        {/* Business Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Business Name</Text>
          <TextInput
            style={[styles.input, errors.businessName && styles.inputError]}
            placeholder="Business Name"
            placeholderTextColor="#9CA3AF"
            value={businessName}
            onChangeText={(text) => {
              setBusinessName(text);
              if (errors.businessName) {
                setErrors((prev) => ({ ...prev, businessName: undefined }));
              }
            }}
            autoCapitalize="words"
          />
          {errors.businessName && (
            <Text style={styles.errorText}>{errors.businessName}</Text>
          )}
        </View>

        {/* Address */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline, errors.address && styles.inputError]}
            placeholder="Lorem ipsum dolor sit amet consectetur. Urna."
            placeholderTextColor="#9CA3AF"
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              if (errors.address) {
                setErrors((prev) => ({ ...prev, address: undefined }));
              }
            }}
            multiline
            numberOfLines={2}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}
        </View>

        {/* Contact Person Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Contact Person Name</Text>
          <TextInput
            style={[styles.input, errors.contactPersonName && styles.inputError]}
            placeholder="Contact Person Name"
            placeholderTextColor="#9CA3AF"
            value={contactPersonName}
            onChangeText={(text) => {
              setContactPersonName(text);
              if (errors.contactPersonName) {
                setErrors((prev) => ({ ...prev, contactPersonName: undefined }));
              }
            }}
            autoCapitalize="words"
          />
          {errors.contactPersonName && (
            <Text style={styles.errorText}>{errors.contactPersonName}</Text>
          )}
        </View>

        {/* VAT Number (Recommended) */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            VAT Number <Text style={styles.labelHint}>(Recommended)</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="VAT Number"
            placeholderTextColor="#9CA3AF"
            value={vatNumber}
            onChangeText={setVatNumber}
            keyboardType="default"
            autoCapitalize="characters"
          />
        </View>

        {/* Dealer License (Optional) */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Dealer License <Text style={styles.labelHint}>(Optional)</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Dealer License"
            placeholderTextColor="#9CA3AF"
            value={dealerLicense}
            onChangeText={setDealerLicense}
          />
        </View>

        {/* Upload Profile Banner */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Upload Profile Banner <Text style={styles.labelHint}>(Optional)</Text></Text>
          <View style={styles.bannerUploadBox}>
            {bannerUri ? (
              <>
                <TouchableOpacity
                  style={styles.bannerPreviewTouch}
                  onPress={handlePickBanner}
                  disabled={isPickingBanner}
                  activeOpacity={0.8}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <Image
                    source={{ uri: bannerUri }}
                    style={styles.bannerPreview}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bannerRemoveBtn}
                  onPress={handleRemoveBanner}
                  hitSlop={8}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <Text style={styles.bannerRemoveBtnText}>×</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.bannerPlaceholderTouch}
                onPress={handlePickBanner}
                disabled={isPickingBanner}
                activeOpacity={0.7}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <IconSymbol name="photo" size={32} color="#9CA3AF" />
                <Text style={styles.bannerPlaceholderText}>Tap to upload banner</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Upload Business Logo */}
        <View style={styles.inputContainerLogo}>
          <Text style={styles.inputLabel}>Upload Business Logo</Text>
          <View style={[styles.logoUploadBox, errors.logoUri && styles.logoUploadBoxError]}>
            {logoUri ? (
              <>
                <TouchableOpacity
                  style={styles.logoPreviewTouch}
                  onPress={handlePickLogo}
                  disabled={isPicking}
                  activeOpacity={0.8}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <Image
                    source={{ uri: logoUri }}
                    style={styles.logoPreview}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.logoRemoveBtn}
                  onPress={handleRemoveLogo}
                  hitSlop={8}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <Text style={styles.logoRemoveBtnText}>×</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.logoPlaceholderTouch}
                onPress={handlePickLogo}
                disabled={isPicking}
                activeOpacity={0.7}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={styles.logoUploadPlus}>+</Text>
              </TouchableOpacity>
            )}
          </View>
          {errors.logoUri && (
            <Text style={styles.errorText}>{errors.logoUri}</Text>
          )}
        </View>
      </View>

      {/* Bottom: Continue + Login */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginPrompt}>Already have an account?</Text>
          <TouchableOpacity
            onPress={handleLogin}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onTakePhoto={takePhoto}
        onPickFromLibrary={pickFromPhotoLibrary}
        onPickFromFiles={pickFromFiles}
        isPicking={isPicking}
        title="Upload Business Logo"
      />

      {/* Banner Picker Modal */}
      <ImagePickerModal
        visible={showBannerPicker}
        onClose={() => setShowBannerPicker(false)}
        onTakePhoto={takeBannerPhoto}
        onPickFromLibrary={pickBannerFromPhotoLibrary}
        onPickFromFiles={pickBannerFromFiles}
        isPicking={isPickingBanner}
        title="Upload Profile Banner"
      />

      {/* Custom Image Editor for Logo */}
      <ImageEditor
        visible={showImageEditor}
        imageUri={tempImageUri}
        onSave={handleImageEditorSave}
        onCancel={handleImageEditorCancel}
      />

      {/* Custom Image Editor for Banner */}
      <ImageEditor
        visible={showBannerEditor}
        imageUri={tempBannerUri}
        onSave={handleBannerEditorSave}
        onCancel={handleBannerEditorCancel}
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
    borderBottomWidth: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'system-ui',
    paddingHorizontal: 8,
  },
  headerSpacer: {
    width: 40,
  },
  formContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  inputContainerLogo: {
    width: '100%',
    marginBottom: 0,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    marginBottom: 6,
  },
  labelHint: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#000000',
    fontFamily: 'system-ui',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputMultiline: {
    height: 60,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#EF4444',
    fontFamily: 'system-ui',
    marginTop: 4,
  },
  logoUploadBox: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 8,
    position: 'relative',
  },
  logoUploadBoxError: {
    borderColor: '#EF4444',
  },
  logoPlaceholderTouch: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPreviewTouch: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    overflow: 'hidden',
  },
  logoPreview: {
    width: '100%',
    height: '100%',
  },
  logoRemoveBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logoRemoveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 18,
  },
  logoUploadPlus: {
    fontSize: 32,
    fontWeight: '300',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
  },
  bannerUploadBox: {
    width: '100%',
    height: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerPreviewTouch: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    overflow: 'hidden',
  },
  bannerPreview: {
    width: '100%',
    height: '100%',
  },
  bannerRemoveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  bannerRemoveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '300',
    lineHeight: 20,
  },
  bannerPlaceholderTouch: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  bannerPlaceholderText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  loginPrompt: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
  },
});
