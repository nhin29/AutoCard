import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType>('trade'); // Auto-select Trade Seller
  
  const accountInfo = ACCOUNT_TYPE_INFO[selectedAccountType];
  const features = ACCOUNT_FEATURES[selectedAccountType] || [];

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
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header: Back Button + Logo */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={20} color="#000000" />
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

      {/* Title */}
      <Text style={styles.title}>Select Your Account Type</Text>

      {/* Account Type Options */}
      <View style={styles.optionsContainer}>
          {/* Guest Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleAccountTypeSelect('guest')}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <View style={styles.optionCardContent}>
              <View style={styles.optionIconContainer}>
                <Image
                  source={ACCOUNT_TYPE_INFO.guest.icon}
                  style={styles.accountIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>
                  {ACCOUNT_TYPE_INFO.guest.title}
                </Text>
                <Text style={styles.optionDescription}>
                  {ACCOUNT_TYPE_INFO.guest.description}
                </Text>
              </View>
              <View style={styles.radioButtonContainer}>
                <View style={selectedAccountType === 'guest' ? styles.radioButtonSelected : styles.radioButton}>
                  {selectedAccountType === 'guest' && <View style={styles.radioButtonInner} />}
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Trade Seller Option - Always shows features */}
          <TouchableOpacity
            style={[
              styles.tradeSellerCard,
              selectedAccountType === 'trade' && styles.selectedCard,
            ]}
            onPress={() => handleAccountTypeSelect('trade')}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <View style={styles.optionCardContent}>
              <View style={styles.optionIconContainer}>
                <Image
                  source={ACCOUNT_TYPE_INFO.trade.icon}
                  style={styles.accountIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>
                  {ACCOUNT_TYPE_INFO.trade.title}
                </Text>
                <Text style={styles.optionDescription}>
                  {ACCOUNT_TYPE_INFO.trade.description}
                </Text>
              </View>
              <View style={styles.radioButtonContainer}>
                <View style={selectedAccountType === 'trade' ? styles.radioButtonSelected : styles.radioButton}>
                  {selectedAccountType === 'trade' && <View style={styles.radioButtonInner} />}
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
                      <View style={styles.featureIconContainer}>
                        <IconSymbol 
                          name={feature.icon} 
                          size={20} 
                          color={iconColor}
                        />
                      </View>
                      <View style={styles.featureTextContainer}>
                        <Text style={styles.featureText}>
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

      {/* Bottom Section - Fixed at bottom */}
      <View style={styles.bottomSection}>
        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
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
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'system-ui',
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  optionCard: {
    width: '100%',
    maxWidth: 380,
    minHeight: 68,
    backgroundColor: '#F3F4F6', // gray/100 - unselected
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray/200
    borderRadius: 8,
    padding: 16,
    gap: 16,
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
  },
  optionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    gap: 12,
    width: '100%',
    height: 36,
  },
  optionIconContainer: {
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
  tradeSellerCard: {
    width: '100%',
    maxWidth: 380,
    height: 394, // Always expanded height to show all features
    backgroundColor: '#F3F4F6', // gray/100 - default background
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray/200 - default border
    borderRadius: 8,
    padding: 16,
    gap: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    alignSelf: 'center',
  },
  selectedCard: {
    backgroundColor: '#DCFCE7', // green/100 - when selected
    borderColor: '#BBF7D0', // green/200 - when selected
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
    borderColor: '#9CA3AF', // Gray border for unselected
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#166534', // Dark green outer ring (green/800)
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7', // Light green background (green/100)
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#166534', // Dark green inner circle (green/800)
  },
  featuresContainer: {
    width: '100%',
    height: 310,
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 0,
    gap: 8,
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    width: '100%',
  },
  featureIconContainer: {
    width: 20,
    height: 20,
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
    fontSize: 14,
    lineHeight: 18,
    color: '#166534', // green/800
    alignSelf: 'stretch',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#4CAF50', // Green
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
