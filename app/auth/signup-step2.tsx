import { SignupHeader } from '@/components/auth/SignupHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AccountType = 'trade' | 'private' | 'brand' | 'guest';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const ACCOUNT_FEATURES: Record<AccountType, Feature[]> = {
  trade: [
    {
      icon: 'building.fill',
      title: 'Designed for Dealerships & Garages',
      description: 'Tailored for businesses managing multiple vehicle listings.',
    },
    {
      icon: 'checkmark.circle.fill',
      title: 'Business Verification',
      description: 'Requires business credentials for added credibility and professionalism.',
    },
    {
      icon: 'arrow.clockwise',
      title: 'Unlimited Listings',
      description: 'Post as many ads as needed to showcase your inventory.',
    },
    {
      icon: 'house.fill', // Document/menu icon - TODO: Replace with proper document icon
      title: 'Mandatory Finance Price Input',
      description: 'Ensure transparency with finance price details for all vehicle listings.',
    },
    {
      icon: 'shield.checkmark',
      title: 'Verification Tick',
      description: 'Stand out with a verification tick to build trust with buyers.',
    },
    {
      icon: 'megaphone.fill',
      title: 'Social Media Integration',
      description: 'Expand your reach by linking your social media profiles.',
    },
  ],
  private: [],
  brand: [],
  guest: [],
};

const ACCOUNT_TYPE_INFO = {
  trade: {
    title: 'Trade Seller',
    description: 'Requires approval',
    icon: require('@/assets/images/auth/trade.png'),
  },
  private: {
    title: 'Private Seller',
    description: 'No approval needed',
    icon: require('@/assets/images/auth/private.png'),
  },
  brand: {
    title: 'Brand / Manufacturer',
    description: 'Official global vehicle brands',
    icon: require('@/assets/images/auth/brand.png'),
  },
  guest: {
    title: 'Start as a Guest',
    description: 'Quick view - no sign-up required',
    icon: require('@/assets/images/auth/guest.png'),
  },
};

/**
 * Sign Up Screen - Step 2: Account Type Details
 * 
 * Features:
 * - Selected account type card with green background
 * - Feature list with icons
 * - Continue button
 * - Login link
 */
