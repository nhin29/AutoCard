import { IconSymbol } from '@/components/ui/icon-symbol';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const { isSmall } = useResponsive();
  const insets = useSafeAreaInsets();
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

  // Calculate responsive values
  const modalPaddingH = isSmall ? SPACING.sm : SPACING.base;
  const modalPaddingTop = isSmall ? SPACING.sm : SPACING.base;
  // Add safe area bottom inset to avoid system navigation bar overlap
  const baseBottomPadding = isSmall ? SPACING.xs : SPACING.sm;
  const modalPaddingBottom = baseBottomPadding + insets.bottom;
  const titleFontSize = isSmall ? FONT_SIZES.md : 18;
  const closeButtonSize = isSmall ? 20 : 22;
  const closeIconSize = isSmall ? 10 : 12;
  const labelFontSize = isSmall ? FONT_SIZES.xs : 12;
  const inputHeight = isSmall ? 38 : 42;
  const inputFontSize = isSmall ? FONT_SIZES.sm : 14;
  const inputPaddingH = isSmall ? SPACING.sm : 12;
  const textAreaHeight = isSmall ? 80 : 90;
  const checkboxSize = isSmall ? 16 : 18;
  const checkboxIconSize = isSmall ? 12 : 14;
  const checkboxLabelFontSize = isSmall ? FONT_SIZES.sm : 13;
  const checkboxGap = isSmall ? 8 : 10;
  const submitButtonHeight = isSmall ? 42 : 46;
  const submitButtonFontSize = isSmall ? FONT_SIZES.sm : 15;

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
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <View style={[styles.modalContainer, { paddingTop: modalPaddingTop, paddingHorizontal: modalPaddingH, paddingBottom: modalPaddingBottom }]} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { fontSize: titleFontSize }]}>Enquire about {itemName}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View style={[styles.closeButtonCircle, { width: closeButtonSize, height: closeButtonSize, borderRadius: closeButtonSize / 2 }]}>
                  <IconSymbol name="xmark" size={closeIconSize} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              bounces={false}>
              <View style={styles.contentContainer}>
            {/* Full Name Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { fontSize: labelFontSize }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { height: inputHeight, fontSize: inputFontSize, paddingHorizontal: inputPaddingH }]}
                placeholder="Enter Name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Phone Number Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { fontSize: labelFontSize }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { height: inputHeight, fontSize: inputFontSize, paddingHorizontal: inputPaddingH }]}
                placeholder="Enter Phone Number"
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            {/* Email Address Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { fontSize: labelFontSize }]}>Email Address</Text>
              <TextInput
                style={[styles.input, styles.emailInput, { height: inputHeight, fontSize: inputFontSize, paddingHorizontal: inputPaddingH }]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={true}
              />
            </View>

            {/* Interest Options */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { fontSize: labelFontSize }]}>Interest Options</Text>
              <View style={[styles.checkboxContainer, { gap: checkboxGap }]}>
                <TouchableOpacity
                  style={[styles.checkboxRow, { gap: checkboxGap }]}
                  onPress={() => handleToggleInterest('financing')}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <View style={[styles.checkbox, { width: checkboxSize, height: checkboxSize }, interestOptions.financing && styles.checkboxChecked]}>
                    {interestOptions.financing && (
                      <IconSymbol name="checkmark" size={checkboxIconSize} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={[styles.checkboxLabel, { fontSize: checkboxLabelFontSize }]}>
                    I'm interested in financing this vehicle
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.checkboxRow, { gap: checkboxGap }]}
                  onPress={() => handleToggleInterest('testDrive')}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <View style={[styles.checkbox, { width: checkboxSize, height: checkboxSize }, interestOptions.testDrive && styles.checkboxChecked]}>
                    {interestOptions.testDrive && (
                      <IconSymbol name="checkmark" size={checkboxIconSize} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={[styles.checkboxLabel, { fontSize: checkboxLabelFontSize }]}>
                    I'd like to book a test drive
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.checkboxRow, { gap: checkboxGap }]}
                  onPress={() => handleToggleInterest('tradeIn')}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <View style={[styles.checkbox, { width: checkboxSize, height: checkboxSize }, interestOptions.tradeIn && styles.checkboxChecked]}>
                    {interestOptions.tradeIn && (
                      <IconSymbol name="checkmark" size={checkboxIconSize} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={[styles.checkboxLabel, { fontSize: checkboxLabelFontSize }]}>
                    I want to trade in my current car
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.checkboxRow, { gap: checkboxGap }]}
                  onPress={() => handleToggleInterest('condition')}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <View style={[styles.checkbox, { width: checkboxSize, height: checkboxSize }, interestOptions.condition && styles.checkboxChecked]}>
                    {interestOptions.condition && (
                      <IconSymbol name="checkmark" size={checkboxIconSize} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={[styles.checkboxLabel, { fontSize: checkboxLabelFontSize }]}>
                    I'd like to know more about the condition
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Message Box */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { fontSize: labelFontSize }]}>Message Box</Text>
              <TextInput
                style={[styles.input, styles.textArea, { height: textAreaHeight, fontSize: inputFontSize, paddingHorizontal: inputPaddingH }]}
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
                style={[styles.checkboxRow, { gap: checkboxGap }]}
                onPress={() => setSaveDetails(!saveDetails)}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View style={[styles.checkbox, { width: checkboxSize, height: checkboxSize }, saveDetails && styles.checkboxChecked]}>
                  {saveDetails && (
                    <IconSymbol name="checkmark" size={checkboxIconSize} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.checkboxLabel, { fontSize: checkboxLabelFontSize }]}>Save details for later</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, { height: submitButtonHeight }]}
              onPress={handleSubmit}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Text style={[styles.submitButtonText, { fontSize: submitButtonFontSize }]}>Submit Enquiry</Text>
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
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    flexGrow: 0,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    maxHeight: '90%',
    alignSelf: 'flex-end',
    // paddingTop, paddingHorizontal, paddingBottom set dynamically
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    flex: 1,
    paddingRight: 12,
    // fontSize set dynamically
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonCircle: {
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    // width, height, borderRadius set dynamically
  },
  contentContainer: {},
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 6,
    // fontSize set dynamically
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'system-ui',
    // height, fontSize, paddingHorizontal set dynamically
  },
  emailInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  textArea: {
    paddingTop: 10,
    paddingBottom: 10,
    // height set dynamically
  },
  checkboxContainer: {
    marginTop: 4,
    // gap set dynamically
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap set dynamically
  },
  checkbox: {
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    // width and height set dynamically
  },
  checkboxChecked: {
    backgroundColor: '#6B7280',
    borderColor: '#6B7280',
  },
  checkboxLabel: {
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'system-ui',
    flex: 1,
    // fontSize set dynamically
  },
  saveDetailsContainer: {
    marginBottom: 16,
    marginTop: 4,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 0,
    // height set dynamically
  },
  submitButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
});
