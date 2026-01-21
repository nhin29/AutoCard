import { IconSymbol } from '@/components/ui/icon-symbol';
import { authService } from '@/services/auth';
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

  const handleBack = () => {
    if (emailSent) {
      // Go back to email input mode
      setEmailSent(false);
      setError(null);
    } else {
      router.back();
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
      console.error('[ForgotPassword] Send reset email error:', err);
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
      console.error('[ForgotPassword] Reset password error:', err);
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <StatusBar style="dark" />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <IconSymbol name="chevron.left" size={20} color="#000000" />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/auth-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <IconSymbol name="checkmark.circle.fill" size={64} color="#4CAF50" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Check Your Email</Text>

          {/* Description */}
          <Text style={styles.successDescription}>
            We&apos;ve sent a password reset link to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <Text style={styles.instructionText}>
            Click the link in the email to reset your password. If you don&apos;t see the email, check your spam folder.
          </Text>

          {/* Resend Button */}
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendEmail}
            disabled={isSubmitting}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            {isSubmitting ? (
              <ActivityIndicator color="#4CAF50" size="small" />
            ) : (
              <Text style={styles.resendButtonText}>Resend Email</Text>
            )}
          </TouchableOpacity>

          {/* Back to Sign In */}
          <TouchableOpacity
            style={styles.backToSignInButton}
            onPress={() => router.replace('/auth/signin')}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={styles.backToSignInText}>Back to Sign In</Text>
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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <StatusBar style="dark" />

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={isSubmitting}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={20} color="#000000" />
        </TouchableOpacity>

        {/* Logo and Tagline */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/auth-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Reset Your Password</Text>

        {/* Description */}
        <Text style={styles.description}>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </Text>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <IconSymbol name="exclamationmark.circle.fill" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
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
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSendResetLink}
            disabled={isSubmitting}
            {...(Platform.OS === 'web' && { cursor: isSubmitting ? 'not-allowed' : 'pointer' })}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpPrompt}>Don&apos;t have an account?</Text>
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={isSubmitting}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={styles.signUpLink}>Sign up</Text>
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
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoImage: {
    width: 200,
    height: 60,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'system-ui',
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    fontFamily: 'system-ui',
  },
  successDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: 'system-ui',
  },
  emailHighlight: {
    fontWeight: '600',
    color: '#000000',
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 16,
    fontFamily: 'system-ui',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#DC2626',
    fontFamily: 'system-ui',
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
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
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
    height: 48,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  resendButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
  },
  backToSignInButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backToSignInText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 4,
  },
  signUpPrompt: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
  },
});
