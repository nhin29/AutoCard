import { IconSymbol } from '@/components/ui/icon-symbol';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onPickFromLibrary: () => void;
  onPickFromFiles: () => void;
  isPicking?: boolean;
  title?: string;
}

/**
 * Bottom sheet modal for selecting image source (camera, library, files)
 * 
 * Handles the complexity of iOS modal dismissal before presenting system pickers.
 */
export function ImagePickerModal({
  visible,
  onClose,
  onTakePhoto,
  onPickFromLibrary,
  onPickFromFiles,
  isPicking = false,
  title = 'Select Image Source',
}: ImagePickerModalProps) {
  const { isSmall } = useResponsive();
  const insets = useSafeAreaInsets();

  // Calculate responsive values for small phones - reduced like EnquiryModal
  const sheetPaddingTop = isSmall ? SPACING.xs : 12;
  // Add safe area bottom inset to avoid system navigation bar overlap
  const baseBottomPadding = isSmall ? SPACING.xs : 40;
  const sheetPaddingBottom = baseBottomPadding + insets.bottom;
  const sheetPaddingH = isSmall ? SPACING.sm : SPACING.base;
  const handleWidth = isSmall ? 28 : 40;
  const handleHeight = isSmall ? 3 : 4;
  const handleMarginBottom = isSmall ? SPACING.sm : 20;
  const titleFontSize = isSmall ? FONT_SIZES.sm : 18;
  const titleMarginBottom = isSmall ? SPACING.sm : 20;
  const iconSize = isSmall ? 18 : 24;
  const optionPaddingV = isSmall ? SPACING.xs : 16;
  const optionGap = isSmall ? SPACING.xs : 12;
  const optionTextFontSize = isSmall ? FONT_SIZES.xs : 16;

  const handleTakePhoto = async () => {
    // Close modal first
    onClose();
    
    // Wait for modal to close, then trigger camera
    // iOS needs more time for modal animation to complete
    const delay = Platform.OS === 'ios' ? 600 : 300;
    setTimeout(() => {
      onTakePhoto();
    }, delay);
  };

  const handlePickFromLibrary = async () => {
    // Close modal first
    onClose();
    
    // Wait for modal to close, then trigger library
    const delay = Platform.OS === 'ios' ? 600 : 300;
    setTimeout(() => {
      onPickFromLibrary();
    }, delay);
  };

  const handlePickFromFiles = async () => {
    // Close modal first
    onClose();
    
    // Wait for modal to close, then trigger files
    const delay = Platform.OS === 'ios' ? 600 : 300;
    setTimeout(() => {
      onPickFromFiles();
    }, delay);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.imagePickerSheet, { paddingTop: sheetPaddingTop, paddingBottom: sheetPaddingBottom, paddingHorizontal: sheetPaddingH }]} onStartShouldSetResponder={() => true}>
          <View style={[styles.imagePickerHandle, { width: handleWidth, height: handleHeight, borderRadius: handleHeight / 2, marginBottom: handleMarginBottom }]} />
          <Text style={[styles.imagePickerTitle, { fontSize: titleFontSize, marginBottom: titleMarginBottom }]}>{title}</Text>
          
          <TouchableOpacity
            style={[styles.imagePickerOption, { paddingVertical: optionPaddingV, gap: optionGap }]}
            onPress={handleTakePhoto}
            disabled={isPicking}
            activeOpacity={0.7}
          >
            <IconSymbol name="camera.fill" size={iconSize} color="#000000" />
            <Text style={[styles.imagePickerOptionText, { fontSize: optionTextFontSize }]}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.imagePickerOption, { paddingVertical: optionPaddingV, gap: optionGap }]}
            onPress={handlePickFromLibrary}
            disabled={isPicking}
            activeOpacity={0.7}
          >
            <IconSymbol name="photo.fill" size={iconSize} color="#000000" />
            <Text style={[styles.imagePickerOptionText, { fontSize: optionTextFontSize }]}>Photo Library</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.imagePickerOption, styles.imagePickerOptionLast, { paddingVertical: optionPaddingV, gap: optionGap }]}
            onPress={handlePickFromFiles}
            disabled={isPicking}
            activeOpacity={0.7}
          >
            <IconSymbol name="folder.fill" size={iconSize} color="#000000" />
            <Text style={[styles.imagePickerOptionText, { fontSize: optionTextFontSize }]}>Browse Files</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  imagePickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // paddingTop, paddingBottom, paddingHorizontal set dynamically
  },
  imagePickerHandle: {
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    // width, height, borderRadius, marginBottom set dynamically
  },
  imagePickerTitle: {
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    textAlign: 'center',
    // fontSize and marginBottom set dynamically
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    // paddingVertical and gap set dynamically
  },
  imagePickerOptionLast: {
    borderBottomWidth: 0,
  },
  imagePickerOptionText: {
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
});
