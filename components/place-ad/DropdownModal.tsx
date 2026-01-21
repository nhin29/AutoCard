import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface DropdownOption {
  id: string;
  name: string;
  icon?: string;
  image?: any;
}

interface DropdownModalProps {
  visible: boolean;
  options: DropdownOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
  position?: { x: number; y: number; width: number; height: number };
}

/**
 * Reusable dropdown modal component for selecting options
 */
export function DropdownModal({
  visible,
  options,
  selectedValue,
  onSelect,
  onClose,
  position,
}: DropdownModalProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View
          style={[
            styles.modalDropdownList,
            position && {
              top: position.y + position.height + 4,
              left: position.x,
              width: position.width,
            },
          ]}
          onStartShouldSetResponder={() => true}>
          <ScrollView
            style={styles.dropdownScrollView}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.categoryItem,
                  selectedValue === option.id && styles.categoryItemSelected,
                ]}
                onPress={() => {
                  onSelect(option.id);
                  onClose();
                }}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                {option.image ? (
                  <Image source={option.image} style={styles.categoryItemImage} />
                ) : option.icon ? (
                  <Text style={styles.categoryItemIcon}>{option.icon}</Text>
                ) : null}
                <Text
                  style={[
                    styles.categoryItemText,
                    selectedValue === option.id && styles.categoryItemTextSelected,
                  ]}>
                  {option.name}
                </Text>
                {selectedValue === option.id && (
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalDropdownList: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownScrollView: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryItemSelected: {
    backgroundColor: '#F9FAFB',
  },
  categoryItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryItemImage: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  categoryItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  categoryItemTextSelected: {
    fontWeight: '600',
    color: '#4CAF50',
  },
});
