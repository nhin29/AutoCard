import { SignupHeader } from '@/components/auth/SignupHeader';
import { useAuthStore } from '@/stores/useAuthStore';
import type { AccountType } from '@/types/database';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const { isSmall } = useResponsive();
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | null>(null);

  // Calculate responsive values - reduced for small phones with safe area insets
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.lg;
  const horizontalPaddingWithInsets = Math.max(horizontalPadding, insets.left, insets.right);
  const bottomPadding = Math.max(insets.bottom, isSmall ? SPACING.base : SPACING.xl);
  const titleFontSize = isSmall ? FONT_SIZES.lg : FONT_SIZES['2xl'];
  const buttonHeight = isSmall ? 42 : 48;
  const logoMarginBottom = isSmall ? SPACING.md : SPACING.xl;
  const titleMarginBottom = isSmall ? SPACING.md : SPACING.xl;
  const optionsGap = isSmall ? SPACING.xs : SPACING.md;
  const optionCardHeight = isSmall ? 56 : 68;
  const optionCardPadding = isSmall ? SPACING.sm : SPACING.base;
  const iconSize = isSmall ? 24 : 32;
  const radioButtonSize = isSmall ? 16 : 20;
  const radioButtonInnerSize = isSmall ? 6 : 10;

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
      <StatusBar style="dark" />

      {/* Header: Logo */}
      <SignupHeader showLogo />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPaddingWithInsets,
            paddingBottom: bottomPadding,
          }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={[styles.title, { fontSize: titleFontSize, marginTop: logoMarginBottom, marginBottom: titleMarginBottom }]}>Select Your Account Type</Text>

        {/* Account Type Options */}
        <View style={[styles.optionsContainer, { gap: optionsGap }]}>
          {ACCOUNT_TYPES.map((option) => {
            const isSelected = selectedAccountType === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  { height: optionCardHeight, padding: optionCardPadding },
                  isSelected && styles.optionCardSelected
                ]}
                onPress={() => handleAccountTypeSelect(option.id)}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View style={styles.optionContent}>
                  <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>
                    <Image
                      source={option.icon}
                      style={[styles.accountIcon, { width: iconSize, height: iconSize }]}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>{option.title}</Text>
                    <Text style={[styles.optionDescription, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>{option.description}</Text>
                  </View>
                  <View style={[styles.radioButtonContainer, { width: radioButtonSize, height: radioButtonSize }]}>
                    <View style={[
                      styles.radioButton,
                      { width: radioButtonSize, height: radioButtonSize, borderRadius: radioButtonSize / 2 },
                      isSelected && styles.radioButtonSelected
                    ]}>
                      {isSelected && <View style={[styles.radioButtonInner, { width: radioButtonInnerSize, height: radioButtonInnerSize, borderRadius: radioButtonInnerSize / 2 }]} />}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Section - Fixed at bottom */}
      <View style={[
        styles.bottomSection,
        {
          paddingHorizontal: horizontalPaddingWithInsets,
          paddingBottom: bottomPadding,
          paddingTop: isSmall ? SPACING.md : SPACING.lg,
        }
      ]}>
        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            { height: buttonHeight },
            !selectedAccountType && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedAccountType}
          {...(Platform.OS === 'web' && { cursor: selectedAccountType ? 'pointer' : 'default' })}>
          <Text style={[styles.continueButtonText, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.base }]}>Continue</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={[styles.loginContainer, { marginTop: isSmall ? SPACING.sm : SPACING.lg }]}>
          <Text style={[styles.loginPrompt, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.base }]}>Already have an account?</Text>
          <TouchableOpacity
            onPress={handleLogin}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={[styles.loginLink, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.base }]}>Login</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // No flexGrow to prevent blank space when content is shorter than screen
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'system-ui',
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  optionCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#F3F4F6', // gray/100
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray/200
    borderRadius: 8,
    flexDirection: 'row',
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
    justifyContent: 'space-between',
    padding: 0,
    gap: SPACING.md,
    width: '100%',
    flex: 1,
    alignSelf: 'stretch',
    minHeight: 0,
  },
  iconContainer: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountIcon: {
    // Width and height are set dynamically
  },
  optionTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 0,
    gap: SPACING.xs,
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
    lineHeight: 16,
    color: '#6B7280', // gray/500
  },
  optionDescription: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: FONT_SIZES.sm,
    lineHeight: 16,
    color: '#111827', // gray/900
  },
  radioButtonContainer: {
    flexShrink: 0,
  },
  radioButton: {
    borderWidth: 2,
    borderColor: '#9CA3AF', // Gray
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4CAF50', // Green
  },
  radioButtonInner: {
    backgroundColor: '#4CAF50', // Green
  },
  continueButton: {
    width: '100%',
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
    fontWeight: '400',
    color: '#9CA3AF', // Light grey
    fontFamily: 'system-ui',
  },
  loginLink: {
    fontWeight: '600',
    color: '#4CAF50', // Green
    fontFamily: 'system-ui',
  },
});
