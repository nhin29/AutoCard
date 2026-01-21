import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Report a bug */}
        <TouchableOpacity
          style={styles.supportItem}
          onPress={handleReportBug}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <View style={styles.supportItemContent}>
            <View style={styles.supportItemText}>
              <Text style={styles.supportItemTitle}>Report a bug</Text>
              <Text style={styles.supportItemSubtitle}>
                Tell us if something is not working as expected
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Make a suggestion */}
        <TouchableOpacity
          style={styles.supportItem}
          onPress={handleMakeSuggestion}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <View style={styles.supportItemContent}>
            <View style={styles.supportItemText}>
              <Text style={styles.supportItemTitle}>Make a suggestion</Text>
              <Text style={styles.supportItemSubtitle}>
                How can we make AutoCarts even better
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Other */}
        <TouchableOpacity
          style={styles.supportItem}
          onPress={handleOther}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <View style={styles.supportItemContent}>
            <View style={styles.supportItemText}>
              <Text style={styles.supportItemTitle}>Other</Text>
              <Text style={styles.supportItemSubtitle}>
                Any other thing you would like us to help you with
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
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
  content: {
    flex: 1,
    paddingTop: 8,
  },
  supportItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'system-ui',
    marginBottom: 4,
  },
  supportItemSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    lineHeight: 20,
  },
});
