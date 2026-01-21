import { IconSymbol } from '@/components/ui/icon-symbol';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DropdownModal, type DropdownOption } from './DropdownModal';
import { sharedStyles } from './shared-styles';

export type { DropdownOption } from './DropdownModal';

interface DropdownFieldProps {
  label: string;
  selectedValue: string | null;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  dropdownRef: React.RefObject<View | null>;
  dropdownPosition?: { x: number; y: number; width: number; height: number };
  containerStyle?: object;
}

/**
 * Reusable dropdown field component
 */
export function DropdownField({
  label,
  selectedValue,
  options,
  onSelect,
  placeholder = 'Select',
  isOpen,
  onOpen,
  onClose,
  dropdownRef,
  dropdownPosition,
  containerStyle,
}: DropdownFieldProps) {
  const selectedOption = options.find((opt) => opt.id === selectedValue);

  return (
    <View style={[sharedStyles.section, containerStyle]}>
      <Text style={sharedStyles.sectionLabel}>{label}</Text>
      <View ref={dropdownRef} style={styles.categoryDropdownContainer}>
        <TouchableOpacity
          style={sharedStyles.inputContainer}
          onPress={onOpen}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          {selectedOption ? (
            <Text style={sharedStyles.statusText}>{selectedOption.name}</Text>
          ) : (
            <Text style={sharedStyles.categoryPlaceholder}>{placeholder}</Text>
          )}
          <IconSymbol
            name={isOpen ? 'chevron.up' : 'chevron.down'}
            size={20}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>

      <DropdownModal
        visible={isOpen}
        options={options}
        selectedValue={selectedValue}
        onSelect={onSelect}
        onClose={onClose}
        position={dropdownPosition}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  categoryDropdownContainer: {
    width: '100%',
  },
});
