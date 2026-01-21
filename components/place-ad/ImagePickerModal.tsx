import { IconSymbol } from '@/components/ui/icon-symbol';
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
        <View style={styles.imagePickerSheet} onStartShouldSetResponder={() => true}>
          <View style={styles.imagePickerHandle} />
          <Text style={styles.imagePickerTitle}>{title}</Text>
          
          <TouchableOpacity
            style={styles.imagePickerOption}
            onPress={handleTakePhoto}
            disabled={isPicking}
            activeOpacity={0.7}
          >
            <IconSymbol name="camera.fill" size={24} color="#000000" />
            <Text style={styles.imagePickerOptionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.imagePickerOption}
            onPress={handlePickFromLibrary}
            disabled={isPicking}
            activeOpacity={0.7}
          >
            <IconSymbol name="photo.fill" size={24} color="#000000" />
            <Text style={styles.imagePickerOptionText}>Photo Library</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.imagePickerOption, styles.imagePickerOptionLast]}
            onPress={handlePickFromFiles}
            disabled={isPicking}
            activeOpacity={0.7}
          >
            <IconSymbol name="folder.fill" size={24} color="#000000" />
            <Text style={styles.imagePickerOptionText}>Browse Files</Text>
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
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  imagePickerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  imagePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  imagePickerOptionLast: {
    borderBottomWidth: 0,
  },
  imagePickerOptionText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'system-ui',
  },
});
