import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DropdownModal, DropdownOption } from './DropdownModal';
import { sharedStyles } from './shared-styles';

interface CategorySelectorProps {
  selectedCategory: string | null;
  categories: DropdownOption[];
  onSelect: (categoryId: string) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  dropdownRef: React.RefObject<View | null>;
  dropdownPosition?: { x: number; y: number; width: number; height: number };
}

/**
 * Category selector component with dropdown modal
 */
export function CategorySelector({
  selectedCategory,
  categories,
  onSelect,
  isOpen,
  onOpen,
  onClose,
  dropdownRef,
  dropdownPosition,
}: CategorySelectorProps) {
  const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory);

  return (
    <View style={sharedStyles.section}>
      <Text style={sharedStyles.sectionLabel}>Category</Text>
      <View ref={dropdownRef} style={styles.categoryDropdownContainer}>
        <TouchableOpacity
          style={sharedStyles.inputContainer}
          onPress={onOpen}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          {selectedCategoryData ? (
            <View style={styles.categorySelected}>
              {selectedCategoryData.image ? (
                <Image source={selectedCategoryData.image} style={styles.categoryImage} />
              ) : selectedCategoryData.icon ? (
                <Text style={styles.categoryIcon}>{selectedCategoryData.icon}</Text>
              ) : null}
              <Text style={styles.categoryText}>{selectedCategoryData.name}</Text>
            </View>
          ) : (
            <Text style={sharedStyles.categoryPlaceholder}>Select Category</Text>
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
        options={categories}
        selectedValue={selectedCategory}
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
  categorySelected: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryImage: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
  },
  categoryText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: 'system-ui',
  },
});
