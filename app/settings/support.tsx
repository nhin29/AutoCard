import { IconSymbol } from '@/components/ui/icon-symbol';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Support Screen
 * 
 * Provides support options:
 * - Report a bug
 * - Make a suggestion
 * - Other inquiries
 */
export default function SupportScreen() {
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
  const supportItemPaddingH = isSmall ? SPACING.sm : SPACING.base;
  const supportItemPaddingV = isSmall ? SPACING.sm : SPACING.base;
  const supportItemTitleFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const supportItemSubtitleFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const chevronIconSize = isSmall ? 18 : 20;

  const handleBack = () => {
    router.back();
  };

  const handleReportBug = () => {
    router.push('/settings/report-bug');
  };

  const handleMakeSuggestion = () => {
    router.push('/settings/make-suggestion');
  };

  const handleOther = () => {
    router.push('/settings/support-other');
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
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>Support</Text>
        <View style={[styles.headerSpacer, { width: backButtonSize }]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Report a bug */}
        <TouchableOpacity
          style={[styles.supportItem, { paddingHorizontal: supportItemPaddingH, paddingVertical: supportItemPaddingV }]}
          onPress={handleReportBug}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <View style={styles.supportItemContent}>
            <View style={styles.supportItemText}>
              <Text style={[styles.supportItemTitle, { fontSize: supportItemTitleFontSize }]}>Report a bug</Text>
              <Text style={[styles.supportItemSubtitle, { fontSize: supportItemSubtitleFontSize }]}>
                Tell us if something is not working as expected
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={chevronIconSize} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Make a suggestion */}
        <TouchableOpacity
          style={[styles.supportItem, { paddingHorizontal: supportItemPaddingH, paddingVertical: supportItemPaddingV }]}
          onPress={handleMakeSuggestion}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <View style={styles.supportItemContent}>
            <View style={styles.supportItemText}>
              <Text style={[styles.supportItemTitle, { fontSize: supportItemTitleFontSize }]}>Make a suggestion</Text>
              <Text style={[styles.supportItemSubtitle, { fontSize: supportItemSubtitleFontSize }]}>
                How can we make AutoCarts even better
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={chevronIconSize} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Other */}
        <TouchableOpacity
          style={[styles.supportItem, { paddingHorizontal: supportItemPaddingH, paddingVertical: supportItemPaddingV }]}
          onPress={handleOther}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <View style={styles.supportItemContent}>
            <View style={styles.supportItemText}>
              <Text style={[styles.supportItemTitle, { fontSize: supportItemTitleFontSize }]}>Other</Text>
              <Text style={[styles.supportItemSubtitle, { fontSize: supportItemSubtitleFontSize }]}>
                Any other thing you would like us to help you with
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={chevronIconSize} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingTop: 8,
  },
  supportItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    // paddingHorizontal and paddingVertical set dynamically
  },
  supportItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supportItemText: {
    flex: 1,
    marginRight: 12,
  },
  supportItemTitle: {
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'system-ui',
    marginBottom: 4,
    // fontSize set dynamically
  },
  supportItemSubtitle: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    lineHeight: 20,
    // fontSize set dynamically
  },
});
