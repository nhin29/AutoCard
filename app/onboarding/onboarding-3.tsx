import { OnboardingBackground } from '@/components/onboarding/onboarding-background';
import { OnboardingContent } from '@/components/onboarding/onboarding-content';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useResponsive } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Third Onboarding Screen
 * 
 * Features:
 * - Back button in header
 * - Car advertisement cards
 * - Featured car ad with boost button
 * - Navigation dots (third dot active)
 * - Title, description, and Get Started button
 */
export default function OnboardingScreen3() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height } = useWindowDimensions();
  const { isSmall, isMedium } = useResponsive();

  const handleBack = () => {
    router.back();
  };

  const handleGetStarted = () => {
    // Navigate to signin page
    router.replace('/auth/signin');
  };

  // Calculate responsive sizes
  const backIconSize = isSmall ? 18 : 20;
  const topBarPadding = isSmall ? 8 : 10;
  const horizontalPadding = isSmall ? 16 : 20;
  const buttonFontSize = isSmall ? 14 : 16;
  const buttonHeight = isSmall ? 44 : 52;
  const buttonPaddingVertical = isSmall ? 12 : 14;
  const bottomPadding = isSmall ? 20 : 24;
  
  // Calculate image size - use percentage of screen height
  const imageHeight = Math.min(height * 0.4, height * 0.45); // 40-45% of screen height

  return (
    <OnboardingBackground>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar style="dark" />
      
        {/* Top Bar with Back Button */}
        <View style={[styles.topBar, { paddingHorizontal: horizontalPadding, paddingTop: topBarPadding }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name="chevron.left" size={backIconSize} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Main Content Area - Takes available space */}
        <View style={[styles.contentArea, { paddingTop: isSmall ? 12 : 20 }]}>
          <Image
            source={require('@/assets/images/onboarding-3.png')}
            style={[styles.carImage, { height: imageHeight }]}
            resizeMode="cover"
            accessible={true}
            accessibilityLabel="Illustration showing how boosting helps sell cars faster"
          />
        </View>

        {/* Bottom Section - Anchored to bottom */}
        <View style={[styles.onboardingContentWrapper, { paddingBottom: bottomPadding }]}>
          <OnboardingContent
            activeDotIndex={2}
            title="Sell Faster With Boosts"
            description="Boosted ads appear at the top and reach more buyers. Most boosted cars sell up to 3x faster.">
            <TouchableOpacity
              style={[styles.getStartedButton, { minHeight: buttonHeight, paddingVertical: buttonPaddingVertical }]}
              onPress={handleGetStarted}>
              <Text style={[styles.getStartedButtonText, { fontSize: buttonFontSize }]}>Get Started</Text>
            </TouchableOpacity>
          </OnboardingContent>
        </View>
      </View>
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between', // Push content to top and bottom
    paddingHorizontal: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    flexShrink: 0, // Don't shrink the top bar
  },
  backButton: {
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  contentArea: {
    flex: 1, // Take available space between top bar and bottom content
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingBottom: 0,
    justifyContent: 'center',
    alignItems: 'stretch', // Stretch to full width
  },
  carImage: {
    width: '100%',
    alignSelf: 'stretch', // Ensure full width
  },
  cardsGrid: {
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  placeholderCard: {
    flex: 1,
    height: 120,
    backgroundColor: '#F3F4F6', // Light grey placeholder
    borderRadius: 12,
    maxWidth: '48%', // Responsive width for 2-column layout
  },
  featuredCardContainer: {
    position: 'relative',
    marginVertical: 8,
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  carImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB', // Placeholder for car image
  },
  carImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D1D5DB',
  },
  carImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  daysLeftTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FCD34D', // Yellow
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  daysLeftText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  carName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  boostButton: {
    position: 'absolute',
    bottom: -20,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#9333EA', // Purple
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  onboardingContentWrapper: {
    flexShrink: 0, // Don't shrink, keep at bottom
  },
  getStartedButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  getStartedButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    flexShrink: 1,
  },
});
