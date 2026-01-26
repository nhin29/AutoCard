import { IconSymbol } from '@/components/ui/icon-symbol';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Privacy Policy Screen
 * 
 * Displays the AutoCart Privacy Policy with collapsible sections
 */
export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSmall } = useResponsive();
  const [privacyPolicyExpanded, setPrivacyPolicyExpanded] = useState(true);
  const [privacyStatementExpanded, setPrivacyStatementExpanded] = useState(false);

  // Calculate responsive values
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.base;
  // Add extra padding on top of safe area insets for better spacing from status bar
  const headerPaddingTop = insets.top + (isSmall ? SPACING.md : SPACING.base);
  const headerPaddingBottom = isSmall ? SPACING.sm : SPACING.base;
  const backButtonSize = isSmall ? 40 : 44;
  const backIconSize = isSmall ? 20 : 24;
  const headerTitleFontSize = isSmall ? FONT_SIZES.md : 18;
  const scrollPaddingTop = isSmall ? SPACING.md : 20;
  const scrollPaddingBottom = isSmall ? SPACING.xl : 40;
  const sectionHeaderPaddingV = isSmall ? SPACING.sm : SPACING.base;
  const sectionHeaderTitleFontSize = isSmall ? FONT_SIZES.md : 18;
  const sectionHeaderIconSize = isSmall ? 18 : 20;
  const sectionContentPaddingTop = isSmall ? SPACING.sm : SPACING.base;
  const sectionContentPaddingBottom = isSmall ? SPACING.md : 24;
  const contentTextFontSize = isSmall ? FONT_SIZES.sm : 15;

  const handleBack = () => {
    router.back();
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@autocart.ie');
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
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>Privacy Policy</Text>
        <View style={[styles.headerSpacer, { width: backButtonSize }]} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding, paddingTop: scrollPaddingTop, paddingBottom: scrollPaddingBottom }]}
        showsVerticalScrollIndicator={false}>
        
        {/* AutoCart Privacy Policy Section */}
        <TouchableOpacity
          style={[styles.sectionHeader, { paddingVertical: sectionHeaderPaddingV }]}
          onPress={() => setPrivacyPolicyExpanded(!privacyPolicyExpanded)}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={[styles.sectionHeaderTitle, { fontSize: sectionHeaderTitleFontSize }]}>AutoCart Privacy Policy</Text>
          <IconSymbol
            name={privacyPolicyExpanded ? 'chevron.up' : 'chevron.down'}
            size={sectionHeaderIconSize}
            color="#6B7280"
          />
        </TouchableOpacity>

        {privacyPolicyExpanded && (
          <View style={[styles.sectionContent, { paddingTop: sectionContentPaddingTop, paddingBottom: sectionContentPaddingBottom }]}>
            <Text style={[styles.contentText, { fontSize: contentTextFontSize }]}>
              AutoCart and its affiliates ("AutoCart," "Company", "We," "Our," or "Us") provide an online marketplace for a range of new and premium used cars from Ireland's and all of the UK's trusted Car Vendors and Dealerships. We are committed to protecting your privacy and ensuring the security of your personal information.
              {'\n\n'}
              This Privacy Policy explains how we collect, use, store, share, and protect your personal data when you visit our website, use our mobile application, or interact with our services. We are transparent about our data practices and are accountable for the personal information we collect and process.
              {'\n\n'}
              This policy applies to all services directly owned and operated by AutoCart. It does not apply to third-party websites, services, or applications that may be linked to or from our platform. We encourage you to review the privacy policies of any third-party services you access.
              {'\n\n'}
              We may share your personal data with subprocessors or partners when necessary to fulfill our services, improve our platform, or comply with legal obligations. When we share data with third parties, we ensure that they handle your information in accordance with this Privacy Policy and applicable data protection laws.
              {'\n\n'}
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at{' '}
              <Text style={styles.emailLink} onPress={handleEmailPress}>
                support@autocart.ie
              </Text>
              .
            </Text>
          </View>
        )}

        {/* Our Privacy Statement Section */}
        <TouchableOpacity
          style={[styles.sectionHeader, { paddingVertical: sectionHeaderPaddingV }]}
          onPress={() => setPrivacyStatementExpanded(!privacyStatementExpanded)}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={[styles.sectionHeaderTitle, { fontSize: sectionHeaderTitleFontSize }]}>Our Privacy Statement</Text>
          <IconSymbol
            name={privacyStatementExpanded ? 'chevron.up' : 'chevron.down'}
            size={sectionHeaderIconSize}
            color="#6B7280"
          />
        </TouchableOpacity>

        {privacyStatementExpanded && (
          <View style={[styles.sectionContent, { paddingTop: sectionContentPaddingTop, paddingBottom: sectionContentPaddingBottom }]}>
            <Text style={[styles.contentText, { fontSize: contentTextFontSize }]}>
              <Text style={styles.boldText}>1. Information We Collect</Text>
              {'\n\n'}
              We collect information that you provide directly to us, including:
              {'\n'}
              • Account information (name, email address, phone number)
              {'\n'}
              • Profile information (business details, contact information)
              {'\n'}
              • Content you post (vehicle listings, images, descriptions)
              {'\n'}
              • Communications with us (support requests, feedback)
              {'\n\n'}
              We also automatically collect certain information when you use our services:
              {'\n'}
              • Device information (device type, operating system, unique device identifiers)
              {'\n'}
              • Usage data (pages visited, features used, time spent)
              {'\n'}
              • Location data (if you enable location services)
              {'\n\n'}
              <Text style={styles.boldText}>2. How We Use Your Information</Text>
              {'\n\n'}
              We use the information we collect to:
              {'\n'}
              • Provide, maintain, and improve our services
              {'\n'}
              • Process transactions and send related information
              {'\n'}
              • Send you technical notices, updates, and support messages
              {'\n'}
              • Respond to your comments, questions, and requests
              {'\n'}
              • Monitor and analyze trends, usage, and activities
              {'\n'}
              • Detect, prevent, and address technical issues and fraudulent activity
              {'\n\n'}
              <Text style={styles.boldText}>3. Data Security</Text>
              {'\n\n'}
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
              {'\n\n'}
              <Text style={styles.boldText}>4. Your Rights</Text>
              {'\n\n'}
              You have the right to:
              {'\n'}
              • Access your personal data
              {'\n'}
              • Correct inaccurate data
              {'\n'}
              • Request deletion of your data
              {'\n'}
              • Object to processing of your data
              {'\n'}
              • Request data portability
              {'\n'}
              • Withdraw consent where processing is based on consent
              {'\n\n'}
              <Text style={styles.boldText}>5. Data Retention</Text>
              {'\n\n'}
              We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              {'\n\n'}
              <Text style={styles.boldText}>6. Changes to This Policy</Text>
              {'\n\n'}
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.
            </Text>
          </View>
        )}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    // paddingVertical set dynamically
  },
  sectionHeaderTitle: {
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  sectionContent: {
    // paddingTop and paddingBottom set dynamically
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
  emailLink: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
});
