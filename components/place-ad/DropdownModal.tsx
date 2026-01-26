import { IconSymbol } from '@/components/ui/icon-symbol';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
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
  const { isSmall } = useResponsive();

  // Calculate responsive values
  const maxHeight = isSmall ? 240 : 300;
  const itemPaddingH = isSmall ? SPACING.sm : SPACING.base;
  const itemPaddingV = isSmall ? SPACING.sm : 12;
  const itemIconSize = isSmall ? 20 : 24;
  const itemImageSize = isSmall ? 20 : 24;
  const itemTextFontSize = isSmall ? FONT_SIZES.sm : 15;
  const checkmarkSize = isSmall ? 18 : 20;
  const itemGap = isSmall ? SPACING.sm : 12;

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
            style={[styles.dropdownScrollView, { maxHeight }]}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.categoryItem,
                  { paddingHorizontal: itemPaddingH, paddingVertical: itemPaddingV, gap: itemGap },
                  selectedValue === option.id && styles.categoryItemSelected,
                ]}
                onPress={() => {
                  onSelect(option.id);
                  onClose();
                }}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                {option.image ? (
                  <Image source={option.image} style={[styles.categoryItemImage, { width: itemImageSize, height: itemImageSize }]} />
                ) : option.icon ? (
                  <Text style={[styles.categoryItemIcon, { fontSize: itemIconSize }]}>{option.icon}</Text>
                ) : null}
                <Text
                  style={[
                    styles.categoryItemText,
                    { fontSize: itemTextFontSize },
                    selectedValue === option.id && styles.categoryItemTextSelected,
                  ]}>
                  {option.name}
                </Text>
                {selectedValue === option.id && (
                  <IconSymbol name="checkmark.circle.fill" size={checkmarkSize} color="#4CAF50" />
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    // maxHeight set dynamically
  },
  dropdownScrollView: {
    // maxHeight set dynamically
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    // paddingHorizontal, paddingVertical, gap set dynamically
  },
  categoryItemSelected: {
    backgroundColor: '#F9FAFB',
  },
  categoryItemIcon: {
    marginRight: 12,
    // fontSize set dynamically
  },
  categoryItemImage: {
    marginRight: 12,
    resizeMode: 'contain',
    // width and height set dynamically
  },
  categoryItemText: {
    flex: 1,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  categoryItemTextSelected: {
    fontWeight: '600',
    color: '#4CAF50',
  },
});
