import { OnboardingBackground } from '@/components/onboarding/onboarding-background';
import { OnboardingContent } from '@/components/onboarding/onboarding-content';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useResponsive } from '@/utils/responsive';

/**
 * First Onboarding Screen
 * 
 * Features:
 * - Skip button in top right
 * - Central graphic with cars and smartphone
 * - Title and description
 * - Navigation dots
 * - Browse as Guest and Next buttons
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { isSmall, isMedium } = useResponsive();

  const handleSkip = () => {
    // Navigate to auth page
    router.replace('/auth/signin');
  };

  const handleBrowseAsGuest = () => {
    // Navigate to main app as guest
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    // Navigate to second onboarding screen
    router.push('/onboarding/onboarding-2');
  };

  // Calculate responsive sizes based on screen dimensions
  const skipFontSize = isSmall ? 14 : 15;
  const skipIconSize = isSmall ? 14 : 16;
  // Use percentage-based height but cap it appropriately for small screens
  const graphicHeight = Math.min(height * 0.35, height * 0.4); // ~35-40% of screen height as per image
  const topBarPadding = isSmall ? 8 : 10;
  const horizontalPadding = isSmall ? 16 : 20;
  const buttonFontSize = isSmall ? 14 : 16; // Reduced on small phones
  const buttonHeight = isSmall ? 44 : 52; // Reduced height on small phones
  const buttonPaddingVertical = isSmall ? 12 : 14; // Reduced padding on small phones
  const bottomPadding = isSmall ? 20 : 24; // Bottom padding for buttons

  return (
    <OnboardingBackground>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar style="dark" />
      
        {/* Top Bar with Skip Button */}
        <View style={[styles.topBar, { paddingHorizontal: horizontalPadding, paddingTop: topBarPadding }]}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={[styles.skipText, { fontSize: skipFontSize }]}>Skip</Text>
            <IconSymbol name="chevron.right" size={skipIconSize} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Central Graphic - Takes available space */}
        <View style={styles.graphicContainer}>
          <Image
            source={require('@/assets/images/onboarding-1.png')}
            style={[styles.graphicImage, { height: graphicHeight }]}
            resizeMode="contain"
          />
        </View>

        {/* Bottom Section - Anchored to bottom */}
        <View style={[styles.onboardingContentWrapper, { paddingBottom: bottomPadding }]}>
          <OnboardingContent
            activeDotIndex={0}
            title="Scan a Plate. Post in Seconds"
            description="Just scan a car&apos;s registration number and we automatically fill in all the vehicle details for you.">
            <TouchableOpacity
              style={[styles.guestButton, { backgroundColor: '#E5E7EB', minHeight: buttonHeight, paddingVertical: buttonPaddingVertical }]}
              onPress={handleBrowseAsGuest}
              activeOpacity={0.8}>
              <Text style={[styles.guestButtonText, { fontSize: buttonFontSize }]}>Browse as Guest</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextButton, { minHeight: buttonHeight, paddingVertical: buttonPaddingVertical }]}
              onPress={handleNext}>
              <Text style={[styles.nextButtonText, { fontSize: buttonFontSize }]}>Next</Text>
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
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    flexShrink: 0, // Don't shrink the top bar
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  skipText: {
    fontWeight: '400',
    color: '#000000',
    flexShrink: 1,
  },
  graphicContainer: {
    flex: 1, // Take available space between top bar and bottom content
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 200, // Minimum height for illustration
  },
  onboardingContentWrapper: {
    flexShrink: 0, // Don't shrink, keep at bottom
  },
  graphicImage: {
    width: '100%',
    maxWidth: '90%',
  },
  guestButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  guestButtonText: {
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    flexShrink: 1,
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  nextButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    flexShrink: 1,
  },
});
