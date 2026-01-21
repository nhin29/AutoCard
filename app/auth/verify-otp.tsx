import { IconSymbol } from '@/components/ui/icon-symbol';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
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
        console.error('[VerifyOTP] Session error:', sessionError.message);
        // Try to get user and create a new session
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !currentUser) {
          setError('Unable to verify account. Please try signing up again.');
          setIsVerifying(false);
          return;
        }
        
        // If we have a user but no session, try to refresh
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          setError('Unable to create session. Please try signing up again.');
          setIsVerifying(false);
          return;
        }
        
        // Use refreshed session
        const authUser = await authService.getCurrentUser();
        if (authUser) {
          setUser(authUser);
        }
        setSession({
          access_token: refreshData.session.access_token,
          refresh_token: refreshData.session.refresh_token,
          expires_at: refreshData.session.expires_at ?? Date.now() + 3600000,
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
      console.error('[VerifyOTP] Verification error:', err);
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
      console.error('[VerifyOTP] Resend error:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogin = () => {
    router.replace('/auth/signin');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header: Back Button + Title */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={isVerifying}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify OTP</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>OTP code verification</Text>

        {/* Description */}
        <Text style={styles.description}>
          We have sent an OTP code to your email{' '}
          <Text style={styles.emailText}>{email}</Text>. Enter the OTP code below to verify.
        </Text>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <IconSymbol name="exclamationmark.circle.fill" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* OTP Input Fields (6 digits for Supabase) */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <View
              key={index}
              style={[
                styles.otpInputWrapper,
                otp[index] && styles.otpInputWrapperFilled,
                error && styles.otpInputWrapperError,
              ]}>
              <TextInput
                ref={(ref) => { otpInputRefs.current[index] = ref; }}
                style={styles.otpInput}
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
                <Text style={styles.otpPlaceholder}>-</Text>
              )}
            </View>
          ))}
        </View>

        {/* Resend Code Section */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendPrompt}>Didn't receive email? </Text>
          {canResend ? (
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={isResending}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              {isResending ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Text style={styles.resendLink}>Resend Code</Text>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>
              You can resend code in <Text style={styles.timerBold}>{timeRemaining} s</Text>
            </Text>
          )}
        </View>

        {/* Verify Account Button */}
        <TouchableOpacity
          style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
          onPress={handleVerifyAccount}
          disabled={isVerifying}
          {...(Platform.OS === 'web' && { cursor: isVerifying ? 'not-allowed' : 'pointer' })}>
          {isVerifying ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Account</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginPrompt}>Already have an account?</Text>
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isVerifying}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Review Modal (for Trade accounts) */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Trade Account Under Review</Text>
            <Text style={styles.modalMessage}>
              Thank you for your interest in a Trade Seller account. Our team is currently reviewing your request. You'll receive an update soon.
            </Text>
            <TouchableOpacity
              style={styles.guestLoginButton}
              onPress={handleGuestLogin}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Text style={styles.guestLoginButtonText}>Continue to App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
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
    fontSize: 14,
    fontWeight: '400',
    color: '#DC2626',
    fontFamily: 'system-ui',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  otpInputWrapper: {
    position: 'relative',
    width: 48,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  otpInputWrapperFilled: {
    borderColor: '#4CAF50',
  },
  otpInputWrapperError: {
    borderColor: '#EF4444',
  },
  otpInput: {
    width: 48,
    height: 52,
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    textAlign: 'center',
    zIndex: 2,
  },
  otpPlaceholder: {
    position: 'absolute',
    width: 48,
    height: 52,
    fontSize: 22,
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
    textAlign: 'center',
    lineHeight: 52,
    zIndex: 1,
    pointerEvents: 'none',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  resendPrompt: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
  },
  resendTimer: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
  },
  timerBold: {
    fontWeight: '700',
    color: '#6B7280',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
    textDecorationLine: 'underline',
  },
  verifyButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  verifyButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF9E6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    fontWeight: '400',
    color: '#374151',
    fontFamily: 'system-ui',
    lineHeight: 22,
    marginBottom: 32,
    textAlign: 'center',
  },
  guestLoginButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestLoginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
  },
});
