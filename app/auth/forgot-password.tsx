import { IconSymbol } from '@/components/ui/icon-symbol';
import { authService } from '@/services/auth';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { safeBack } from '@/utils/safeBack';
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
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenMode = 'email' | 'reset';

/**
 * Forgot Password Screen
 * 
 * Two modes:
 * 1. Email mode - Enter email to receive password reset link
 * 2. Reset mode - Create new password after clicking reset link
 * 
 * Uses Supabase password reset flow with magic link.
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSmall, width: screenWidth } = useResponsive();
  const [mode, setMode] = useState<ScreenMode>('email');
  
  // Email mode state
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Reset mode state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Errors
  const [error, setError] = useState<string | null>(null);

  // Calculate responsive values - reduced for small phones with safe area insets
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.lg;
  const horizontalPaddingWithInsets = Math.max(horizontalPadding, insets.left, insets.right);
  const topPadding = Math.max(insets.top + (isSmall ? SPACING.base : SPACING.lg), isSmall ? SPACING.xl : SPACING.xxl);
  const bottomPadding = Math.max(insets.bottom, isSmall ? SPACING.base : SPACING.xl);
  const logoWidth = isSmall ? Math.min(screenWidth * 0.5, 160) : Math.min(screenWidth * 0.5, 200);
  const logoHeight = (logoWidth * 60) / 200; // Maintain aspect ratio
  const titleFontSize = isSmall ? FONT_SIZES.lg : FONT_SIZES['2xl'];
  const descriptionFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.base;
  const successDescriptionFontSize = isSmall ? FONT_SIZES.base : 16;
  const instructionFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const inputHeight = isSmall ? 40 : 48;
  const buttonHeight = isSmall ? 42 : 48;
  const inputFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const labelFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const buttonTextFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.base;
  const backIconSize = isSmall ? 18 : 20;
  const successIconSize = isSmall ? 48 : 64;
  const logoMarginTop = isSmall ? SPACING.md : SPACING.xl;
  const logoMarginBottom = isSmall ? SPACING.md : SPACING.xl;
  const titleMarginBottom = isSmall ? SPACING.sm : SPACING.base;
  const descriptionMarginBottom = isSmall ? SPACING.md : SPACING.lg;
  const errorIconSize = isSmall ? 14 : 16;
  const errorTextFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;

  const handleBack = () => {
    if (emailSent) {
      // Go back to email input mode
      setEmailSent(false);
      setError(null);
    } else {
      safeBack(router, '/auth/signin');
    }
  };

  const handleSendResetLink = async () => {
    setError(null);

    // Validate email
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.sendPasswordResetEmail(email.trim());

      if (result.error) {
        setError(result.error);
        return;
      }

      // Email sent successfully
      setEmailSent(true);
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);

    // Validate passwords
    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!confirmPassword.trim()) {
      setError('Please confirm your password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.updatePassword(newPassword);

      if (result.error) {
        setError(result.error);
        return;
      }

      // Password updated successfully
      Alert.alert(
        'Password Updated',
        'Your password has been successfully updated. Please sign in with your new password.',
        [
          {
            text: 'Sign In',
            onPress: () => router.replace('/auth/signin'),
          },
        ]
      );
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    handleSendResetLink();
  };

  // Render email sent confirmation
  if (emailSent) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: topPadding,
              paddingHorizontal: horizontalPaddingWithInsets,
              paddingBottom: bottomPadding,
            }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <StatusBar style="dark" />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <IconSymbol name="chevron.left" size={backIconSize} color="#000000" />
          </TouchableOpacity>

          {/* Logo */}
          <View style={[styles.logoContainer, { marginTop: logoMarginTop, marginBottom: logoMarginBottom }]}>
            <Image
              source={require('@/assets/images/auth-logo.png')}
              style={[styles.logoImage, { width: logoWidth, height: logoHeight }]}
              resizeMode="contain"
            />
          </View>

          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <IconSymbol name="checkmark.circle.fill" size={successIconSize} color="#4CAF50" />
          </View>

          {/* Title */}
          <Text style={[styles.title, { fontSize: titleFontSize, marginBottom: titleMarginBottom }]}>Check Your Email</Text>

          {/* Description */}
          <Text style={[styles.successDescription, { fontSize: successDescriptionFontSize }]}>
            We&apos;ve sent a password reset link to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <Text style={[styles.instructionText, { fontSize: instructionFontSize, marginBottom: isSmall ? SPACING.lg : 32 }]}>
            Click the link in the email to reset your password. If you don&apos;t see the email, check your spam folder.
          </Text>

          {/* Resend Button */}
          <TouchableOpacity
            style={[styles.resendButton, { height: buttonHeight }]}
            onPress={handleResendEmail}
            disabled={isSubmitting}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            {isSubmitting ? (
              <ActivityIndicator color="#4CAF50" size="small" />
            ) : (
              <Text style={[styles.resendButtonText, { fontSize: buttonTextFontSize }]}>Resend Email</Text>
            )}
          </TouchableOpacity>

          {/* Back to Sign In */}
          <TouchableOpacity
            style={[styles.backToSignInButton, { height: buttonHeight }]}
            onPress={() => router.replace('/auth/signin')}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={[styles.backToSignInText, { fontSize: buttonTextFontSize }]}>Back to Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Render email input form (default mode)
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: topPadding,
            paddingHorizontal: horizontalPaddingWithInsets,
            paddingBottom: bottomPadding,
          }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <StatusBar style="dark" />

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={isSubmitting}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={backIconSize} color="#000000" />
        </TouchableOpacity>

        {/* Logo and Tagline */}
        <View style={[styles.logoContainer, { marginTop: logoMarginTop, marginBottom: logoMarginBottom }]}>
          <Image
            source={require('@/assets/images/auth-logo.png')}
            style={[styles.logoImage, { width: logoWidth, height: logoHeight }]}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { fontSize: titleFontSize, marginBottom: titleMarginBottom }]}>Reset Your Password</Text>

        {/* Description */}
        <Text style={[styles.description, { fontSize: descriptionFontSize, marginBottom: descriptionMarginBottom }]}>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </Text>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <IconSymbol name="exclamationmark.circle.fill" size={errorIconSize} color="#EF4444" />
            <Text style={[styles.errorText, { fontSize: errorTextFontSize }]}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { fontSize: labelFontSize }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { height: inputHeight, fontSize: inputFontSize }, error && styles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSendResetLink}
              editable={!isSubmitting}
            />
          </View>

          {/* Send Reset Link Button */}
          <TouchableOpacity
            style={[styles.submitButton, { height: buttonHeight }, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSendResetLink}
            disabled={isSubmitting}
            {...(Platform.OS === 'web' && { cursor: isSubmitting ? 'not-allowed' : 'pointer' })}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={[styles.submitButtonText, { fontSize: buttonTextFontSize }]}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={[styles.signUpContainer, { marginTop: isSmall ? SPACING.lg : 32 }]}>
          <Text style={[styles.signUpPrompt, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>Don&apos;t have an account?</Text>
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={isSubmitting}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={[styles.signUpLink, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    // paddingTop, paddingHorizontal, and paddingBottom set dynamically
  },
  backButton: {
    marginBottom: SPACING.base,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -SPACING.sm,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  logoContainer: {
    alignItems: 'center',
    // marginTop and marginBottom set dynamically
  },
  logoImage: {
    // width and height set dynamically
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'system-ui',
    // fontSize and marginBottom set dynamically
  },
  description: {
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.base,
    fontFamily: 'system-ui',
    // fontSize and marginBottom set dynamically
  },
  successDescription: {
    fontWeight: '400',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.base,
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  emailHighlight: {
    fontWeight: '600',
    color: '#000000',
  },
  instructionText: {
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.base,
    fontFamily: 'system-ui',
    // fontSize and marginBottom set dynamically
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.base,
    gap: SPACING.sm,
  },
  errorText: {
    flex: 1,
    fontWeight: '400',
    color: '#DC2626',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  formContainer: {
    width: '100%',
    gap: 20,
  },
  inputContainer: {
    width: '100%',
    gap: 8,
  },
  inputLabel: {
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
    marginBottom: SPACING.xs,
    // fontSize set dynamically
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
    // height and fontSize set dynamically
  },
  inputError: {
    borderColor: '#EF4444',
  },
  passwordInputWrapper: {
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
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    fontFamily: 'system-ui',
  },
  eyeIcon: {
    padding: 4,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    // height set dynamically
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  resendButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.base,
    // height set dynamically
  },
  resendButtonText: {
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  backToSignInButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // height set dynamically
  },
  backToSignInText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
    // marginTop set dynamically
  },
  signUpPrompt: {
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  signUpLink: {
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
});
