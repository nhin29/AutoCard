import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type RequestType = 'correct' | 'download' | 'transfer' | 'question';

/**
 * Data Request Form Screen
 * 
 * Allows users to request data corrections, downloads, transfers, or ask data-related questions
 * Each checkbox is individual - users can select multiple options
 */
export default function DataRequestScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedTypes, setSelectedTypes] = useState<Set<RequestType>>(new Set());
  const [email, setEmail] = useState(user?.email || '');
  const [comment, setComment] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleRequestTypeToggle = (type: RequestType) => {
    setSelectedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleSendRequest = () => {
    if (selectedTypes.size === 0) {
      Alert.alert('Selection Required', 'Please select what we can help you with.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // TODO: Implement actual data request submission
    Alert.alert(
      'Request Submitted',
      'We have received your data request. You will receive a verification email shortly to confirm your identity.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Request Form</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {/* Privacy Statement */}
        <View style={styles.privacyStatement}>
          <Text style={styles.privacyText}>
            <Text style={styles.boldText}>We take your privacy seriously.</Text> This means that we make every effort to be transparent about the data we collect and process and to champion your rights to correct, receive and / or delete the data we hold on you.
          </Text>
        </View>

        {/* Request Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What can we help you with?</Text>
          <Text style={styles.sectionSubtitle}>Choose one of the options below:</Text>

          <View style={styles.optionsContainer}>
            {/* Correct my details */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedTypes.has('correct') && styles.optionCardSelected,
              ]}
              onPress={() => handleRequestTypeToggle('correct')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={styles.optionContent}>
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedTypes.has('correct') && styles.checkboxSelected,
                    ]}>
                    {selectedTypes.has('correct') && (
                      <IconSymbol name="checkmark" size={14} color="#111827" />
                    )}
                  </View>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Correct my details</Text>
                  <Text style={styles.optionDescription}>
                    Choose this option if you think that we have details about you that are not factually correct and that you are unable to change yourself.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Download my information */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedTypes.has('download') && styles.optionCardSelected,
              ]}
              onPress={() => handleRequestTypeToggle('download')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={styles.optionContent}>
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedTypes.has('download') && styles.checkboxSelected,
                    ]}>
                    {selectedTypes.has('download') && (
                      <IconSymbol name="checkmark" size={14} color="#111827" />
                    )}
                  </View>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Download my information</Text>
                  <Text style={styles.optionDescription}>
                    Choose this option if you want a zipped file archive of all the personal data we hold on you.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Transfer my information */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedTypes.has('transfer') && styles.optionCardSelected,
              ]}
              onPress={() => handleRequestTypeToggle('transfer')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={styles.optionContent}>
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedTypes.has('transfer') && styles.checkboxSelected,
                    ]}>
                    {selectedTypes.has('transfer') && (
                      <IconSymbol name="checkmark" size={14} color="#111827" />
                    )}
                  </View>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Transfer my information</Text>
                  <Text style={styles.optionDescription}>
                    Choose this option if you want a zipped file archive of all the personal data we hold on you which you can send to another company.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* I have data-related question */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedTypes.has('question') && styles.optionCardSelected,
              ]}
              onPress={() => handleRequestTypeToggle('question')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={styles.optionContent}>
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedTypes.has('question') && styles.checkboxSelected,
                    ]}>
                    {selectedTypes.has('question') && (
                      <IconSymbol name="checkmark" size={14} color="#111827" />
                    )}
                  </View>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>I have data-related question</Text>
                  <Text style={styles.optionDescription}>
                    Choose this option if you have any personal questions about personal information and data that is not covered by any of the options above.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Identity Verification Notice */}
        <View style={styles.verificationNotice}>
          <Text style={styles.verificationText}>
            To ensure that you are the owner of the data, we need to send you an email to verify your identity. Once your identity has been verified we will begin processing your request.
          </Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Email Address (required)</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email address"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Comment Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Any Comment (optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={comment}
            onChangeText={setComment}
            placeholder="Enter any additional comments or details..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Send Request Button */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendRequest}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={styles.sendButtonText}>Send Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    color: '#333333',
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  privacyStatement: {
    marginBottom: 24,
  },
  privacyText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#333333',
    fontFamily: 'system-ui',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    fontFamily: 'system-ui',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#AAAAAA',
    fontFamily: 'system-ui',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionCardSelected: {
    backgroundColor: '#F5F5F5',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxContainer: {
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#333333',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#333333',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    fontFamily: 'system-ui',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#AAAAAA',
    fontFamily: 'system-ui',
    lineHeight: 20,
  },
  verificationNotice: {
    marginBottom: 24,
  },
  verificationText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#333333',
    fontFamily: 'system-ui',
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'system-ui',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
    fontFamily: 'system-ui',
  },
  textArea: {
    minHeight: 150,
    paddingTop: 12,
  },
  sendButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#28A745',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
});
