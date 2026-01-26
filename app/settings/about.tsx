import { IconSymbol } from '@/components/ui/icon-symbol';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * About Screen
 * 
 * Displays information about the app including:
 * - About section
 * - Mission section
 * - Vision section
 */
export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSmall } = useResponsive();

  // Calculate responsive values
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.base;
  // Add extra padding on top of safe area insets for better spacing from status bar
  const headerPaddingTop = insets.top + (isSmall ? SPACING.md : SPACING.base);
  const headerPaddingBottom = isSmall ? SPACING.sm : SPACING.base;
  const backButtonSize = isSmall ? 40 : 44;
  const backIconSize = isSmall ? 20 : 24;
  const headerTitleFontSize = isSmall ? FONT_SIZES.md : 18;
  const scrollPaddingTop = isSmall ? SPACING.md : 24;
  const scrollPaddingBottom = isSmall ? SPACING.xl : 40;
  const sectionMarginBottom = isSmall ? SPACING.xl : 32;
  const sectionTitleFontSize = isSmall ? FONT_SIZES.lg : 20;
  const sectionTitleMarginBottom = isSmall ? SPACING.sm : 12;
  const sectionTextFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: headerPaddingTop, paddingBottom: headerPaddingBottom, paddingHorizontal: horizontalPadding }]}>
        <TouchableOpacity
          style={[styles.backButton, { width: backButtonSize, height: backButtonSize }]}
          onPress={handleBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={backIconSize} color="#000000" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>About</Text>
        <View style={[styles.headerSpacer, { width: backButtonSize }]} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding, paddingTop: scrollPaddingTop, paddingBottom: scrollPaddingBottom }]}
        showsVerticalScrollIndicator={false}>
        
        {/* About Section */}
        <View style={[styles.section, { marginBottom: sectionMarginBottom }]}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize, marginBottom: sectionTitleMarginBottom }]}>About</Text>
          <Text style={[styles.sectionText, { fontSize: sectionTextFontSize }]}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </Text>
        </View>

        {/* Mission Section */}
        <View style={[styles.section, { marginBottom: sectionMarginBottom }]}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize, marginBottom: sectionTitleMarginBottom }]}>Mission</Text>
          <Text style={[styles.sectionText, { fontSize: sectionTextFontSize }]}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </Text>
        </View>

        {/* Vision Section */}
        <View style={[styles.section, { marginBottom: sectionMarginBottom }]}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize, marginBottom: sectionTitleMarginBottom }]}>Vision</Text>
          <Text style={[styles.sectionText, { fontSize: sectionTextFontSize }]}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    // paddingTop, paddingBottom, paddingHorizontal set dynamically
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    // width and height set dynamically
  },
  headerTitle: {
    flex: 1,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  headerSpacer: {
    // width set dynamically
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingHorizontal, paddingTop, paddingBottom set dynamically
  },
  section: {
    // marginBottom set dynamically
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'system-ui',
    // fontSize and marginBottom set dynamically
  },
  sectionText: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    lineHeight: 24,
    // fontSize set dynamically
  },
});
