import { useAuthStore } from '@/stores/useAuthStore';
import type { AccountType } from '@/types/database';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Account type icons
const TRADE_SELLER_ICON = require('@/assets/images/auth/trade.png');
const PRIVATE_SELLER_ICON = require('@/assets/images/auth/private.png');
const BRAND_ICON = require('@/assets/images/auth/brand.png');
const GUEST_ICON = require('@/assets/images/auth/guest.png');

interface AccountTypeOption {
  id: AccountType;
  title: string;
  description: string;
  icon: any; // Image source
}

const ACCOUNT_TYPES: AccountTypeOption[] = [
  {
    id: 'trade',
    title: 'Trade Seller',
    description: 'Requires approval',
    icon: TRADE_SELLER_ICON,
  },
  {
    id: 'private',
    title: 'Private Seller',
    description: 'No approval needed',
    icon: PRIVATE_SELLER_ICON,
  },
  {
    id: 'brand',
    title: 'Brand / Manufacturer',
    description: 'Official global vehicle brands',
    icon: BRAND_ICON,
  },
  {
    id: 'guest',
    title: 'Start as a Guest',
    description: 'Quick view - no sign-up required',
    icon: GUEST_ICON,
  },
];

/**
 * Sign Up Screen - Step 1: Select Account Type
 * 
 * Features:
 * - AutoCart logo
 * - Four account type options with radio buttons
 * - Continue button
 * - Login link
 * 
 * Stores selected account type in auth store for use in subsequent steps.
 */
export default function SignUpScreen() {
  const router = useRouter();
  const { setSignupAccountType, clearSignupData } = useAuthStore();
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | null>(null);

  const handleAccountTypeSelect = (type: AccountType) => {
    setSelectedAccountType(type);
  };

  const handleContinue = () => {
    if (!selectedAccountType) {
      return;
    }
    
    // If guest is selected, go directly to home page without login
    // Guest users have no session and no profile in database
    if (selectedAccountType === 'guest') {
      // Clear any signup data
      clearSignupData();
      // Navigate to home page immediately - guest users have no authentication
      // Use replace to clear navigation stack
      router.replace('/(tabs)');
      return;
    }
    
    // Clear any previous signup data and set new account type
    clearSignupData();
    setSignupAccountType(selectedAccountType);
    
    // Navigate to step 2 with selected account type
    router.push(`/auth/signup-step2?type=${selectedAccountType}`);
  };

  const handleLogin = () => {
    router.replace('/auth/signin');
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

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/auth-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Select Your Account Type</Text>

        {/* Account Type Options */}
        <View style={styles.optionsContainer}>
          {ACCOUNT_TYPES.map((option) => {
            const isSelected = selectedAccountType === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => handleAccountTypeSelect(option.id)}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View style={styles.optionContent}>
                  <View style={styles.iconContainer}>
                    <Image
                      source={option.icon}
                      style={styles.accountIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  <View style={styles.radioButtonContainer}>
                    <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                      {isSelected && <View style={styles.radioButtonInner} />}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Section - Fixed at bottom */}
      <View style={styles.bottomSection}>
        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedAccountType && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedAccountType}
          {...(Platform.OS === 'web' && { cursor: selectedAccountType ? 'pointer' : 'default' })}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginPrompt}>Already have an account?</Text>
          <TouchableOpacity
            onPress={handleLogin}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 20,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logoImage: {
    width: 200,
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'system-ui',
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  optionCard: {
    width: '100%',
    maxWidth: 380,
    height: 68,
    backgroundColor: '#F3F4F6', // gray/100
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray/200
    borderRadius: 8,
    padding: 16,
    gap: 16,
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
  },
  optionCardSelected: {
    borderColor: '#4CAF50', // Green border when selected
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    gap: 12,
    width: '100%',
    height: 36,
    alignSelf: 'stretch',
  },
  iconContainer: {
    width: 32,
    height: 32,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountIcon: {
    width: 32,
    height: 32,
  },
  optionTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 0,
    gap: 4,
    flex: 1,
    height: 36,
  },
  optionTitle: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    color: '#6B7280', // gray/500
  },
  optionDescription: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: '#111827', // gray/900
  },
  radioButtonContainer: {
    width: 20,
    height: 20,
    flexShrink: 0,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF', // Gray
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4CAF50', // Green
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50', // Green
  },
  continueButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#4CAF50', // Green
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF', // Gray when disabled
    opacity: 0.6,
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
    marginTop: 24,
    gap: 4,
  },
  loginPrompt: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF', // Light grey
    fontFamily: 'system-ui',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50', // Green
    fontFamily: 'system-ui',
  },
});
