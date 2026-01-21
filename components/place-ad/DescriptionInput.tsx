import { StyleSheet, Text, TextInput, View } from 'react-native';
import { sharedStyles } from './shared-styles';

interface DescriptionInputProps {
  description: string;
  onDescriptionChange: (description: string) => void;
}

/**
 * Description textarea input component
 */
export function DescriptionInput({ description, onDescriptionChange }: DescriptionInputProps) {
  return (
    <View style={sharedStyles.section}>
      <Text style={sharedStyles.sectionLabel}>Description</Text>
      <TextInput
        style={styles.descriptionInput}
        placeholder="Write Description"
        placeholderTextColor="#9CA3AF"
        value={description}
        onChangeText={onDescriptionChange}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  descriptionInput: {
    width: '100%',
    minHeight: 120,
    fontSize: 15,
    color: '#000000',
    fontFamily: 'system-ui',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
});
