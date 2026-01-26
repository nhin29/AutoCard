import { IconSymbol } from '@/components/ui/icon-symbol';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

/**
 * Verify OTP Screen
 * 
 * OTP code verification screen with countdown timer and resend functionality.
 * 
 * TEMPORARY: Currently bypasses OTP verification - accepts any 6-digit code.
 * TODO: Implement proper OTP verification with Supabase later.
 * 
 * Receives userId and email as route params from signup flow.
 */
export default function VerifyOTPScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSmall } = useResponsive();
  const params = useLocalSearchParams<{ userId?: string; email?: string }>();
  const { user, signupData, clearSignupData, setUser, setSession } = useAuthStore();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digits for Supabase OTP
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds countdown
  const [canResend, setCanResend] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  // Calculate responsive values - reduced for small phones with safe area insets
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.lg;
  const horizontalPaddingWithInsets = Math.max(horizontalPadding, insets.left, insets.right);
  const bottomPadding = Math.max(insets.bottom, isSmall ? SPACING.base : SPACING.xl);
  const titleFontSize = isSmall ? FONT_SIZES.lg : FONT_SIZES['2xl'];
  const descriptionFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.base;
  const buttonHeight = isSmall ? 42 : 52;
  const otpInputSize = isSmall ? 40 : 48;
  const otpInputFontSize = isSmall ? 18 : 22;
  const otpGap = isSmall ? 6 : 8;
  const backIconSize = isSmall ? 20 : 24;
  const headerTitleFontSize = isSmall ? FONT_SIZES.base : FONT_SIZES.lg;
  const errorIconSize = isSmall ? 14 : 16;
  const errorTextFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const resendFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const buttonTextFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.base;
  const loginLinkFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const contentPaddingTop = isSmall ? SPACING.lg : 40;
  const titleMarginBottom = isSmall ? SPACING.sm : SPACING.base;
  const descriptionMarginBottom = isSmall ? SPACING.md : SPACING.lg;
  const otpMarginBottom = isSmall ? SPACING.md : SPACING.lg;
  const resendMarginBottom = isSmall ? SPACING.lg : 32;
  const modalTitleFontSize = isSmall ? FONT_SIZES.lg : FONT_SIZES.xl;
  const modalMessageFontSize = isSmall ? FONT_SIZES.sm : 15;
  const modalButtonHeight = isSmall ? 44 : 52;
  const modalButtonFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.base;

  // Get email and userId from params first, fallback to auth store
  const email = params.email || signupData.email || user?.email || '';
  const userId = params.userId || user?.id || '';
  const accountType = user?.profile?.account_type || signupData.accountType;

  // Countdown timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const handleBack = () => {
    router.back();
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    setOtp(newOtp);
    setError(null); // Clear error on input

    // Auto-focus next field if value entered (6 digits)
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    // Handle backspace to move to previous field
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyAccount = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (!email) {
      setError('Email not found. Please sign up again.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // TEMPORARY: Bypass OTP verification - accept any 6-digit code
      // TODO: Implement proper OTP verification with Supabase later
      
      const { supabase } = await import('@/services/supabase');
      
      // Get current session or refresh it
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        // Try to get user and create a new session
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !currentUser) {
          setError('Unable to verify account. Please try signing up again.');
          setIsVerifying(false);
          return;
        }
        
        // If we have a user but no session, try to refresh using authService
        const { session: refreshedSession, error: refreshError } = await authService.refreshSession();
        
        if (refreshError || !refreshedSession) {
          // Handle specific refresh token errors
          if (refreshError?.includes('Session expired') || 
              refreshError?.includes('Invalid Refresh Token') ||
              refreshError?.includes('Refresh Token Not Found')) {
            setError('Your session has expired. Please sign up again.');
          } else {
            setError('Unable to create session. Please try signing up again.');
          }
          setIsVerifying(false);
          return;
        }
        
        // Use refreshed session
        const authUser = await authService.getCurrentUser();
        if (authUser) {
          setUser(authUser);
        }
        setSession({
          access_token: refreshedSession.access_token,
          refresh_token: refreshedSession.refresh_token,
          expires_at: refreshedSession.expires_at ?? Date.now() + 3600000,
        });
      } else if (session) {
        // Session exists, update auth store
        const authUser = await authService.getCurrentUser();
        if (authUser) {
          setUser(authUser);
        }
        setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at ?? Date.now() + 3600000,
        });
      } else {
        // No session, try to get user
        const authUser = await authService.getCurrentUser();
        if (authUser) {
          setUser(authUser);
          // Try to get session one more time
          const { data: { session: newSession } } = await supabase.auth.getSession();
          if (newSession) {
            setSession({
              access_token: newSession.access_token,
              refresh_token: newSession.refresh_token,
              expires_at: newSession.expires_at ?? Date.now() + 3600000,
            });
          }
        } else {
          setError('User not found. Please try signing up again.');
          setIsVerifying(false);
          return;
        }
      }

      // Clear signup data now that verification is complete
      clearSignupData();

      // Show review modal for trade accounts, or navigate to home for others
      if (accountType === 'trade') {
        setShowReviewModal(true);
      } else {
        // Navigate directly to home for non-trade accounts
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGuestLogin = () => {
    // Close modal and navigate to home page
    setShowReviewModal(false);
    router.replace('/(tabs)');
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Email not found. Please sign up again.');
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      // Use Supabase's built-in resend OTP
      const { supabase } = await import('@/services/supabase');
      
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (resendError) {
        setError(resendError.message || 'Failed to resend code');
        setIsResending(false);
        return;
      }

      // Reset timer
      setTimeRemaining(60);
      setCanResend(false);
      
      // Clear OTP input (6 digits)
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
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

      {/* Header: Back Button + Title */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, isSmall ? SPACING.sm : SPACING.base), paddingHorizontal: horizontalPaddingWithInsets }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={isVerifying}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={backIconSize} color="#000000" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>Verify OTP</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { paddingHorizontal: horizontalPaddingWithInsets, paddingTop: contentPaddingTop }]}>
        {/* Title */}
        <Text style={[styles.title, { fontSize: titleFontSize, marginBottom: titleMarginBottom }]}>OTP code verification</Text>

        {/* Description */}
        <Text style={[styles.description, { fontSize: descriptionFontSize, marginBottom: descriptionMarginBottom }]}>
          We have sent an OTP code to your email{' '}
          <Text style={styles.emailText}>{email}</Text>. Enter the OTP code below to verify.
        </Text>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <IconSymbol name="exclamationmark.circle.fill" size={errorIconSize} color="#EF4444" />
            <Text style={[styles.errorText, { fontSize: errorTextFontSize }]}>{error}</Text>
          </View>
        )}

        {/* OTP Input Fields (6 digits for Supabase) */}
        <View style={[styles.otpContainer, { gap: otpGap, marginBottom: otpMarginBottom }]}>
          {otp.map((digit, index) => (
            <View
              key={index}
              style={[
                styles.otpInputWrapper,
                { width: otpInputSize, height: otpInputSize },
                otp[index] && styles.otpInputWrapperFilled,
                error && styles.otpInputWrapperError,
              ]}>
              <TextInput
                ref={(ref) => { otpInputRefs.current[index] = ref; }}
                style={[styles.otpInput, { width: otpInputSize, height: otpInputSize, fontSize: otpInputFontSize }]}
                value={digit}
                onChangeText={(value) => handleOtpChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
                editable={!isVerifying}
              />
              {!digit && (
                <Text style={[styles.otpPlaceholder, { width: otpInputSize, height: otpInputSize, fontSize: otpInputFontSize, lineHeight: otpInputSize }]}>-</Text>
              )}
            </View>
          ))}
        </View>

        {/* Resend Code Section */}
        <View style={[styles.resendContainer, { marginBottom: resendMarginBottom }]}>
          <Text style={[styles.resendPrompt, { fontSize: resendFontSize }]}>Didn't receive email? </Text>
          {canResend ? (
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={isResending}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              {isResending ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Text style={[styles.resendLink, { fontSize: resendFontSize }]}>Resend Code</Text>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={[styles.resendTimer, { fontSize: resendFontSize }]}>
              You can resend code in <Text style={styles.timerBold}>{timeRemaining} s</Text>
            </Text>
          )}
        </View>

        {/* Verify Account Button */}
        <TouchableOpacity
          style={[styles.verifyButton, { height: buttonHeight }, isVerifying && styles.verifyButtonDisabled]}
          onPress={handleVerifyAccount}
          disabled={isVerifying}
          {...(Platform.OS === 'web' && { cursor: isVerifying ? 'not-allowed' : 'pointer' })}>
          {isVerifying ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={[styles.verifyButtonText, { fontSize: buttonTextFontSize }]}>Verify Account</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={[styles.loginPrompt, { fontSize: loginLinkFontSize }]}>Already have an account?</Text>
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isVerifying}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={[styles.loginLink, { fontSize: loginLinkFontSize }]}>Login</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>

      {/* Review Modal (for Trade accounts) */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            {
              paddingHorizontal: horizontalPaddingWithInsets,
              paddingTop: isSmall ? SPACING.lg : 32,
              paddingBottom: isSmall ? SPACING.xl : 40,
              minHeight: isSmall ? 250 : 300,
            }
          ]}>
            <Text style={[styles.modalTitle, { fontSize: modalTitleFontSize }]}>Trade Account Under Review</Text>
            <Text style={[styles.modalMessage, { fontSize: modalMessageFontSize, marginBottom: isSmall ? SPACING.lg : 32 }]}>
              Thank you for your interest in a Trade Seller account. Our team is currently reviewing your request. You'll receive an update soon.
            </Text>
            <TouchableOpacity
              style={[styles.guestLoginButton, { height: modalButtonHeight }]}
              onPress={handleGuestLogin}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Text style={[styles.guestLoginButtonText, { fontSize: modalButtonFontSize }]}>Continue to App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    // paddingTop and paddingHorizontal set dynamically via inline style using SafeAreaInsets
    paddingBottom: SPACING.base,
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
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'system-ui',
    paddingHorizontal: SPACING.sm,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    // paddingHorizontal and paddingTop set dynamically
  },
  title: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    textAlign: 'center',
    // fontSize and marginBottom set dynamically
  },
  description: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.sm,
    // fontSize and marginBottom set dynamically
  },
  emailText: {
    fontWeight: '700',
    color: '#000000',
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
    width: '100%',
  },
  errorText: {
    flex: 1,
    fontWeight: '400',
    color: '#DC2626',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // gap and marginBottom set dynamically
  },
  otpInputWrapper: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // width and height set dynamically
  },
  otpInputWrapperFilled: {
    borderColor: '#4CAF50',
  },
  otpInputWrapperError: {
    borderColor: '#EF4444',
  },
  otpInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    textAlign: 'center',
    zIndex: 2,
    // width, height, and fontSize set dynamically
  },
  otpPlaceholder: {
    position: 'absolute',
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
    textAlign: 'center',
    zIndex: 1,
    pointerEvents: 'none',
    // width, height, fontSize, and lineHeight set dynamically
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
    // marginBottom set dynamically
  },
  resendPrompt: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  resendTimer: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  timerBold: {
    fontWeight: '700',
    color: '#6B7280',
  },
  resendLink: {
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
    textDecorationLine: 'underline',
    // fontSize set dynamically
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    // height set dynamically
  },
  verifyButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  verifyButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  loginPrompt: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  loginLink: {
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF9E6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // paddingTop, paddingBottom, paddingHorizontal, and minHeight set dynamically
  },
  modalTitle: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: SPACING.base,
    textAlign: 'center',
    // fontSize set dynamically
  },
  modalMessage: {
    fontWeight: '400',
    color: '#374151',
    fontFamily: 'system-ui',
    lineHeight: 22,
    textAlign: 'center',
    // marginBottom and fontSize set dynamically
  },
  guestLoginButton: {
    width: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // height set dynamically
  },
  guestLoginButtonText: {
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
});
