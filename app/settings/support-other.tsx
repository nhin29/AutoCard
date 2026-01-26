import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuthStore } from '@/stores/useAuthStore';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import * as DocumentPicker from 'expo-document-picker';
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

/**
 * Support Other Screen
 * 
 * Allows users to submit other support inquiries with email, message, and optional document upload
 */
export default function SupportOtherScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSmall } = useResponsive();
  const { user } = useAuthStore();
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);

  // Calculate responsive values (same as report-bug)
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.base;
  // Add extra padding on top of safe area insets for better spacing from status bar
  const headerPaddingTop = insets.top + (isSmall ? SPACING.md : SPACING.base);
  const headerPaddingBottom = isSmall ? SPACING.sm : SPACING.base;
  const backButtonSize = isSmall ? 40 : 44;
  const backIconSize = isSmall ? 20 : 24;
  const headerTitleFontSize = isSmall ? FONT_SIZES.md : 18;
  const scrollPaddingTop = isSmall ? SPACING.md : 24;
  const scrollPaddingBottom = isSmall ? SPACING.xl : 40;
  const inputLabelFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const inputFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const inputHeight = isSmall ? 44 : 48;
  const uploadAreaPadding = isSmall ? SPACING.md : 24;
  const uploadAreaMinHeight = isSmall ? 160 : 200;
  const uploadIconSize = isSmall ? 24 : 32;
  const uploadIconContainerSize = isSmall ? 48 : 64;
  const uploadTextFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const uploadSubtextFontSize = isSmall ? FONT_SIZES.xs : 12;
  const browseButtonPaddingH = isSmall ? SPACING.sm : SPACING.base;
  const browseButtonPaddingV = isSmall ? 6 : 8;
  const browseButtonFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const uploadedFileIconSize = isSmall ? 32 : 40;
  const uploadedFileNameFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const removeFileButtonSize = isSmall ? 20 : 24;
  const removeFileIconSize = isSmall ? 12 : 16;
  const sendButtonHeight = isSmall ? 48 : 52;
  const sendButtonFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;

  const handleBack = () => {
    router.back();
  };

  const handleBrowseFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf', 'image/jpeg'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        // Check file size (50MB limit)
        if (file.size && file.size > 50 * 1024 * 1024) {
          Alert.alert('File Too Large', 'File size must be less than 50MB');
          return;
        }
        setUploadedFile(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  const handleSend = () => {
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

    if (!message.trim()) {
      Alert.alert('Message Required', 'Please enter your message.');
      return;
    }

    // TODO: Implement actual support request submission
    Alert.alert(
      'Request Sent',
      'Thank you for contacting us. We will get back to you as soon as possible.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const getFileName = () => {
    if (uploadedFile && !uploadedFile.canceled && uploadedFile.assets && uploadedFile.assets.length > 0) {
      return uploadedFile.assets[0].name;
    }
    return null;
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
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>Other</Text>
        <View style={[styles.headerSpacer, { width: backButtonSize }]} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding, paddingTop: scrollPaddingTop, paddingBottom: scrollPaddingBottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {/* Email Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { fontSize: inputLabelFontSize }]}>Email Address</Text>
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

        {/* Message Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { fontSize: inputLabelFontSize }]}>Message</Text>
          <TextInput
            style={[styles.textInput, styles.textArea, { fontSize: inputFontSize }]}
            value={message}
            onChangeText={setMessage}
            placeholder="How can we help you?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        {/* Upload Document Section */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { fontSize: inputLabelFontSize }]}>Upload Document</Text>
          <TouchableOpacity
            style={[styles.uploadArea, { padding: uploadAreaPadding, minHeight: uploadAreaMinHeight }]}
            onPress={handleBrowseFiles}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            {uploadedFile && !uploadedFile.canceled ? (
              <View style={styles.uploadedFileContainer}>
                <IconSymbol name="folder.fill" size={uploadedFileIconSize} color="#4CAF50" />
                <Text style={[styles.uploadedFileName, { fontSize: uploadedFileNameFontSize }]} numberOfLines={1}>
                  {getFileName()}
                </Text>
                <TouchableOpacity
                  style={[styles.removeFileButton, { width: removeFileButtonSize, height: removeFileButtonSize, borderRadius: removeFileButtonSize / 2 }]}
                  onPress={() => setUploadedFile(null)}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <IconSymbol name="xmark" size={removeFileIconSize} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={[styles.uploadIconContainer, { width: uploadIconContainerSize, height: uploadIconContainerSize, borderRadius: uploadIconContainerSize / 2 }]}>
                  <IconSymbol name="arrow.up" size={uploadIconSize} color="#9CA3AF" />
                </View>
                <Text style={[styles.uploadText, { fontSize: uploadTextFontSize }]}>Choose a file</Text>
                <Text style={[styles.uploadSubtext, { fontSize: uploadSubtextFontSize }]}>txt. docx. pdf. jpeg. Up to 50MB</Text>
                <TouchableOpacity
                  style={[styles.browseButton, { paddingHorizontal: browseButtonPaddingH, paddingVertical: browseButtonPaddingV }]}
                  onPress={handleBrowseFiles}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <Text style={[styles.browseButtonText, { fontSize: browseButtonFontSize }]}>Browse files</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.sendButton, { height: sendButtonHeight }]}
          onPress={handleSend}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={[styles.sendButtonText, { fontSize: sendButtonFontSize }]}>Send</Text>
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
    backgroundColor: '#FFFFFF',
    // paddingHorizontal, paddingTop, paddingBottom set dynamically
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'system-ui',
    marginBottom: 8,
    // fontSize set dynamically
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontWeight: '400',
    color: '#111827',
    fontFamily: 'system-ui',
    // height and fontSize set dynamically
  },
  textArea: {
    minHeight: 150,
    paddingTop: 12,
  },
  uploadArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // padding and minHeight set dynamically
  },
  uploadIconContainer: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    // width, height, borderRadius set dynamically
  },
  uploadText: {
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'system-ui',
    marginBottom: 4,
    // fontSize set dynamically
  },
  uploadSubtext: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    marginBottom: 16,
    // fontSize set dynamically
  },
  browseButton: {
    backgroundColor: '#9CA3AF',
    borderRadius: 6,
    // paddingHorizontal and paddingVertical set dynamically
  },
  browseButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  uploadedFileContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  uploadedFileName: {
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'system-ui',
    marginTop: 8,
    maxWidth: '80%',
    // fontSize set dynamically
  },
  removeFileButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    // width, height, borderRadius set dynamically
  },
  sendButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
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
