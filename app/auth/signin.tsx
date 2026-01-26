import { IconSymbol } from '@/components/ui/icon-symbol';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { 
  ActivityIndicator,
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

/**
 * Sign In Screen
 * 
 * Features:
 * - AutoCart logo with tagline
 * - Email and password input fields
 * - Forgot password link
 * - Login button with Supabase authentication
 * - Sign up link
 */
export default function SignInScreen() {
  const router = useRouter();
  const { setUser, setSession } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { isSmall, width: screenWidth } = useResponsive();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate responsive values - reduced for small phones with safe area insets
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.lg;
  const horizontalPaddingWithInsets = Math.max(horizontalPadding, insets.left, insets.right);
  const topPadding = Math.max(insets.top + (isSmall ? SPACING.base : SPACING.lg), isSmall ? SPACING.xl : SPACING.xxl);
  const bottomPadding = Math.max(insets.bottom, isSmall ? SPACING.base : SPACING.xl);
  const logoWidth = isSmall ? Math.min(screenWidth * 0.5, 160) : Math.min(screenWidth * 0.5, 200);
  const logoHeight = (logoWidth * 60) / 200; // Maintain aspect ratio
  const titleFontSize = isSmall ? FONT_SIZES.lg : FONT_SIZES['2xl'];
  const inputHeight = isSmall ? 40 : 48;
  const buttonHeight = isSmall ? 42 : 48;
  const logoMarginTop = isSmall ? SPACING.md : SPACING.xl;
  const logoMarginBottom = isSmall ? SPACING.md : SPACING.xl;
  const titleMarginBottom = isSmall ? SPACING.md : SPACING.xl;
  const formGap = isSmall ? SPACING.sm : SPACING.lg;
  const signUpMarginTop = isSmall ? SPACING.md : SPACING.xl;
  const labelFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const inputFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const inputMarginBottom = isSmall ? SPACING.sm : SPACING.md;
  const eyeIconSize = isSmall ? 16 : 20;

  const handleLogin = async () => {
    // Clear previous errors
    setError(null);

    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.signIn(email.trim(), password);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.user && result.session) {
        // Update auth store with user and session
        setUser(result.user);
        setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
          expires_at: result.session.expires_at ?? Date.now() + 3600000,
        });

        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

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

      {/* Logo and Tagline */}
      <View style={[styles.logoContainer, { marginTop: logoMarginTop, marginBottom: logoMarginBottom }]}>
        <Image
          source={require('@/assets/images/auth-logo.png')}
          style={[styles.logoImage, { width: logoWidth, height: logoHeight }]}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={[styles.title, { fontSize: titleFontSize, marginBottom: titleMarginBottom }]}>Log In to your Account</Text>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.circle.fill" size={isSmall ? 14 : 16} color="#EF4444" />
          <Text style={[styles.errorText, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>{error}</Text>
        </View>
      )}

      {/* Form */}
      <View style={[styles.formContainer, { gap: formGap }]}>
        {/* Email Input */}
        <View style={[styles.inputContainer, { marginBottom: inputMarginBottom }]}>
          <Text style={[styles.inputLabel, { fontSize: labelFontSize }]}>Email Address</Text>
          <TextInput
            style={[
              styles.input,
              { height: inputHeight, fontSize: inputFontSize },
              error && !email.trim() && styles.inputError
            ]}
            placeholder="Email Address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            autoFocus={false}
            editable={!isLoading}
          />
        </View>

        {/* Password Input */}
        <View style={[styles.inputContainer, { marginBottom: inputMarginBottom }]}>
          <Text style={[styles.inputLabel, { fontSize: labelFontSize }]}>Password</Text>
          <View style={[
            styles.passwordInputWrapper,
            { height: inputHeight },
            error && !password && styles.inputError
          ]}>
            <TextInput
              style={[styles.passwordInput, { fontSize: inputFontSize }]}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError(null);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol
                name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                size={eyeIconSize}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={handleForgotPassword}
          disabled={isLoading}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={[styles.forgotPasswordText, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.base }]}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={[
            styles.loginButton,
            { height: buttonHeight },
            isLoading && styles.loginButtonDisabled
          ]}
          onPress={handleLogin}
          disabled={isLoading}
          {...(Platform.OS === 'web' && { cursor: isLoading ? 'not-allowed' : 'pointer' })}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={[styles.loginButtonText, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.base }]}>Log In</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Sign Up Link */}
      <View style={[styles.signUpContainer, { marginTop: signUpMarginTop }]}>
        <Text style={[styles.signUpPrompt, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.base }]}>Don&apos;t have an account?</Text>
        <TouchableOpacity
          onPress={handleSignUp}
          disabled={isLoading}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={[styles.signUpLink, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.base }]}>Sign up</Text>
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
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    // Width and height are set dynamically based on screen size
  },
  tagline: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '400',
    color: '#6B7280', // Gray
    fontFamily: 'system-ui',
    letterSpacing: 0.5,
  },
  title: {
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
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
    marginBottom: SPACING.base,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontWeight: '400',
    color: '#DC2626',
    fontFamily: 'system-ui',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    width: '100%',
  },
  inputLabel: {
    fontWeight: '400',
    color: '#9CA3AF', // Light grey
    fontFamily: 'system-ui',
    marginBottom: SPACING.xs,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB', // Light grey border
    borderRadius: 8,
    paddingHorizontal: SPACING.base,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: SPACING.base,
  },
  passwordInput: {
    flex: 1,
    color: '#000000',
    fontFamily: 'system-ui',
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -SPACING.sm,
  },
  forgotPasswordText: {
    fontWeight: '400',
    color: '#2563EB', // Blue
    fontFamily: 'system-ui',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#4CAF50', // Green
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loginButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  signUpPrompt: {
    fontWeight: '400',
    color: '#9CA3AF', // Light grey
    fontFamily: 'system-ui',
  },
  signUpLink: {
    fontWeight: '600',
    color: '#4CAF50', // Green
    fontFamily: 'system-ui',
  },
});
