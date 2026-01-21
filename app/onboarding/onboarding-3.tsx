import { OnboardingBackground } from '@/components/onboarding/onboarding-background';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  const handleBack = () => {
    router.back();
  };

  const handleGetStarted = () => {
    // Navigate to signin page
    router.replace('/auth/signin');
  };

  return (
    <OnboardingBackground>
      <View style={styles.container}>
        <StatusBar style="dark" />
      
        {/* Top Bar with Back Button */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name="chevron.left" size={20} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <View style={[styles.contentArea, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
          <Image
            source={require('@/assets/images/onboarding-3.png')}
            style={{ width: SCREEN_WIDTH, height: undefined, aspectRatio: 1.09, transform: [{ scale: 1.1 }] }}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Illustration showing how boosting helps sell cars faster"
          />
        </View>

        {/* Bottom Section */}
        <View style={styles.onboardingContentWrapper}>
          <View style={styles.onboardingContentContainer}>
            {/* Navigation Dots */}
            <View style={styles.dotsContainer}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={[styles.dot, styles.dotActive]} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Sell Faster With Boosts</Text>

            {/* Description */}
            <Text style={styles.description}>
              Boosted ads appear at the top and reach more buyers.{'\n'}Most boosted cars sell up to 3x faster.
            </Text>

            {/* Get Started Button */}
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}>
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  contentArea: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
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
    maxWidth: (SCREEN_WIDTH - 52) / 2, // Account for padding and gap
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
    marginTop: -30,
  },
  onboardingContentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 0,
    gap: 24,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    backgroundColor: '#4CAF50',
  },
  title: {
    width: 335,
    height: 30,
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
    color: '#030712', // gray/950
    alignSelf: 'center',
  },
  description: {
    width: 335,
    minHeight: 40,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
    color: '#374151', // gray/700
    alignSelf: 'center',
  },
  getStartedButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  getStartedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
});
