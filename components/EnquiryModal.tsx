import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EnquiryModalProps {
  visible: boolean;
  onClose: () => void;
  itemName?: string;
  onSubmit?: (data: EnquiryFormData) => void;
}

export interface EnquiryFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  interestOptions: {
    financing: boolean;
    testDrive: boolean;
    tradeIn: boolean;
    condition: boolean;
  };
  message: string;
  saveDetails: boolean;
}

/**
 * Enquiry Modal Component
 * 
 * Displays a form for users to enquire about a vehicle listing.
 * Includes contact fields, interest options checkboxes, message box, and submit button.
 */
export function EnquiryModal({
  visible,
  onClose,
  itemName = 'BMW 520 M Sport',
  onSubmit,
}: EnquiryModalProps) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('user123@gmail.com');
  const [interestOptions, setInterestOptions] = useState({
    financing: true,
    testDrive: true,
    tradeIn: true,
    condition: true,
  });
  const [message, setMessage] = useState('');
  const [saveDetails, setSaveDetails] = useState(true);

  const handleToggleInterest = (key: keyof typeof interestOptions) => {
    setInterestOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = () => {
    const formData: EnquiryFormData = {
      fullName,
      phoneNumber,
      email,
      interestOptions,
      message,
      saveDetails,
    };
    onSubmit?.(formData);
    // Reset form
    setFullName('');
    setPhoneNumber('');
    setMessage('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <Pressable style={styles.modalOverlayInner} onPress={onClose}>
          <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Enquire about {itemName}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View style={styles.closeButtonCircle}>
                  <IconSymbol name="xmark" size={12} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.contentContainer}>
            {/* Full Name Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Phone Number Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Phone Number"
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            {/* Email Address Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, styles.emailInput]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={true}
              />
            </View>

            {/* Interest Options */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Interest Options</Text>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => handleToggleInterest('financing')}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <View style={[styles.checkbox, interestOptions.financing && styles.checkboxChecked]}>
                    {interestOptions.financing && (
                      <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I'm interested in financing this vehicle
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => handleToggleInterest('testDrive')}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <View style={[styles.checkbox, interestOptions.testDrive && styles.checkboxChecked]}>
                    {interestOptions.testDrive && (
                      <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I'd like to book a test drive
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => handleToggleInterest('tradeIn')}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <View style={[styles.checkbox, interestOptions.tradeIn && styles.checkboxChecked]}>
                    {interestOptions.tradeIn && (
                      <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I want to trade in my current car
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => handleToggleInterest('condition')}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <View style={[styles.checkbox, interestOptions.condition && styles.checkboxChecked]}>
                    {interestOptions.condition && (
                      <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I'd like to know more about the condition
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Message Box */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Message Box</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your message to the dealer..."
                placeholderTextColor="#9CA3AF"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Save Details Checkbox */}
            <View style={styles.saveDetailsContainer}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setSaveDetails(!saveDetails)}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View style={[styles.checkbox, saveDetails && styles.checkboxChecked]}>
                  {saveDetails && (
                    <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Save details for later</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Text style={styles.submitButtonText}>Submit Enquiry</Text>
            </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayInner: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollView: {
    maxHeight: '90%',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    flex: 1,
    paddingRight: 12,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {},
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 42,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  emailInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  textArea: {
    height: 90,
    paddingTop: 10,
    paddingBottom: 10,
  },
  checkboxContainer: {
    gap: 14,
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#6B7280',
    borderColor: '#6B7280',
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'system-ui',
    flex: 1,
  },
  saveDetailsContainer: {
    marginBottom: 16,
    marginTop: 4,
  },
  submitButton: {
    width: '100%',
    height: 46,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
});
