import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Scan Screen
 * 
 * Allows users to scan vehicle registration plates or place ads manually.
 * Features a camera scanner for automatic vehicle detail extraction.
 */

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSmall, width: screenWidth } = useResponsive();
  const { height: screenHeight } = useWindowDimensions();

  // Calculate responsive values
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.base;
  // Add extra padding on top of safe area insets for better spacing from status bar
  const headerPaddingTop = insets.top + (isSmall ? SPACING.md : SPACING.base);
  const headerPaddingBottom = isSmall ? SPACING.sm : SPACING.base;
  const headerTitleFontSize = isSmall ? FONT_SIZES.md : 18;
  const contentPaddingH = isSmall ? SPACING.md : 24;
  const illustrationWidth = isSmall ? Math.min(screenWidth * 0.7, 250) : 300;
  const illustrationHeight = (illustrationWidth * 220) / 300; // Maintain aspect ratio
  const illustrationMarginBottom = isSmall ? SPACING.xl : 40;
  const descriptionFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const descriptionMarginBottom = isSmall ? SPACING.xl * 1.5 : 60;
  const buttonHeight = isSmall ? 48 : 56;
  const buttonFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const buttonGap = isSmall ? SPACING.sm : SPACING.base;

  const handleOpenCamera = () => {
    router.push('/scanner/camera-scanner');
  };

  const handlePlaceAdManually = () => {
    router.push('/ads/place-ad');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: headerPaddingTop, paddingBottom: headerPaddingBottom, paddingHorizontal: horizontalPadding }]}>
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>Reg Scanner</Text>
      </View>

      {/* Main Content */}
      <View style={[styles.content, { paddingHorizontal: contentPaddingH }]}>
        {/* Illustration */}
        <View style={[styles.illustrationContainer, { marginBottom: illustrationMarginBottom }]}>
          <Image
            source={require('@/assets/images/scan.png')}
            style={[styles.illustrationImage, { width: illustrationWidth, height: illustrationHeight }]}
            resizeMode="contain"
          />
        </View>

        {/* Description */}
        <Text style={[styles.description, { fontSize: descriptionFontSize, marginBottom: descriptionMarginBottom }]}>
          This option allows you to check your vehicle{'\n'}details before purchasing
        </Text>

        {/* Buttons */}
        <View style={[styles.buttonsContainer, { gap: buttonGap }]}>
          <TouchableOpacity
            style={[styles.primaryButton, { height: buttonHeight }]}
            onPress={handleOpenCamera}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { fontSize: buttonFontSize }]}>Open Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { height: buttonHeight }]}
            onPress={handlePlaceAdManually}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { fontSize: buttonFontSize }]}>Place Ad Manually</Text>
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
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    // paddingTop, paddingBottom, paddingHorizontal set dynamically
  },
  headerTitle: {
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // paddingHorizontal set dynamically
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom set dynamically
  },
  illustrationImage: {
    // width and height set dynamically
  },
  description: {
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
    textAlign: 'center',
    lineHeight: 24,
    // fontSize and marginBottom set dynamically
  },
  buttonsContainer: {
    width: '100%',
    // gap set dynamically
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // height set dynamically
  },
  primaryButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    // height set dynamically
  },
  secondaryButtonText: {
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
});
