import { IconSymbol } from '@/components/ui/icon-symbol';
import { authService } from '@/services/auth';
import { storageService } from '@/services/storage';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
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
 * Sign Up Screen - Step 4: Create Account
 *
 * Final step: Email, Instagram Link, Facebook Link, Website Link,
 * Create Password, Confirm Password.
 * 
 * Submits all collected data to Supabase to create the account.
 */
export default function SignUpStep4Screen() {
  const router = useRouter();
  const { signupData, setSignupCredentials, setUser, setSession, clearSignupData } = useAuthStore();
  
  // Initialize form state from auth store (supports back navigation)
  // Email is now collected in step 3, so use it from signupData
  const email = signupData.email || '';
  const [instagramLink, setInstagramLink] = useState(signupData.instagramLink || '');
  const [facebookLink, setFacebookLink] = useState(signupData.facebookLink || '');
  const [websiteLink, setWebsiteLink] = useState(signupData.websiteLink || '');
  const [password, setPassword] = useState(signupData.password || '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleBack = () => {
    // Save current form data before navigating back (email is already saved in step 3)
    setSignupCredentials({
      instagramLink,
      facebookLink,
      websiteLink,
      password,
    });
    router.back();
  };

  const handleCreateAccount = async () => {
    // Validate required fields and set error messages
    const newErrors: typeof errors = {};
    
    // Email validation (email should already be validated in step 3)
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required. Please go back and enter your email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Invalid email address. Please go back and enter a valid email.');
      return;
    }
    
    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Please create a password.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }
    
    // Confirm password validation
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);

    // If there are errors, don't proceed
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      // First, upload business logo if exists (for trade accounts)
      let businessLogoUrl: string | undefined;
      
      if (signupData.businessLogoUri && signupData.accountType === 'trade') {
        // We need to upload the logo after creating the user
        // For now, we'll handle this after signup
      }

      // Prepare signup data
      const signupPayload = {
        email: email.trim(),
        password,
        account_type: signupData.accountType || 'private',
        business_name: signupData.businessName || undefined,
        business_address: signupData.businessAddress || undefined,
        contact_person_name: signupData.contactPersonName || undefined,
        vat_number: signupData.vatNumber || undefined,
        dealer_license: signupData.dealerLicense || undefined,
        instagram_link: instagramLink || undefined,
        facebook_link: facebookLink || undefined,
        website_link: websiteLink || undefined,
      };

      // Create account via auth service
      const result = await authService.signUp(signupPayload);

      if (result.error) {
        Alert.alert('Signup Failed', result.error);
        setIsLoading(false);
        return;
      }

      // User must exist for signup to be successful
      // Note: session may be null if email confirmation is required
      if (!result.user) {
        Alert.alert('Signup Failed', 'Unable to create account. Please try again.');
        setIsLoading(false);
        return;
      }

      // Upload business logo and banner if exists
      // Upload even if session is null (user can verify email later)
      if (signupData.businessLogoUri && signupData.accountType === 'trade' && result.user) {
        try {
          const uploadResult = await storageService.uploadBusinessLogo(
            signupData.businessLogoUri,
            result.user.id
          );

          if (uploadResult.error) {
            console.error('[SignUp] Logo upload error:', uploadResult.error);
            // Don't block signup if logo upload fails - user can upload later
          } else if (uploadResult.url) {
            // Update profile with logo URL
            const { supabase } = await import('@/services/supabase');
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ business_logo_url: uploadResult.url })
              .eq('id', result.user.id);
            
            if (updateError) {
              console.error('[SignUp] Profile update error:', updateError.message);
            }
          }
        } catch (uploadError: any) {
          // Logo upload failed, but account was created
          // We can let the user upload later
          console.error('[SignUp] Logo upload exception:', uploadError?.message || uploadError);
        }
      }

      // Upload profile banner if exists
      if (signupData.profileBannerUri && result.user) {
        try {
          const uploadResult = await storageService.uploadProfileBanner(
            signupData.profileBannerUri,
            result.user.id
          );

          if (uploadResult.error) {
            console.error('[SignUp] Banner upload error:', uploadResult.error);
            // Don't block signup if banner upload fails - user can upload later
          } else if (uploadResult.url) {
            // Update profile with banner URL
            const { supabase } = await import('@/services/supabase');
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ profile_banner_url: uploadResult.url })
              .eq('id', result.user.id);
            
            if (updateError) {
              console.error('[SignUp] Profile banner update error:', updateError.message);
            }
          }
        } catch (uploadError: any) {
          // Banner upload failed, but account was created
          console.error('[SignUp] Banner upload exception:', uploadError?.message || uploadError);
        }
      }

      // Update auth store with user info (session may be null until email confirmed)
      setUser(result.user);
      if (result.session) {
        setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
          expires_at: result.session.expires_at ?? Date.now() + 3600000,
        });
      }

      // Store email for OTP verification screen
      setSignupCredentials({ email: email.trim() });

      // Clear other signup data but keep email for verification
      // clearSignupData(); // Don't clear yet - need email for OTP screen

      // Navigate to OTP verification screen
      // Pass user ID and email as params for the verification
      router.push({
        pathname: '/auth/verify-otp',
        params: { 
          userId: result.user.id, 
          email: email.trim() 
        }
      });
    } catch (error: any) {
      console.error('[SignUp] Create account error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.replace('/auth/signin');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header: Back Button + Logo */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={isLoading}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/auth-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Title */}
          <Text style={styles.title}>Create Account</Text>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Instagram Link */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Instagram Link <Text style={styles.optionalText}>(Optional)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Paste your Link here"
                placeholderTextColor="#9CA3AF"
                value={instagramLink}
                onChangeText={setInstagramLink}
                autoCapitalize="none"
                keyboardType="url"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Facebook Link */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Facebook Link <Text style={styles.optionalText}>(Optional)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Paste your Link here"
                placeholderTextColor="#9CA3AF"
                value={facebookLink}
                onChangeText={setFacebookLink}
                autoCapitalize="none"
                keyboardType="url"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Website Link */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Website Link <Text style={styles.optionalText}>(Optional)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Paste your Link here"
                placeholderTextColor="#9CA3AF"
                value={websiteLink}
                onChangeText={setWebsiteLink}
                autoCapitalize="none"
                keyboardType="url"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Create Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Create Password</Text>
              <View style={[styles.passwordContainer, errors.password && styles.passwordContainerError]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Create Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    // Clear password error when user types
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                    // Clear confirm password error if passwords now match
                    if (errors.confirmPassword && text === confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <IconSymbol
                    name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[styles.passwordContainer, errors.confirmPassword && styles.passwordContainerError]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm Password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    // Clear confirm password error when user types
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <IconSymbol
                    name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            onPress={handleCreateAccount}
            disabled={isLoading}
            {...(Platform.OS === 'web' && { cursor: isLoading ? 'not-allowed' : 'pointer' })}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.createButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginPrompt}>Already have an account?</Text>
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 200,
    height: 60,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    textAlign: 'center',
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'system-ui',
    marginBottom: 8,
  },
  optionalText: {
    fontWeight: '400',
    color: '#9CA3AF',
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
    fontFamily: 'system-ui',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  passwordContainerError: {
    borderColor: '#EF4444',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    fontFamily: 'system-ui',
    paddingRight: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#EF4444',
    fontFamily: 'system-ui',
    marginTop: 4,
  },
  eyeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#4CAF50',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  loginPrompt: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
  },
});
