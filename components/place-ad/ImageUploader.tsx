import { DeleteIcon } from '@/components/icons/DeleteIcon';
import { EditIcon } from '@/components/icons/EditIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Device from 'expo-device';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ImagePickerModal } from './ImagePickerModal';
import { IMAGE_SIZE, sharedStyles } from './shared-styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 8;

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

/**
 * Image uploader component with editing capabilities (set cover, rotate, reorder, delete)
 */
export function ImageUploader({ images, onImagesChange, maxImages = 20 }: ImageUploaderProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [editDropdownIndex, setEditDropdownIndex] = useState<number | null>(null);
  const [editButtonLayouts, setEditButtonLayouts] = useState<{
    [key: number]: { x: number; y: number; width: number; height: number };
  }>({});
  const editButtonRefs = useRef<{ [key: number]: View | null }>({});

  const handleAddImage = () => {
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
      return;
    }
    setShowImagePicker(true);
  };

  const takePhoto = async () => {
    if (isPicking) return;
    setIsPicking(true);
    
    try {
      // Check if running on iOS Simulator - camera doesn't work there
      // Android emulators can use virtual camera, so we only block iOS
      if (Platform.OS === 'ios' && !Device.isDevice) {
        Alert.alert(
          'Camera Not Available',
          'Camera is not available on iOS Simulator. Please use "Photo Library" or "Browse Files" instead, or test on a real device.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access in your device settings to take photos.',
          [{ text: 'OK' }]
        );
        setIsPicking(false);
        return;
      }

      // Ensure modal is fully closed before launching camera
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const remainingSlots = maxImages - images.length;
        if (remainingSlots > 0) {
          onImagesChange([...images, result.assets[0].uri]);
        } else {
          Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
        }
      }
    } catch (e: any) {
      if (__DEV__) console.error('[ImageUploader] Camera error:', e);
      
      const errorMessage = e?.message || 'Unknown error';
      const isPermissionError = errorMessage.toLowerCase().includes('permission') || 
                                errorMessage.toLowerCase().includes('denied');
      
      Alert.alert(
        'Camera Error',
        isPermissionError 
          ? 'Camera permission was denied. Please enable camera access in your device settings.'
          : 'Unable to open camera. Please use "Photo Library" or "Browse Files" instead.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPicking(false);
    }
  };

  const pickFromPhotoLibrary = async () => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      // Request permission - iOS can return 'granted' or 'limited' (both are acceptable)
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const statusString = status as string;
      if (statusString !== 'granted' && statusString !== 'limited') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload images.',
          [{ text: 'OK' }]
        );
        setIsPicking(false);
        return;
      }

      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
        setIsPicking(false);
        return;
      }

      // Ensure modal is fully closed before launching library
      await new Promise((resolve) => setTimeout(resolve, 100));

      // On Android 13+, use quality: 1 when allowsMultipleSelection is true to avoid content:// URI issues
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: Platform.OS === 'android' && remainingSlots > 1 ? 1 : 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);
        onImagesChange([...images, ...newUris]);
      }
    } catch (e: any) {
      if (__DEV__) console.error('[ImageUploader] ImagePicker error:', e);
      
      const errorMessage = e?.message || 'Unknown error';
      const isPermissionError = errorMessage.toLowerCase().includes('permission') || 
                                errorMessage.toLowerCase().includes('denied') ||
                                errorMessage.toLowerCase().includes('rejected');
      
      Alert.alert(
        'Photo Library Error',
        isPermissionError
          ? 'Photo library permission was denied. Please enable photo access in your device settings.'
          : 'Unable to select from Photo Library. Please try "Browse Files" instead.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPicking(false);
    }
  };

  const pickFromFiles = async () => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'public.image'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.slice(0, remainingSlots).map((asset) => asset.uri);
        onImagesChange([...images, ...newUris]);

        if (result.assets.length > remainingSlots) {
          Alert.alert(
            'Limit Reached',
            `Only ${remainingSlots} image(s) were added. You can upload up to ${maxImages} images total.`
          );
        }
      }
    } catch (e) {
      if (__DEV__) console.error('[ImageUploader] DocumentPicker error:', e);
      Alert.alert('Upload', 'Unable to open the file picker. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsPicking(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setEditDropdownIndex(null);
  };

  const handleSetAsCover = (index: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(index, 1);
    newImages.unshift(movedImage);
    onImagesChange(newImages);
    setEditDropdownIndex(null);
  };

  const handleRotatePhoto = (index: number) => {
    // TODO: Implement photo rotation
    setEditDropdownIndex(null);
  };

  const handleMoveImageUp = (index: number) => {
    if (index === 0 || index >= images.length) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index - 1];
    newImages[index - 1] = temp;
    onImagesChange(newImages);
    setEditDropdownIndex(null);
  };

  const handleMoveImageDown = (index: number) => {
    if (index === 0 || index >= images.length - 1) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index + 1];
    newImages[index + 1] = temp;
    onImagesChange(newImages);
    setEditDropdownIndex(null);
  };

  const measureEditButton = (index: number) => {
    const ref = editButtonRefs.current[index];
    if (!ref) return;
    ref.measureInWindow((x, y, width, height) => {
      setEditButtonLayouts((prev) => ({
        ...prev,
        [index]: { x, y, width, height },
      }));
    });
  };

  const handleEditButtonPress = (index: number) => {
    setTimeout(() => {
      measureEditButton(index);
      setEditDropdownIndex(index);
    }, 0);
  };

  const getDropdownPosition = (index: number) => {
    const layout = editButtonLayouts[index];
    if (!layout) return { top: 0, left: 0 };

    const dropdownWidth = 160;
    const dropdownHeight = 120;
    const spacing = 4;
    const screenHeight = Dimensions.get('window').height;

    let left = layout.x;
    let top = layout.y + layout.height + spacing;

    if (left + dropdownWidth > SCREEN_WIDTH) {
      left = SCREEN_WIDTH - dropdownWidth - 16;
    }
    if (left < 16) {
      left = 16;
    }

    if (top + dropdownHeight > screenHeight) {
      top = layout.y - dropdownHeight - spacing;
    }
    if (top < 16) {
      top = 16;
    }

    return { top, left };
  };

  return (
    <View style={sharedStyles.section}>
      <Text style={sharedStyles.sectionLabel}>Upload Images</Text>
      <Text style={sharedStyles.sectionDescription}>
        You can upload up to {maxImages} images
      </Text>
      <View style={styles.imageGrid}>
        {images.length < maxImages && (
          <TouchableOpacity
            style={styles.addImageButton}
            onPress={handleAddImage}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={styles.addImagePlus}>+</Text>
          </TouchableOpacity>
        )}

        {images.map((uri, index) => {
          const isCoverImage = index === 0;
          return (
            <View key={`image-${uri}-${index}`} style={styles.imageItem}>
              <Image source={{ uri }} style={styles.uploadedImage} />
              {isCoverImage ? (
                <View
                  ref={(ref) => {
                    editButtonRefs.current[index] = ref;
                  }}
                  style={styles.imageEditButtonWrapper}
                  collapsable={false}>
                  <TouchableOpacity
                    style={styles.imageStarButton}
                    onPress={() => handleEditButtonPress(index)}
                    {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                    <IconSymbol name="star.fill" size={12} color="#FFD700" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  ref={(ref) => {
                    editButtonRefs.current[index] = ref;
                  }}
                  style={styles.imageEditButtonWrapper}
                  collapsable={false}>
                  <TouchableOpacity
                    style={styles.imageEditButton}
                    onPress={() => handleEditButtonPress(index)}
                    {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                    <EditIcon width={10} height={10} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                style={styles.imageRemoveButton}
                onPress={() => handleRemoveImage(index)}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <DeleteIcon width={7} height={7} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onTakePhoto={takePhoto}
        onPickFromLibrary={pickFromPhotoLibrary}
        onPickFromFiles={pickFromFiles}
        isPicking={isPicking}
      />

      {editDropdownIndex !== null && editButtonLayouts[editDropdownIndex] && (
        <Modal
          visible={editDropdownIndex !== null}
          transparent
          animationType="none"
          onRequestClose={() => setEditDropdownIndex(null)}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setEditDropdownIndex(null)}>
            <View
              style={[
                styles.imageEditDropdown,
                {
                  top: getDropdownPosition(editDropdownIndex).top,
                  left: getDropdownPosition(editDropdownIndex).left,
                },
              ]}
              onStartShouldSetResponder={() => true}>
              {editDropdownIndex !== null && editDropdownIndex !== 0 && (
                <TouchableOpacity
                  style={styles.imageEditDropdownOption}
                  onPress={() => handleSetAsCover(editDropdownIndex)}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <Text style={styles.imageEditDropdownText}>Set as a Cover</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.imageEditDropdownOption}
                onPress={() => handleRotatePhoto(editDropdownIndex)}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={styles.imageEditDropdownText}>Rotate Photo</Text>
              </TouchableOpacity>
              {editDropdownIndex !== null && editDropdownIndex > 0 && (
                <TouchableOpacity
                  style={styles.imageEditDropdownOption}
                  onPress={() => handleMoveImageUp(editDropdownIndex)}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <Text style={styles.imageEditDropdownText}>Move Up</Text>
                </TouchableOpacity>
              )}
              {editDropdownIndex !== null &&
                editDropdownIndex > 0 &&
                editDropdownIndex < images.length - 1 && (
                  <TouchableOpacity
                    style={styles.imageEditDropdownOption}
                    onPress={() => handleMoveImageDown(editDropdownIndex)}
                    {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                    <Text style={styles.imageEditDropdownText}>Move Down</Text>
                  </TouchableOpacity>
                )}
              <TouchableOpacity
                style={[styles.imageEditDropdownOption, styles.imageEditDropdownOptionLast]}
                onPress={() => handleRemoveImage(editDropdownIndex)}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={styles.imageEditDropdownText}>Delete Photo</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    justifyContent: 'flex-start',
  },
  addImageButton: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addImagePlus: {
    fontSize: 32,
    fontWeight: '300',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
  },
  imageItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageEditButtonWrapper: {
    position: 'absolute',
    top: 4,
    right: 28,
    width: 18,
    height: 18,
  },
  imageEditButton: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStarButton: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  imageEditDropdown: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    minWidth: 160,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  imageEditDropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  imageEditDropdownOptionLast: {
    borderBottomWidth: 0,
  },
  imageEditDropdownText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'system-ui',
  },
});
