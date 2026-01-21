import { OnboardingBackground } from '@/components/onboarding/onboarding-background';
import { OnboardingContent } from '@/components/onboarding/onboarding-content';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  return (
    <OnboardingBackground>
      <View style={styles.container}>
        <StatusBar style="dark" />
      
      {/* Top Bar with Skip Button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
          <IconSymbol name="chevron.right" size={16} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Central Graphic */}
      <View style={styles.graphicContainer}>
        <Image
          source={require('@/assets/images/onboarding-1.png')}
          style={styles.graphicImage}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Section */}
      <View style={styles.onboardingContentWrapper}>
      <OnboardingContent
        activeDotIndex={0}
        title="Scan a Plate. Post in Seconds"
        description="Just scan a car&apos;s registration number and we automatically fill in all the vehicle details for you.">
        <TouchableOpacity
          style={[styles.guestButton, { backgroundColor: '#E5E7EB' }]}
          onPress={handleBrowseAsGuest}
          activeOpacity={0.8}>
          <Text style={styles.guestButtonText}>Browse as Guest</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
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
    paddingTop: 50, // Space for status bar
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  skipText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },
  graphicContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 0, // Reduce bottom padding to move content up
    minHeight: 250,
  },
  onboardingContentWrapper: {
    marginTop: -30, // Move onboarding content up
  },
  graphicImage: {
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.9,
    height: 250,
  },
  guestButton: {
    flex: 1,
    backgroundColor: '#E5E7EB', // grey/200
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
});
