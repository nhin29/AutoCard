import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuthStore } from '@/stores/useAuthStore';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const { isSmall } = useResponsive();
  const { user } = useAuthStore();
  const [selectedTypes, setSelectedTypes] = useState<Set<RequestType>>(new Set());
  const [email, setEmail] = useState(user?.email || '');
  const [comment, setComment] = useState('');

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
  const privacyTextFontSize = isSmall ? FONT_SIZES.sm : 15;
  const sectionTitleFontSize = isSmall ? FONT_SIZES.md : 18;
  const sectionSubtitleFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const optionCardPadding = isSmall ? SPACING.sm : SPACING.base;
  const checkboxSize = isSmall ? 18 : 20;
  const checkboxIconSize = isSmall ? 12 : 14;
  const optionTitleFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const optionDescriptionFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const inputLabelFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const inputFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const inputHeight = isSmall ? 44 : 48;
  const sendButtonHeight = isSmall ? 48 : 52;
  const sendButtonFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;

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
      <View style={[styles.header, { paddingTop: headerPaddingTop, paddingBottom: headerPaddingBottom, paddingHorizontal: horizontalPadding }]}>
        <TouchableOpacity
          style={[styles.backButton, { width: backButtonSize, height: backButtonSize }]}
          onPress={handleBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={backIconSize} color="#000000" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>Data Request Form</Text>
        <View style={[styles.headerSpacer, { width: backButtonSize }]} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding, paddingTop: scrollPaddingTop, paddingBottom: scrollPaddingBottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {/* Privacy Statement */}
        <View style={styles.privacyStatement}>
          <Text style={[styles.privacyText, { fontSize: privacyTextFontSize }]}>
            <Text style={styles.boldText}>We take your privacy seriously.</Text> This means that we make every effort to be transparent about the data we collect and process and to champion your rights to correct, receive and / or delete the data we hold on you.
          </Text>
        </View>

        {/* Request Type Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>What can we help you with?</Text>
          <Text style={[styles.sectionSubtitle, { fontSize: sectionSubtitleFontSize }]}>Choose one of the options below:</Text>

          <View style={styles.optionsContainer}>
            {/* Correct my details */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                { padding: optionCardPadding },
                selectedTypes.has('correct') && styles.optionCardSelected,
              ]}
              onPress={() => handleRequestTypeToggle('correct')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={styles.optionContent}>
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      { width: checkboxSize, height: checkboxSize, borderRadius: checkboxSize / 5 },
                      selectedTypes.has('correct') && styles.checkboxSelected,
                    ]}>
                    {selectedTypes.has('correct') && (
                      <IconSymbol name="checkmark" size={checkboxIconSize} color="#111827" />
                    )}
                  </View>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { fontSize: optionTitleFontSize }]}>Correct my details</Text>
                  <Text style={[styles.optionDescription, { fontSize: optionDescriptionFontSize }]}>
                    Choose this option if you think that we have details about you that are not factually correct and that you are unable to change yourself.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Download my information */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                { padding: optionCardPadding },
                selectedTypes.has('download') && styles.optionCardSelected,
              ]}
              onPress={() => handleRequestTypeToggle('download')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={styles.optionContent}>
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      { width: checkboxSize, height: checkboxSize, borderRadius: checkboxSize / 5 },
                      selectedTypes.has('download') && styles.checkboxSelected,
                    ]}>
                    {selectedTypes.has('download') && (
                      <IconSymbol name="checkmark" size={checkboxIconSize} color="#111827" />
                    )}
                  </View>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { fontSize: optionTitleFontSize }]}>Download my information</Text>
                  <Text style={[styles.optionDescription, { fontSize: optionDescriptionFontSize }]}>
                    Choose this option if you want a zipped file archive of all the personal data we hold on you.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Transfer my information */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                { padding: optionCardPadding },
                selectedTypes.has('transfer') && styles.optionCardSelected,
              ]}
              onPress={() => handleRequestTypeToggle('transfer')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={styles.optionContent}>
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      { width: checkboxSize, height: checkboxSize, borderRadius: checkboxSize / 5 },
                      selectedTypes.has('transfer') && styles.checkboxSelected,
                    ]}>
                    {selectedTypes.has('transfer') && (
                      <IconSymbol name="checkmark" size={checkboxIconSize} color="#111827" />
                    )}
                  </View>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { fontSize: optionTitleFontSize }]}>Transfer my information</Text>
                  <Text style={[styles.optionDescription, { fontSize: optionDescriptionFontSize }]}>
                    Choose this option if you want a zipped file archive of all the personal data we hold on you which you can send to another company.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* I have data-related question */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                { padding: optionCardPadding },
                selectedTypes.has('question') && styles.optionCardSelected,
              ]}
              onPress={() => handleRequestTypeToggle('question')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={styles.optionContent}>
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      { width: checkboxSize, height: checkboxSize, borderRadius: checkboxSize / 5 },
                      selectedTypes.has('question') && styles.checkboxSelected,
                    ]}>
                    {selectedTypes.has('question') && (
                      <IconSymbol name="checkmark" size={checkboxIconSize} color="#111827" />
                    )}
                  </View>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { fontSize: optionTitleFontSize }]}>I have data-related question</Text>
                  <Text style={[styles.optionDescription, { fontSize: optionDescriptionFontSize }]}>
                    Choose this option if you have any personal questions about personal information and data that is not covered by any of the options above.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Identity Verification Notice */}
        <View style={styles.verificationNotice}>
          <Text style={[styles.verificationText, { fontSize: privacyTextFontSize }]}>
            To ensure that you are the owner of the data, we need to send you an email to verify your identity. Once your identity has been verified we will begin processing your request.
          </Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { fontSize: inputLabelFontSize }]}>Email Address (required)</Text>
          <TextInput
            style={[styles.textInput, { height: inputHeight, fontSize: inputFontSize }]}
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
          <Text style={[styles.inputLabel, { fontSize: inputLabelFontSize }]}>Any Comment (optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea, { fontSize: inputFontSize }]}
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
          style={[styles.sendButton, { height: sendButtonHeight }]}
          onPress={handleSendRequest}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={[styles.sendButtonText, { fontSize: sendButtonFontSize }]}>Send Request</Text>
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
    color: '#333333',
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
  privacyStatement: {
    marginBottom: 24,
  },
  privacyText: {
    fontWeight: '400',
    color: '#333333',
    fontFamily: 'system-ui',
    lineHeight: 22,
    // fontSize set dynamically
  },
  boldText: {
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#333333',
    fontFamily: 'system-ui',
    marginBottom: 8,
    // fontSize set dynamically
  },
  sectionSubtitle: {
    fontWeight: '400',
    color: '#AAAAAA',
    fontFamily: 'system-ui',
    marginBottom: 16,
    // fontSize set dynamically
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // padding set dynamically
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
    borderWidth: 2,
    borderColor: '#333333',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    // width, height, borderRadius set dynamically
  },
  checkboxSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#333333',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '700',
    color: '#333333',
    fontFamily: 'system-ui',
    marginBottom: 8,
    // fontSize set dynamically
  },
  optionDescription: {
    fontWeight: '400',
    color: '#AAAAAA',
    fontFamily: 'system-ui',
    lineHeight: 20,
    // fontSize set dynamically
  },
  verificationNotice: {
    marginBottom: 24,
  },
  verificationText: {
    fontWeight: '400',
    color: '#333333',
    fontFamily: 'system-ui',
    lineHeight: 22,
    // fontSize set dynamically
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'system-ui',
    marginBottom: 8,
    // fontSize set dynamically
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontWeight: '400',
    color: '#333333',
    fontFamily: 'system-ui',
    // height and fontSize set dynamically
  },
  textArea: {
    minHeight: 150,
    paddingTop: 12,
  },
  sendButton: {
    width: '100%',
    backgroundColor: '#28A745',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    // height set dynamically
  },
  sendButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
});
