import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface FormInputProps extends TextInputProps {
  label?: string;
  description?: string;
  containerStyle?: object;
}

/**
 * Reusable form input component with optional label and description
 */
export function FormInput({
  label,
  description,
  containerStyle,
  style,
  ...textInputProps
}: FormInputProps) {
  return (
    <View style={[styles.section, containerStyle]}>
      {label && <Text style={styles.sectionLabel}>{label}</Text>}
      {description && <Text style={styles.sectionDescription}>{description}</Text>}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#9CA3AF"
        {...textInputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    fontFamily: 'system-ui',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: '#FFFFFF',
  },
});
