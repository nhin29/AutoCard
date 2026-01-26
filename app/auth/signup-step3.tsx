import { SignupHeader } from '@/components/auth/SignupHeader';
import { ImageEditor } from '@/components/ImageEditor';
import { ImagePickerModal } from '@/components/place-ad/ImagePickerModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuthStore } from '@/stores/useAuthStore';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import * as Device from 'expo-device';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const { isSmall } = useResponsive();

  // Calculate responsive values - reduced for small phones with safe area insets
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.lg;
  const horizontalPaddingWithInsets = Math.max(horizontalPadding, insets.left, insets.right);
  const bottomPadding = Math.max(insets.bottom, isSmall ? SPACING.base : SPACING.xl);
  const inputHeight = isSmall ? 40 : 48;
  const buttonHeight = isSmall ? 42 : 48;
  const logoSize = isSmall ? 60 : 80;
  const bannerHeight = isSmall ? 80 : 120;
  const inputMarginBottom = isSmall ? SPACING.sm : SPACING.md;
  const formPaddingTop = isSmall ? SPACING.sm : SPACING.md;
  const labelFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const inputFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <StatusBar style="dark" />

      {/* Header: Back + Title */}
      <SignupHeader
        showBackButton
        title="Create your Trade seller account"
        onBack={handleBack}
      />

      {/* Form Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingBottom: Math.max(bottomPadding, isSmall ? SPACING.lg : SPACING.xxl),
            paddingTop: isSmall ? SPACING.xs : SPACING.sm,
          }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}>
        <View style={[styles.formContent, { paddingHorizontal: horizontalPaddingWithInsets, paddingTop: formPaddingTop }]}>
        {/* Email Address */}
        <View style={[styles.inputContainer, { marginBottom: inputMarginBottom }]}>
          <Text style={[styles.inputLabel, { fontSize: labelFontSize }]}>Email Address</Text>
          <TextInput
            style={[
              styles.input,
              { height: inputHeight, fontSize: inputFontSize },
              errors.email && styles.inputError
            ]}
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
            <Text style={[styles.errorText, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>{errors.email}</Text>
          )}
        </View>

        {/* Business Name */}
        <View style={[styles.inputContainer, { marginBottom: inputMarginBottom }]}>
          <Text style={[styles.inputLabel, { fontSize: labelFontSize }]}>Business Name</Text>
          <TextInput
            style={[
              styles.input,
              { height: inputHeight, fontSize: inputFontSize },
              errors.businessName && styles.inputError
            ]}
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
            <Text style={[styles.errorText, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>{errors.businessName}</Text>
          )}
        </View>

        {/* Address */}
        <View style={[styles.inputContainer, { marginBottom: inputMarginBottom }]}>
          <Text style={[styles.inputLabel, { fontSize: labelFontSize }]}>Address</Text>
          <TextInput
            style={[
              styles.input,
              styles.inputMultiline,
              { minHeight: inputHeight, fontSize: inputFontSize },
              errors.address && styles.inputError
            ]}
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
            <Text style={[styles.errorText, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>{errors.address}</Text>
          )}
        </View>

        {/* Contact Person Name */}
        <View style={[styles.inputContainer, { marginBottom: inputMarginBottom }]}>
          <Text style={[styles.inputLabel, { fontSize: labelFontSize }]}>Contact Person Name</Text>
          <TextInput
            style={[
              styles.input,
              { height: inputHeight, fontSize: inputFontSize },
              errors.contactPersonName && styles.inputError
            ]}
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
            <Text style={[styles.errorText, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>{errors.contactPersonName}</Text>
          )}
        </View>

        {/* VAT Number (Recommended) */}
        <View style={[styles.inputContainer, { marginBottom: inputMarginBottom }]}>
          <Text style={[styles.inputLabel, { fontSize: labelFontSize }]}>
            VAT Number <Text style={styles.labelHint}>(Recommended)</Text>
          </Text>
          <TextInput
            style={[styles.input, { height: inputHeight, fontSize: inputFontSize }]}
            placeholder="VAT Number"
            placeholderTextColor="#9CA3AF"
            value={vatNumber}
            onChangeText={setVatNumber}
            keyboardType="default"
            autoCapitalize="characters"
          />
        </View>

        {/* Dealer License (Optional) */}
        <View style={[styles.inputContainer, { marginBottom: inputMarginBottom }]}>
          <Text style={[styles.inputLabel, { fontSize: labelFontSize }]}>
            Dealer License <Text style={styles.labelHint}>(Optional)</Text>
          </Text>
          <TextInput
            style={[styles.input, { height: inputHeight, fontSize: inputFontSize }]}
            placeholder="Dealer License"
            placeholderTextColor="#9CA3AF"
            value={dealerLicense}
            onChangeText={setDealerLicense}
          />
        </View>

        {/* Upload Profile Banner */}
        <View style={[styles.inputContainer, { marginBottom: inputMarginBottom }]}>
          <Text style={[styles.inputLabel, { fontSize: labelFontSize }]}>Upload Profile Banner <Text style={styles.labelHint}>(Optional)</Text></Text>
          <View style={[styles.bannerUploadBox, { height: bannerHeight }]}>
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
                <IconSymbol name="photo" size={isSmall ? 24 : 32} color="#9CA3AF" />
                <Text style={[styles.bannerPlaceholderText, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>Tap to upload banner</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Upload Business Logo */}
        <View style={[styles.inputContainerLogo, { marginBottom: isSmall ? SPACING.base : SPACING.xl }]}>
          <Text style={[styles.inputLabel, { fontSize: labelFontSize }]}>Upload Business Logo</Text>
          <View style={[
            styles.logoUploadBox,
            { width: logoSize, height: logoSize },
            errors.logoUri && styles.logoUploadBoxError
          ]}>
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
                  <Text style={[styles.logoRemoveBtnText, { fontSize: isSmall ? 12 : 14 }]}>×</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.logoPlaceholderTouch}
                onPress={handlePickLogo}
                disabled={isPicking}
                activeOpacity={0.7}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={[styles.logoUploadPlus, { fontSize: isSmall ? 24 : 32 }]}>+</Text>
              </TouchableOpacity>
            )}
          </View>
          {errors.logoUri && (
            <Text style={[styles.errorText, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>{errors.logoUri}</Text>
          )}
        </View>
        </View>
      </ScrollView>

      {/* Bottom: Continue + Login - Fixed at bottom */}
      <View style={[
        styles.bottomSection,
        {
          paddingHorizontal: horizontalPaddingWithInsets,
          paddingBottom: bottomPadding,
          paddingTop: isSmall ? SPACING.sm : SPACING.base,
        }
      ]}>
        <TouchableOpacity
          style={[styles.continueButton, { height: buttonHeight }]}
          onPress={handleContinue}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={[styles.continueButtonText, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.base }]}>Continue</Text>
        </TouchableOpacity>

        <View style={[styles.loginContainer, { marginTop: isSmall ? SPACING.sm : SPACING.lg }]}>
          <Text style={[styles.loginPrompt, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.base }]}>Already have an account?</Text>
          <TouchableOpacity
            onPress={handleLogin}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={[styles.loginLink, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.base }]}>Login</Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  formContent: {
    flex: 1,
  },
  inputContainer: {
    width: '100%',
  },
  inputContainerLogo: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    marginBottom: SPACING.xs,
  },
  labelHint: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: SPACING.base,
    color: '#000000',
    fontFamily: 'system-ui',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputMultiline: {
    paddingTop: SPACING.sm,
    textAlignVertical: 'top',
  },
  errorText: {
    fontWeight: '400',
    color: '#EF4444',
    fontFamily: 'system-ui',
    marginTop: SPACING.xs,
  },
  logoUploadBox: {
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
    fontSize: FONT_SIZES.sm,
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  loginPrompt: {
    fontSize: FONT_SIZES.base,
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
  },
  loginLink: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
  },
});