export default function SignUpStep2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type: AccountType }>();
  const insets = useSafeAreaInsets();
  const { isSmall } = useResponsive();
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType>('trade'); // Auto-select Trade Seller
  
  const accountInfo = ACCOUNT_TYPE_INFO[selectedAccountType];
  const features = ACCOUNT_FEATURES[selectedAccountType] || [];

  // Calculate responsive values - reduced for small phones with safe area insets
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.lg;
  const horizontalPaddingWithInsets = Math.max(horizontalPadding, insets.left, insets.right);
  const bottomPadding = Math.max(insets.bottom, isSmall ? SPACING.base : SPACING.xl);
  const titleFontSize = isSmall ? FONT_SIZES.lg : FONT_SIZES['2xl'];
  const buttonHeight = isSmall ? 42 : 48;
  const titleMarginBottom = isSmall ? SPACING.sm : SPACING.lg;
  const optionsGap = isSmall ? SPACING.xs : SPACING.md;
  const optionCardHeight = isSmall ? 56 : 68;
  const optionCardPadding = isSmall ? SPACING.sm : SPACING.base;
  const iconSize = isSmall ? 24 : 32;
  const radioButtonSize = isSmall ? 16 : 20;
  const radioButtonInnerSize = isSmall ? 6 : 10;
  const featureIconSize = isSmall ? 16 : 20;
  const tradeCardMinHeight = isSmall ? 280 : 394;
  const featureTextFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.base;

  const handleBack = () => {
    router.back();
  };

  const handleAccountTypeSelect = (type: AccountType) => {
    setSelectedAccountType(type);
  };

  const handleContinue = () => {
    //guest users are redirected to home page without login
    if (selectedAccountType === 'guest') {
      router.push('/(tabs)');
      return;
    }

    //trade users are redirected to step 3 for verification
    if (selectedAccountType === 'trade') {
      router.push('/auth/signup-step3?type=trade');
      return;
    }
    
    // TODO: Navigate to next step for private, brand, guest
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

      {/* Header: Back Button + Logo */}
      <SignupHeader showBackButton showLogo onBack={handleBack} />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Title */}
        <Text style={[
          styles.title,
          { fontSize: titleFontSize, marginBottom: titleMarginBottom, paddingHorizontal: horizontalPaddingWithInsets }
        ]}>Select Your Account Type</Text>

        {/* Account Type Options */}
        <View style={[styles.optionsContainer, { gap: optionsGap, paddingHorizontal: horizontalPaddingWithInsets }]}>
          {/* Guest Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              { height: optionCardHeight, padding: optionCardPadding }
            ]}
            onPress={() => handleAccountTypeSelect('guest')}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <View style={styles.optionCardContent}>
              <View style={[styles.optionIconContainer, { width: iconSize, height: iconSize }]}>
                <Image
                  source={ACCOUNT_TYPE_INFO.guest.icon}
                  style={[styles.accountIcon, { width: iconSize, height: iconSize }]}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>
                  {ACCOUNT_TYPE_INFO.guest.title}
                </Text>
                <Text style={[styles.optionDescription, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>
                  {ACCOUNT_TYPE_INFO.guest.description}
                </Text>
              </View>
              <View style={[styles.radioButtonContainer, { width: radioButtonSize, height: radioButtonSize }]}>
                <View style={[
                  selectedAccountType === 'guest' ? styles.radioButtonSelected : styles.radioButton,
                  { width: radioButtonSize, height: radioButtonSize, borderRadius: radioButtonSize / 2 }
                ]}>
                  {selectedAccountType === 'guest' && <View style={[
                    styles.radioButtonInner,
                    { width: radioButtonInnerSize, height: radioButtonInnerSize, borderRadius: radioButtonInnerSize / 2 }
                  ]} />}
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Trade Seller Option - Always shows features */}
          <TouchableOpacity
            style={[
              styles.tradeSellerCard,
              {
                minHeight: tradeCardMinHeight,
                padding: optionCardPadding,
              },
              selectedAccountType === 'trade' && styles.selectedCard,
            ]}
            onPress={() => handleAccountTypeSelect('trade')}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <View style={styles.optionCardContent}>
              <View style={[styles.optionIconContainer, { width: iconSize, height: iconSize }]}>
                <Image
                  source={ACCOUNT_TYPE_INFO.trade.icon}
                  style={[styles.accountIcon, { width: iconSize, height: iconSize }]}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>
                  {ACCOUNT_TYPE_INFO.trade.title}
                </Text>
                <Text style={[styles.optionDescription, { fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.sm }]}>
                  {ACCOUNT_TYPE_INFO.trade.description}
                </Text>
              </View>
              <View style={[styles.radioButtonContainer, { width: radioButtonSize, height: radioButtonSize }]}>
                <View style={[
                  selectedAccountType === 'trade' ? styles.radioButtonSelected : styles.radioButton,
                  { width: radioButtonSize, height: radioButtonSize, borderRadius: radioButtonSize / 2 }
                ]}>
                  {selectedAccountType === 'trade' && <View style={[
                    styles.radioButtonInner,
                    { width: radioButtonInnerSize, height: radioButtonInnerSize, borderRadius: radioButtonInnerSize / 2 }
                  ]} />}
                </View>
              </View>
            </View>

            {/* Features List - Always visible for Trade Seller */}
            {ACCOUNT_FEATURES.trade.length > 0 && (
              <View style={styles.featuresContainer}>
                {ACCOUNT_FEATURES.trade.map((feature, index) => {
                  // Determine icon color based on feature
                  let iconColor = '#6B7280'; // Default grey
                  if (feature.icon === 'checkmark.circle.fill') {
                    iconColor = '#4CAF50'; // Green
                  } else if (feature.icon === 'shield.checkmark') {
                    iconColor = '#E24242'; // Red
                  }
                  
                  return (
                    <View key={index} style={styles.featureItem}>
                      <View style={[styles.featureIconContainer, { width: featureIconSize, height: featureIconSize }]}>
                        <IconSymbol 
                          name={feature.icon} 
                          size={featureIconSize} 
                          color={iconColor}
                        />
                      </View>
                      <View style={styles.featureTextContainer}>
                        <Text style={[styles.featureText, { fontSize: featureTextFontSize }]}>
                          {feature.title} {feature.description}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </TouchableOpacity>
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
          style={[styles.continueButton, { height: buttonHeight }]}
          onPress={handleContinue}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
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
    flexGrow: 1,
    paddingBottom: SPACING.lg,
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
    flexShrink: 0,
  },
  optionCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#F3F4F6', // gray/100 - unselected
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray/200
    borderRadius: 8,
    gap: SPACING.base,
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
  },
  optionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    gap: SPACING.md,
    width: '100%',
  },
  optionIconContainer: {
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
  tradeSellerCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#F3F4F6', // gray/100 - default background
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray/200 - default border
    borderRadius: 8,
    gap: SPACING.base,
    flexDirection: 'column',
    alignItems: 'flex-start',
    alignSelf: 'center',
    flexShrink: 0,
  },
  selectedCard: {
    backgroundColor: '#DCFCE7', // green/100 - when selected
    borderColor: '#BBF7D0', // green/200 - when selected
  },
  radioButtonContainer: {
    flexShrink: 0,
  },
  radioButton: {
    borderWidth: 2,
    borderColor: '#9CA3AF', // Gray border for unselected
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderWidth: 2,
    borderColor: '#166534', // Dark green outer ring (green/800)
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7', // Light green background (green/100)
  },
  radioButtonInner: {
    backgroundColor: '#166534', // Dark green inner circle (green/800)
  },
  featuresContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 0,
    gap: SPACING.sm,
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    width: '100%',
  },
  featureIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
    width: '100%',
  },
  featureText: {
    width: '100%',
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    lineHeight: 18,
    color: '#166534', // green/800
    alignSelf: 'stretch',
    flexShrink: 1,
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#4CAF50', // Green
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
