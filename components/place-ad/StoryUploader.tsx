import { DeleteIcon } from '@/components/icons/DeleteIcon';
import { EditIcon } from '@/components/icons/EditIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useImageGridSize } from '@/components/place-ad/shared-styles';
import * as Device from 'expo-device';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { ImagePickerModal } from './ImagePickerModal';
import { sharedStyles } from './shared-styles';

const GRID_GAP = 8;

interface StoryUploaderProps {
  stories: string[];
  onStoriesChange: (stories: string[]) => void;
  maxStories?: number;
  onBeforePreview?: () => void;
}

/**
 * Story uploader component with editing capabilities (set cover, rotate, reorder, delete)
 * Supports both images and videos
 */
export function StoryUploader({ stories, onStoriesChange, maxStories = 5, onBeforePreview }: StoryUploaderProps) {
  const router = useRouter();
  const storySize = useImageGridSize();
  const { width, height } = useWindowDimensions();
  const [showStoryPicker, setShowStoryPicker] = useState(false);
  const [isPickingStory, setIsPickingStory] = useState(false);
  const [storyEditDropdownIndex, setStoryEditDropdownIndex] = useState<number | null>(null);
  const [storyEditButtonLayouts, setStoryEditButtonLayouts] = useState<{
    [key: number]: { x: number; y: number; width: number; height: number };
  }>({});
  const storyEditButtonRefs = useRef<{ [key: number]: View | null }>({});

  const handleAddStory = () => {
    const remainingSlots = maxStories - stories.length;
    if (remainingSlots <= 0) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxStories} stories.`);
      return;
    }
    setShowStoryPicker(true);
  };

  const takeStoryPhoto = async () => {
    if (isPickingStory) return;
    setIsPickingStory(true);
    
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
        setIsPickingStory(false);
        return;
      }

      // Ensure modal is fully closed before launching camera
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const remainingSlots = maxStories - stories.length;
        if (remainingSlots > 0) {
          onStoriesChange([...stories, result.assets[0].uri]);
        } else {
          Alert.alert('Limit Reached', `You can only upload up to ${maxStories} stories.`);
        }
      }
    } catch (e: any) {
      
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
      setIsPickingStory(false);
    }
  };

  const pickStoryFromPhotoLibrary = async () => {
    if (isPickingStory) return;
    setIsPickingStory(true);
    try {
      // Request permission - iOS can return 'granted' or 'limited' (both are acceptable)
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const statusString = status as string;
      if (statusString !== 'granted' && statusString !== 'limited') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload stories.',
          [{ text: 'OK' }]
        );
        setIsPickingStory(false);
        return;
      }

      const remainingSlots = maxStories - stories.length;
      if (remainingSlots <= 0) {
        Alert.alert('Limit Reached', `You can only upload up to ${maxStories} stories.`);
        setIsPickingStory(false);
        return;
      }

      // Ensure modal is fully closed before launching library
      await new Promise((resolve) => setTimeout(resolve, 100));

      // On Android 13+, use quality: 1 when allowsMultipleSelection is true to avoid content:// URI issues
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false,
        quality: Platform.OS === 'android' && remainingSlots > 1 ? 1 : 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);
        onStoriesChange([...stories, ...newUris]);
      }
    } catch (e: any) {
      
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
      setIsPickingStory(false);
    }
  };

  const pickStoryFromFiles = async () => {
    if (isPickingStory) return;
    setIsPickingStory(true);
    try {
      const remainingSlots = maxStories - stories.length;
      if (remainingSlots <= 0) {
        Alert.alert('Limit Reached', `You can only upload up to ${maxStories} stories.`);
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'video/*', 'public.image', 'public.movie'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.slice(0, remainingSlots).map((asset) => asset.uri);
        onStoriesChange([...stories, ...newUris]);

        if (result.assets.length > remainingSlots) {
          Alert.alert(
            'Limit Reached',
            `Only ${remainingSlots} story/stories were added. You can upload up to ${maxStories} stories total.`
          );
        }
      }
    } catch (e) {
      Alert.alert('Upload', 'Unable to open the file picker. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsPickingStory(false);
    }
  };

  const handleRemoveStory = (index: number) => {
    const newStories = stories.filter((_, i) => i !== index);
    onStoriesChange(newStories);
    setStoryEditDropdownIndex(null);
  };

  const handleSetStoryAsCover = (index: number) => {
    const newStories = [...stories];
    const [movedStory] = newStories.splice(index, 1);
    newStories.unshift(movedStory);
    onStoriesChange(newStories);
    setStoryEditDropdownIndex(null);
  };

  const handleRotateStory = (index: number) => {
    // TODO: Implement story rotation
    setStoryEditDropdownIndex(null);
  };

  const handleMoveStoryUp = (index: number) => {
    if (index === 0 || index >= stories.length) return;
    const newStories = [...stories];
    const temp = newStories[index];
    newStories[index] = newStories[index - 1];
    newStories[index - 1] = temp;
    onStoriesChange(newStories);
    setStoryEditDropdownIndex(null);
  };

  const handleMoveStoryDown = (index: number) => {
    if (index === 0 || index >= stories.length - 1) return;
    const newStories = [...stories];
    const temp = newStories[index];
    newStories[index] = newStories[index + 1];
    newStories[index + 1] = temp;
    onStoriesChange(newStories);
    setStoryEditDropdownIndex(null);
  };

  const measureStoryEditButton = (index: number) => {
    const ref = storyEditButtonRefs.current[index];
    if (!ref) return;
    ref.measureInWindow((x, y, width, height) => {
      setStoryEditButtonLayouts((prev) => ({
        ...prev,
        [index]: { x, y, width, height },
      }));
    });
  };

  const handleEditStoryButtonPress = (index: number) => {
    setTimeout(() => {
      measureStoryEditButton(index);
      setStoryEditDropdownIndex(index);
    }, 0);
  };

  const getStoryDropdownPosition = (index: number) => {
    const layout = storyEditButtonLayouts[index];
    if (!layout) return { top: 0, left: 0 };

    const dropdownWidth = 160;
    const dropdownHeight = 200;
    const spacing = 4;

    let left = layout.x;
    let top = layout.y + layout.height + spacing;

    if (left + dropdownWidth > width) {
      left = width - dropdownWidth - 16;
    }
    if (left < 16) {
      left = 16;
    }

    if (top + dropdownHeight > height) {
      top = layout.y - dropdownHeight - spacing;
    }
    if (top < 16) {
      top = 16;
    }

    return { top, left };
  };

  const handlePreviewStory = () => {
    if (stories.length === 0) {
      Alert.alert('No Stories', 'Please upload at least one story to preview.');
      return;
    }
    // Save draft before navigating if callback is provided
    if (onBeforePreview) {
      onBeforePreview();
    }
    router.push({
      pathname: '/story/preview-story',
      params: {
        stories: JSON.stringify(stories),
      },
    });
  };

  return (
    <View style={sharedStyles.section}>
      <Text style={sharedStyles.sectionLabel}>Upload Story</Text>
      <Text style={sharedStyles.sectionDescription}>
        You can upload up to {maxStories} Images or videos for story
      </Text>
      <View style={styles.imageGrid}>
        {stories.length < maxStories && (
          <TouchableOpacity
            style={[styles.addImageButton, { width: storySize, height: storySize }]}
            onPress={handleAddStory}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={styles.addImagePlus}>+</Text>
          </TouchableOpacity>
        )}

        {stories.map((uri, index) => {
          const isCoverStory = index === 0;
          return (
            <View key={`story-${uri}-${index}`} style={[styles.imageItem, { width: storySize, height: storySize }]}>
              <Image source={{ uri }} style={styles.uploadedImage} />
              {isCoverStory ? (
                <View
                  ref={(ref) => {
                    storyEditButtonRefs.current[index] = ref;
                  }}
                  style={styles.imageEditButtonWrapper}
                  collapsable={false}>
                  <TouchableOpacity
                    style={styles.imageStarButton}
                    onPress={() => handleEditStoryButtonPress(index)}
                    {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                    <IconSymbol name="star.fill" size={12} color="#FFD700" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  ref={(ref) => {
                    storyEditButtonRefs.current[index] = ref;
                  }}
                  style={styles.imageEditButtonWrapper}
                  collapsable={false}>
                  <TouchableOpacity
                    style={styles.imageEditButton}
                    onPress={() => handleEditStoryButtonPress(index)}
                    {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                    <EditIcon width={10} height={10} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                style={styles.imageRemoveButton}
                onPress={() => handleRemoveStory(index)}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <DeleteIcon width={7} height={7} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      <TouchableOpacity
        style={styles.previewStoryButton}
        onPress={handlePreviewStory}
        {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
        <Text style={styles.previewStoryText}>Preview Story</Text>
      </TouchableOpacity>

      <ImagePickerModal
        visible={showStoryPicker}
        onClose={() => setShowStoryPicker(false)}
        onTakePhoto={takeStoryPhoto}
        onPickFromLibrary={pickStoryFromPhotoLibrary}
        onPickFromFiles={pickStoryFromFiles}
        isPicking={isPickingStory}
        title="Select Story Source"
      />

      {storyEditDropdownIndex !== null && storyEditButtonLayouts[storyEditDropdownIndex] && (
        <Modal
          visible={storyEditDropdownIndex !== null}
          transparent
          animationType="none"
          onRequestClose={() => setStoryEditDropdownIndex(null)}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setStoryEditDropdownIndex(null)}>
            <View
              style={[
                styles.imageEditDropdown,
                {
                  top: getStoryDropdownPosition(storyEditDropdownIndex).top,
                  left: getStoryDropdownPosition(storyEditDropdownIndex).left,
                },
              ]}
              onStartShouldSetResponder={() => true}>
              {storyEditDropdownIndex !== null && storyEditDropdownIndex !== 0 && (
                <TouchableOpacity
                  style={styles.imageEditDropdownOption}
                  onPress={() => handleSetStoryAsCover(storyEditDropdownIndex)}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <Text style={styles.imageEditDropdownText}>Set as a Cover</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.imageEditDropdownOption}
                onPress={() => handleRotateStory(storyEditDropdownIndex)}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={styles.imageEditDropdownText}>Rotate Story</Text>
              </TouchableOpacity>
              {storyEditDropdownIndex !== null && storyEditDropdownIndex > 0 && (
                <TouchableOpacity
                  style={styles.imageEditDropdownOption}
                  onPress={() => handleMoveStoryUp(storyEditDropdownIndex)}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <Text style={styles.imageEditDropdownText}>Move Up</Text>
                </TouchableOpacity>
              )}
              {storyEditDropdownIndex !== null &&
                storyEditDropdownIndex > 0 &&
                storyEditDropdownIndex < stories.length - 1 && (
                  <TouchableOpacity
                    style={styles.imageEditDropdownOption}
                    onPress={() => handleMoveStoryDown(storyEditDropdownIndex)}
                    {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                    <Text style={styles.imageEditDropdownText}>Move Down</Text>
                  </TouchableOpacity>
                )}
              <TouchableOpacity
                style={[styles.imageEditDropdownOption, styles.imageEditDropdownOptionLast]}
                onPress={() => handleRemoveStory(storyEditDropdownIndex)}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={styles.imageEditDropdownText}>Delete Story</Text>
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
    // Width and height set dynamically via inline styles
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
    // Width and height set dynamically via inline styles
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
  previewStoryButton: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  previewStoryText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4CAF50',
    fontFamily: 'system-ui',
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
