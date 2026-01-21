import { IconSymbol } from '@/components/ui/icon-symbol';
import { authService } from '@/services/auth';
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
  View 
} from 'react-native';

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
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      console.error('[SignIn] Login error:', err);
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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <StatusBar style="dark" />

      {/* Logo and Tagline */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/auth-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Log In to your Account</Text>

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
            style={[styles.input, error && !email.trim() && styles.inputError]}
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
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={[styles.passwordInputWrapper, error && !password && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
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
                size={20}
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
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          {...(Platform.OS === 'web' && { cursor: isLoading ? 'not-allowed' : 'pointer' })}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Log In</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpPrompt}>Don&apos;t have an account?</Text>
        <TouchableOpacity
          onPress={handleSignUp}
          disabled={isLoading}
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoImage: {
    width: 200,
    height: 60,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280', // Gray
    fontFamily: 'system-ui',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 32,
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
    color: '#9CA3AF', // Light grey
    fontFamily: 'system-ui',
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB', // Light grey border
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#2563EB', // Blue
    fontFamily: 'system-ui',
  },
  loginButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#4CAF50', // Green
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loginButtonText: {
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
    color: '#9CA3AF', // Light grey
    fontFamily: 'system-ui',
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50', // Green
    fontFamily: 'system-ui',
  },
});
