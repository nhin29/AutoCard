import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuthStore } from '@/stores/useAuthStore';
import * as DocumentPicker from 'expo-document-picker';
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

/**
 * Make a Suggestion Screen
 * 
 * Allows users to make suggestions with email, message, and optional document upload
 */
export default function MakeSuggestionScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);

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
      console.error('[MakeSuggestion] File picker error:', error);
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
      Alert.alert('Message Required', 'Please enter your suggestion.');
      return;
    }

    // TODO: Implement actual suggestion submission
    Alert.alert(
      'Suggestion Sent',
      'Thank you for your suggestion. We appreciate your feedback and will review it.',
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Make a suggestion</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {/* Email Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Email Address</Text>
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

        {/* Message Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Message</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Share your suggestion with us..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        {/* Upload Document Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Upload Document</Text>
          <TouchableOpacity
            style={styles.uploadArea}
            onPress={handleBrowseFiles}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            {uploadedFile && !uploadedFile.canceled ? (
              <View style={styles.uploadedFileContainer}>
                <IconSymbol name="folder.fill" size={40} color="#4CAF50" />
                <Text style={styles.uploadedFileName} numberOfLines={1}>
                  {getFileName()}
                </Text>
                <TouchableOpacity
                  style={styles.removeFileButton}
                  onPress={() => setUploadedFile(null)}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <IconSymbol name="xmark" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.uploadIconContainer}>
                  <IconSymbol name="arrow.up" size={32} color="#9CA3AF" />
                </View>
                <Text style={styles.uploadText}>Choose a file</Text>
                <Text style={styles.uploadSubtext}>txt. docx. pdf. jpeg. Up to 50MB</Text>
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={handleBrowseFiles}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <Text style={styles.browseButtonText}>Browse files</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={styles.sendButtonText}>Send</Text>
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
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'system-ui',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '400',
    color: '#111827',
    fontFamily: 'system-ui',
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
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'system-ui',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: '#9CA3AF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  uploadedFileContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  uploadedFileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'system-ui',
    marginTop: 8,
    maxWidth: '80%',
  },
  removeFileButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#4CAF50',
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
