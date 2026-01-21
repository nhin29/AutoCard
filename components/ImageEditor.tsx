import { IconSymbol } from '@/components/ui/icon-symbol';
import * as ImageManipulator from 'expo-image-manipulator';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Crop area size matching the CSS specification (286px base size)
const BASE_CROP_SIZE = 286;
const CROP_SIZE = Math.min(BASE_CROP_SIZE, SCREEN_WIDTH - 80);
// Grid line positions from CSS (0, 47, 94, 141, 188, 235, 286)
const GRID_POSITIONS = [0, 47, 94, 141, 188, 235, 286];

interface ImageEditorProps {
  visible: boolean;
  imageUri: string | null;
  onSave: (uri: string) => void;
  onCancel: () => void;
}

/**
 * Custom Image Editor with crop (pan/zoom), flip, and save.
 * Crop: pan and pinch to position/scale the image; the visible square is cropped on Next.
 */
export function ImageEditor({ visible, imageUri, onSave, onCancel }: ImageEditorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const startTranslateX = useSharedValue(0);
  const startTranslateY = useSharedValue(0);

  // Load image dimensions and reset gesture state when URI changes
  useEffect(() => {
    if (!imageUri) {
      setImageSize(null);
      return;
    }
    setImageSize(null);
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    Image.getSize(
      imageUri,
      (w, h) => setImageSize({ width: w, height: h }),
      () => setImageSize(null)
    );
  }, [imageUri, scale, translateX, translateY]);

  // Avoid memory leaks by cleaning up state on unmount
  useEffect(() => {
    return () => {
      setIsProcessing(false);
      setFlipH(false);
      setFlipV(false);
      setImageSize(null);
    };
  }, []);

  // Memoize so style is stable and crop does not shift (fixes grid overlay and crop logic)
  const baseScale = useMemo(
    () =>
      imageSize
        ? CROP_SIZE / Math.max(imageSize.width, imageSize.height)
        : 1,
    [imageSize]
  );

  const W = useMemo(
    () => (imageSize ? imageSize.width * baseScale : CROP_SIZE),
    [imageSize, baseScale]
  );
  const H = useMemo(
    () => (imageSize ? imageSize.height * baseScale : CROP_SIZE),
    [imageSize, baseScale]
  );

  const handleFlipHorizontal = useCallback(() => {
    setFlipH((v) => !v);
  }, []);

  const handleFlipVertical = useCallback(() => {
    setFlipV((v) => !v);
  }, []);

  const handleSave = useCallback(async () => {
    // Only allow one processing at a time and image must exist
    if (!imageUri || isProcessing) return;

    setIsProcessing(true);
    try {
      const actions: ImageManipulator.Action[] = [];

      // 1) Crop: compute from visible area (pan/zoom)
      if (imageSize && imageSize.width > 0 && imageSize.height > 0) {
        const s = scale.value;
        const tx = translateX.value;
        const ty = translateY.value;

        // Calculate base scale to fit image in crop area (again, inside save to guarantee correctness)
        const cropBaseScale = CROP_SIZE / Math.max(imageSize.width, imageSize.height);
        const cropWRaw = imageSize.width * cropBaseScale;
        const cropHRaw = imageSize.height * cropBaseScale;
        const totalScale = cropBaseScale * s;

        // Position calculation for cropping
        const imageCenterX = CROP_SIZE / 2 + tx;
        const imageCenterY = CROP_SIZE / 2 + ty;

        const imageLeft = imageCenterX - (cropWRaw * s) / 2;
        const imageTop = imageCenterY - (cropHRaw * s) / 2;
        const imageRight = imageLeft + cropWRaw * s;
        const imageBottom = imageTop + cropHRaw * s;

        // Clamp crop area to image area (don't let crop origin or size go out of bounds)
        const cropLeft = Math.max(0, imageLeft);
        const cropTop = Math.max(0, imageTop);
        const cropRight = Math.min(CROP_SIZE, imageRight);
        const cropBottom = Math.min(CROP_SIZE, imageBottom);

        // Convert crop area (on screen) coordinates back to native image coordinates
        const originX = Math.max(0, Math.round((cropLeft - imageLeft) / totalScale));
        const originY = Math.max(0, Math.round((cropTop - imageTop) / totalScale));
        const cropW = Math.round((cropRight - cropLeft) / totalScale);
        const cropH = Math.round((cropBottom - cropTop) / totalScale);

        // Validate/prevent weird overflow/underflow
        const finalOriginX = Math.max(0, Math.min(originX, imageSize.width - 1));
        const finalOriginY = Math.max(0, Math.min(originY, imageSize.height - 1));
        const finalCropW = Math.max(1, Math.min(cropW, imageSize.width - finalOriginX));
        const finalCropH = Math.max(1, Math.min(cropH, imageSize.height - finalOriginY));

        // Only crop if size is > 1px
        if (finalCropW > 1 && finalCropH > 1) {
          actions.push({
            crop: {
              originX: finalOriginX,
              originY: finalOriginY,
              width: finalCropW,
              height: finalCropH,
            }
          });
        }
      }

      // 2) Flips (use string consts for compatibility)
      if (flipH) actions.push({ flip: ImageManipulator.FlipType.Horizontal });
      if (flipV) actions.push({ flip: ImageManipulator.FlipType.Vertical });

      // 3) Resize for logo
      actions.push({ resize: { width: 500, height: 500 } });

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        actions,
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.PNG,
        }
      );
      onSave(result.uri);
    } catch (e) {
      console.error('[ImageEditor] Error:', e);
      // Only call onSave fallback if error and imageUri exists
      if (imageUri) onSave(imageUri);
    } finally {
      setIsProcessing(false);
      setFlipH(false);
      setFlipV(false);
    }
  }, [imageUri, isProcessing, imageSize, flipH, flipV, onSave, scale, translateX, translateY]);

  const handleCancel = useCallback(() => {
    setFlipH(false);
    setFlipV(false);
    onCancel();
  }, [onCancel]);

  // Pinch gesture: save & clamp to min/max
  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.min(4, Math.max(0.5, startScale.value * e.scale));
    });

  // Pan gesture: clamp image so crop always filled somewhere unless image smaller than box
  const pan = Gesture.Pan()
    .onStart(() => {
      startTranslateX.value = translateX.value;
      startTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (!imageSize) return;

      const s = scale.value;
      const localBaseScale = CROP_SIZE / Math.max(imageSize.width, imageSize.height);
      const localW = imageSize.width * localBaseScale;
      const localH = imageSize.height * localBaseScale;

      // Image's "real" displayed size
      const scaledW = localW * s;
      const scaledH = localH * s;

      let newTx = startTranslateX.value + e.translationX;
      let newTy = startTranslateY.value + e.translationY;

      // Clamp X
      if (scaledW > CROP_SIZE) {
        const maxOffset = (scaledW - CROP_SIZE) / 2;
        newTx = Math.max(-maxOffset, Math.min(maxOffset, newTx));
      } else {
        const maxOffset = (CROP_SIZE - scaledW) / 2;
        newTx = Math.max(-maxOffset, Math.min(maxOffset, newTx));
      }

      // Clamp Y
      if (scaledH > CROP_SIZE) {
        const maxOffset = (scaledH - CROP_SIZE) / 2;
        newTy = Math.max(-maxOffset, Math.min(maxOffset, newTy));
      } else {
        const maxOffset = (CROP_SIZE - scaledH) / 2;
        newTy = Math.max(-maxOffset, Math.min(maxOffset, newTy));
      }
      translateX.value = newTx;
      translateY.value = newTy;
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  // Keep imageAnimatedStyle in sync with W/H
  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: CROP_SIZE / 2 - W / 2 },
      { translateY: CROP_SIZE / 2 - H / 2 },
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }), [W, H]);

  // Modal shouldn't render children if not active (fixes screen reader & Android bug)
  if (!visible || !imageUri) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel} disabled={isProcessing}>
            <IconSymbol name="chevron.left" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Image</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.previewContainer}>
          <View style={styles.imageWrapper}>
            {/* Crop area border */}
            <View style={styles.cropAreaBorder} pointerEvents="none" />

            {/* Image container with crop mask */}
            <View style={[styles.cropBox]}>
              <View style={styles.gestureFill}>
                <GestureDetector gesture={composed}>
                  <Animated.View style={[styles.imageInner, { width: W, height: H }, imageAnimatedStyle]}>
                    <Image
                      source={{ uri: imageUri }}
                      style={[
                        styles.previewImage,
                        { transform: [{ scaleX: flipH ? -1 : 1 }, { scaleY: flipV ? -1 : 1 }] },
                      ]}
                      resizeMode="cover"
                      accessible={false}
                    />
                  </Animated.View>
                </GestureDetector>
              </View>
            </View>

            {/* Grid overlay - detailed grid matching CSS specification */}
            <View style={styles.gridOverlay} pointerEvents="none">
              {/* Vertical lines */}
              {GRID_POSITIONS.map((pos) => (
                <View
                  key={`v-${pos}`}
                  style={[
                    styles.gridLine,
                    styles.gridLineV,
                    { left: (pos * CROP_SIZE) / BASE_CROP_SIZE },
                  ]}
                />
              ))}
              {/* Horizontal lines */}
              {GRID_POSITIONS.map((pos) => (
                <View
                  key={`h-${pos}`}
                  style={[
                    styles.gridLine,
                    styles.gridLineH,
                    { top: (pos * CROP_SIZE) / BASE_CROP_SIZE },
                  ]}
                />
              ))}
            </View>

            {/* White L-shaped corner brackets */}
            <View style={[styles.corner, styles.cornerTopLeft]} pointerEvents="none" />
            <View style={[styles.corner, styles.cornerTopRight]} pointerEvents="none" />
            <View style={[styles.corner, styles.cornerBottomLeft]} pointerEvents="none" />
            <View style={[styles.corner, styles.cornerBottomRight]} pointerEvents="none" />
          </View>
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolButton} disabled={true} accessibilityLabel="Crop tool. Active.">
            <View style={styles.toolIconWrapper}>
              <IconSymbol name="crop" size={22} color="#FFFFFF" />
            </View>
            <Text style={[styles.toolText, styles.toolTextCropActive]}>Crop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={handleFlipHorizontal}
            disabled={isProcessing}
            accessibilityLabel="Flip horizontally"
            accessibilityState={{ selected: flipH }}
          >
            <View style={styles.toolIconWrapper}>
              <Text style={[styles.flipIcon, flipH && styles.flipIconActive]}>⇆</Text>
            </View>
            <Text style={[styles.toolText, flipH && styles.toolTextActive]}>Flip Horizontal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={handleFlipVertical}
            disabled={isProcessing}
            accessibilityLabel="Flip vertically"
            accessibilityState={{ selected: flipV }}
          >
            <View style={styles.toolIconWrapper}>
              <Text style={[styles.flipIcon, flipV && styles.flipIconActive]}>⇅</Text>
            </View>
            <Text style={[styles.toolText, flipV && styles.toolTextActive]}>Flip Vertical</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.nextButton, isProcessing && styles.nextButtonDisabled]}
            onPress={handleSave}
            disabled={isProcessing}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isProcessing ? "Saving" : "Next"}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.nextButtonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: '#FFFFFF',
    ...(Platform.OS === 'ios' ? { fontFamily: undefined } : {}),
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  headerSpacer: {
    width: 44,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  imageWrapper: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropAreaBorder: {
    position: 'absolute',
    width: CROP_SIZE,
    height: CROP_SIZE,
    zIndex: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.10)',
    pointerEvents: 'none',
  },
  cropBox: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    overflow: 'hidden',
    position: 'relative',
  },
  gestureFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  imageInner: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  // White L-shaped corner brackets
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFFFFF',
    borderWidth: 3,
    zIndex: 15,
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  // Grid overlay - detailed grid matching CSS specification
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    borderColor: '#FFFFFF',
    borderWidth: 0.5,
    opacity: 0.15,
    zIndex: 10,
  },
  gridLineV: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  gridLineH: {
    left: 0,
    right: 0,
    height: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0D1117',
  },
  toolButton: {
    alignItems: 'center',
    minWidth: 80,
  },
  toolIconWrapper: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  flipIcon: {
    fontSize: 24,
    color: '#AAAAAA',
  },
  flipIconActive: {
    color: '#FFFFFF',
  },
  toolText: {
    fontSize: 12,
    color: '#AAAAAA',
    ...(Platform.OS === 'ios' ? { fontFamily: undefined } : {}),
    textAlign: 'center',
  },
  toolTextActive: {
    color: '#FFFFFF',
  },
  toolTextCropActive: {
    color: '#FFFFFF',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: '#0D1117',
  },
  nextButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#10B981',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: '#FFFFFF',
    ...(Platform.OS === 'ios' ? { fontFamily: undefined } : {}),
  },
});
