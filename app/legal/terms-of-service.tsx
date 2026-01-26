import { IconSymbol } from '@/components/ui/icon-symbol';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Terms of Service Screen
 * 
 * Displays the AutoCart Terms of Service document
 */
export default function TermsOfServiceScreen() {
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
  const mainHeadingFontSize = isSmall ? FONT_SIZES.xl : 22;
  const mainHeadingMarginBottom = isSmall ? SPACING.md : 20;
  const contentTextFontSize = isSmall ? FONT_SIZES.sm : 15;

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
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>Terms of service</Text>
        <View style={[styles.headerSpacer, { width: backButtonSize }]} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding, paddingTop: scrollPaddingTop, paddingBottom: scrollPaddingBottom }]}
        showsVerticalScrollIndicator={false}>
        
        {/* Main Heading */}
        <Text style={[styles.mainHeading, { fontSize: mainHeadingFontSize, marginBottom: mainHeadingMarginBottom }]}>AutoCart Terms of Service</Text>

        {/* Terms Content */}
        <View style={styles.contentSection}>
          <Text style={[styles.contentText, { fontSize: contentTextFontSize }]}>
            <Text style={styles.boldText}>Effective date: Sept. 19, 2024</Text>
            {'\n\n'}
            AutoCart and its affiliates ("AutoCart," "Company", "We," "Our," or "Us") provide an online marketplace for a range of new and premium used cars from Ireland's and all of the UK's trusted Car Vendors and Dealerships. Our platform is designed to allow users to carry out swift & secure car deals — whichever side of the transaction they're on (dealer or customer).
            {'\n\n'}
            We encourage you to read these Terms of Service (the "Terms") together with the policies outlined on the website (collectively, "Policies") carefully before the use of the AutoCart website (the "Site"), or the AutoCart Application (the "App") or any other online presence that links to this Terms of Service (together, "Services").
            {'\n\n'}
            By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of these Terms, then you may not access the Services.
            {'\n\n'}
            <Text style={styles.boldText}>1. Definitions</Text>
            {'\n\n'}
            "You" or "your" or "user" means anyone with access to our services in any form. Users acting in a commercial or professional capacity and offering goods to consumers on AutoCart as part of their trade or business are classified as "Dealer(s)" or "Advertiser(s)".
            {'\n\n'}
            <Text style={styles.boldText}>2. Use of Services</Text>
            {'\n\n'}
            You may use our Services only for lawful purposes and in accordance with these Terms. You agree not to use the Services:
            {'\n'}
            • In any way that violates any applicable national or international law or regulation.
            {'\n'}
            • To transmit, or procure the sending of, any advertising or promotional material without our prior written consent.
            {'\n'}
            • To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.
            {'\n\n'}
            <Text style={styles.boldText}>3. User Accounts</Text>
            {'\n\n'}
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            {'\n\n'}
            <Text style={styles.boldText}>4. Content and Intellectual Property</Text>
            {'\n\n'}
            The Services and their original content, features, and functionality are and will remain the exclusive property of AutoCart and its licensors. The Services are protected by copyright, trademark, and other laws.
            {'\n\n'}
            <Text style={styles.boldText}>5. User-Generated Content</Text>
            {'\n\n'}
            You retain ownership of any content you submit, post, or display on or through the Services. By submitting content, you grant AutoCart a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute such content.
            {'\n\n'}
            <Text style={styles.boldText}>6. Prohibited Uses</Text>
            {'\n\n'}
            You may not use our Services:
            {'\n'}
            • To engage in any fraudulent activity.
            {'\n'}
            • To upload or transmit viruses or any other type of malicious code.
            {'\n'}
            • To collect or track the personal information of others.
            {'\n'}
            • To spam, phish, pharm, pretext, spider, crawl, or scrape.
            {'\n\n'}
            <Text style={styles.boldText}>7. Termination</Text>
            {'\n\n'}
            We may terminate or suspend your account and bar access to the Services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            {'\n\n'}
            <Text style={styles.boldText}>8. Disclaimer</Text>
            {'\n\n'}
            The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, AutoCart excludes all representations, warranties, and conditions relating to our Services and the use of this Service.
            {'\n\n'}
            <Text style={styles.boldText}>9. Limitation of Liability</Text>
            {'\n\n'}
            In no event shall AutoCart, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            {'\n\n'}
            <Text style={styles.boldText}>10. Governing Law</Text>
            {'\n\n'}
            These Terms shall be interpreted and governed by the laws of Ireland, without regard to its conflict of law provisions.
            {'\n\n'}
            <Text style={styles.boldText}>11. Changes to Terms</Text>
            {'\n\n'}
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            {'\n\n'}
            <Text style={styles.boldText}>12. Contact Information</Text>
            {'\n\n'}
            If you have any questions about these Terms, please contact us through our support channels.
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
  mainHeading: {
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'system-ui',
    // fontSize and marginBottom set dynamically
  },
  contentSection: {
    marginBottom: 20,
  },
  contentText: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    lineHeight: 24,
    // fontSize set dynamically
  },
  boldText: {
    fontWeight: '700',
    color: '#111827',
  },
});
