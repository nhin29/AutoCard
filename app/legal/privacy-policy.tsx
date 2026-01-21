import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Privacy Policy Screen
 * 
 * Displays the AutoCart Privacy Policy with collapsible sections
 */
export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const [privacyPolicyExpanded, setPrivacyPolicyExpanded] = useState(true);
  const [privacyStatementExpanded, setPrivacyStatementExpanded] = useState(false);

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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* AutoCart Privacy Policy Section */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setPrivacyPolicyExpanded(!privacyPolicyExpanded)}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={styles.sectionHeaderTitle}>AutoCart Privacy Policy</Text>
          <IconSymbol
            name={privacyPolicyExpanded ? 'chevron.up' : 'chevron.down'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>

        {privacyPolicyExpanded && (
          <View style={styles.sectionContent}>
            <Text style={styles.contentText}>
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
          style={styles.sectionHeader}
          onPress={() => setPrivacyStatementExpanded(!privacyStatementExpanded)}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={styles.sectionHeaderTitle}>Our Privacy Statement</Text>
          <IconSymbol
            name={privacyStatementExpanded ? 'chevron.up' : 'chevron.down'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>

        {privacyStatementExpanded && (
          <View style={styles.sectionContent}>
            <Text style={styles.contentText}>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'system-ui',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'system-ui',
  },
  sectionContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  contentText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    lineHeight: 24,
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
