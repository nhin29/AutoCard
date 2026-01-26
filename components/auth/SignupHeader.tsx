import { IconSymbol } from '@/components/ui/icon-symbol';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SignupHeaderProps {
  /**
   * Show back button on the left
   */
  showBackButton?: boolean;
  /**
   * Show logo in the center
   */
  showLogo?: boolean;
  /**
   * Show title text in the center (alternative to logo)
   */
  title?: string;
  /**
   * Custom back button handler (defaults to router.back())
   */
  onBack?: () => void;
  /**
   * Disable back button (useful during loading states)
   */
  disableBack?: boolean;
}

/**
 * Reusable header component for signup flow pages.
 * 
 * Supports:
 * - Logo only (centered) - for step 1
 * - Back button + Logo - for steps 2 and 4
 * - Back button + Title - for step 3
 * 
 * Handles proper top padding with safe area insets and responsive sizing.
 */
export function SignupHeader({
  showBackButton = false,
  showLogo = false,
  title,
  onBack,
  disableBack = false,
}: SignupHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSmall, width: screenWidth } = useResponsive();

  // Calculate responsive values with safe area insets
  const horizontalPadding = isSmall ? SPACING.base : SPACING.lg;
  const horizontalPaddingWithInsets = Math.max(horizontalPadding, insets.left, insets.right);
  // Add extra top padding for better spacing from screen edge
  const topPadding = Math.max(insets.top + (isSmall ? SPACING.base : SPACING.lg), isSmall ? SPACING.xl : SPACING.xxl);
  const logoWidth = isSmall ? Math.min(screenWidth * 0.5, 160) : Math.min(screenWidth * 0.5, 200);
  const logoHeight = (logoWidth * 60) / 200; // Maintain aspect ratio
  const backIconSize = isSmall ? 18 : 20;
  const titleFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.lg;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: topPadding,
          paddingHorizontal: horizontalPaddingWithInsets,
        },
      ]}>
      {/* Left: Back button or spacer */}
      {showBackButton ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={disableBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={backIconSize} color="#000000" />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSpacer} />
      )}

      {/* Center: Logo or Title */}
      <View style={styles.centerContainer}>
        {showLogo && (
          <Image
            source={require('@/assets/images/auth-logo.png')}
            style={[styles.logoImage, { width: logoWidth, height: logoHeight }]}
            resizeMode="contain"
          />
        )}
        {title && (
          <Text
            style={[styles.headerTitle, { fontSize: titleFontSize }]}
            numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>

      {/* Right: Spacer to balance layout */}
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.base,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    // Width and height are set dynamically
  },
  headerTitle: {
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'system-ui',
    paddingHorizontal: SPACING.sm,
  },
  headerSpacer: {
    width: 40,
  },
});
