import { IconSymbol } from '@/components/ui/icon-symbol';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Preview Story Screen
 * 
 * Displays uploaded stories (images and videos) in a full-screen preview.
 */
export default function PreviewStoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ stories?: string }>();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Parse stories from params (passed as JSON string)
  const stories: string[] = params.stories ? JSON.parse(params.stories) : [];
  
  const currentStory = stories[currentStoryIndex];
  // Detect if story is a video by extension
  const isVideo = currentStory?.toLowerCase().endsWith('.mp4') || 
                  currentStory?.toLowerCase().endsWith('.mov') || 
                  currentStory?.toLowerCase().endsWith('.avi') ||
                  currentStory?.toLowerCase().includes('video');
  
  // Handle video playback when story changes
  useEffect(() => {
    if (isVideo && videoRef.current) {
      // Play video when it becomes current
      videoRef.current.playAsync().catch(() => {});
      setIsPlaying(true);
    } else {
      // Stop video when switching to image
      if (videoRef.current) {
        videoRef.current.pauseAsync().catch(() => {});
        videoRef.current.setPositionAsync(0).catch(() => {});
      }
      setIsPlaying(false);
    }
    
    // Cleanup: stop video when component unmounts or story changes
    return () => {
      if (videoRef.current) {
        videoRef.current.pauseAsync().catch(() => {});
        videoRef.current.setPositionAsync(0).catch(() => {});
      }
    };
  }, [currentStoryIndex, isVideo, currentStory]);
  
  // Handle video playback status
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      // Auto-loop video when it ends
      if (status.didJustFinish) {
        videoRef.current?.replayAsync().catch(() => {});
      }
    }
  };
  
  // Toggle play/pause on video tap
  const handleVideoPress = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pauseAsync().catch(() => {});
      } else {
        videoRef.current.playAsync().catch(() => {});
      }
    }
  };

  const handleBack = () => {
    router.push('/ads/place-ad');
  };

  const handleRemove = () => {
    // TODO: Implement remove story functionality
    router.push('/ads/place-ad');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  const handleSeeAd = () => {
    // TODO: Navigate to ad detail
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    }
  };

  // Swipe gesture handler
  // Swipe left (negative translationX) -> next story
  // Swipe right (positive translationX) -> previous story
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Only activate for horizontal swipes
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      const swipeThreshold = 50; // Minimum distance to trigger navigation
      const velocityThreshold = 500; // Minimum velocity to trigger navigation

      // Swipe left (negative translationX) -> next story
      if (translationX < -swipeThreshold || velocityX < -velocityThreshold) {
        if (currentStoryIndex < stories.length - 1) {
          runOnJS(setCurrentStoryIndex)(currentStoryIndex + 1);
        }
      }
      // Swipe right (positive translationX) -> previous story
      else if (translationX > swipeThreshold || velocityX > velocityThreshold) {
        if (currentStoryIndex > 0) {
          runOnJS(setCurrentStoryIndex)(currentStoryIndex - 1);
        }
      }
    });

  if (stories.length === 0) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name="chevron.left" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Story (Preview)</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No stories to preview</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header with White Background */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Story (Preview)</Text>
        <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>

      {/* Story Content - Full Screen with Swipe Gesture */}
      <GestureDetector gesture={swipeGesture}>
        <View style={styles.storyContent}>
        {isVideo ? (
          <TouchableOpacity
            style={styles.mediaContainer}
            onPress={handleVideoPress}
            activeOpacity={1}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Video
              ref={videoRef}
              source={{ uri: currentStory }}
              style={styles.media}
              resizeMode={ResizeMode.COVER}
              shouldPlay={true}
              isLooping={true}
              isMuted={false}
              useNativeControls={false}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />
            {!isPlaying && (
              <View style={styles.videoIndicator}>
                <IconSymbol name="play.circle.fill" size={60} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <Image source={{ uri: currentStory }} style={styles.media} resizeMode="cover" />
        )}

        {/* Progress Indicators - Overlaid on Story Content */}
        {stories.length > 1 && (
          <View style={styles.progressContainer}>
            {stories.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressBar,
                  index === currentStoryIndex && styles.progressBarActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Navigation Areas - Tap left side to go to previous, right side to go to next */}
        {currentStoryIndex > 0 && (
          <TouchableOpacity
            style={styles.leftNavArea}
            onPress={handlePreviousStory}
            activeOpacity={0.7}
          />
        )}
        {currentStoryIndex < stories.length - 1 && (
          <TouchableOpacity
            style={styles.rightNavArea}
            onPress={handleNextStory}
            activeOpacity={0.7}
          />
        )}

        {/* Share Button Overlay */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="share" size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>

        {/* Bottom Overlay */}
        <View style={styles.bottomOverlay}>
          <View style={styles.buttonAndCountContainer}>
            <TouchableOpacity
              style={styles.seeAdButton}
              onPress={handleSeeAd}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Text style={styles.seeAdButtonText}>See Ad</Text>
            </TouchableOpacity>
            <View style={styles.viewCountContainer}>
              <IconSymbol name="eye.fill" size={16} color="#FFFFFF" />
              <Text style={styles.viewCountText}>10.6k</Text>
            </View>
          </View>
        </View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'system-ui',
    paddingHorizontal: 8,
  },
  headerSpacer: {
    width: 60,
  },
  removeButton: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
    fontFamily: 'system-ui',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 120 : 110,
    paddingBottom: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 15,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
  },
  progressBarActive: {
    backgroundColor: '#FFFFFF',
  },
  storyContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  mediaContainer: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    zIndex: 5,
    pointerEvents: 'none',
  },
  leftNavArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH / 3,
    zIndex: 5,
  },
  rightNavArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH / 3,
    zIndex: 5,
  },
  shareButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 160 : 150,
    right: 16,
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    marginLeft: 2,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingTop: 16,
    zIndex: 15,
  },
  buttonAndCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 48,
  },
  seeAdButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
  seeAdButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    textAlign: 'center',
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginLeft: -8,
  },
  viewCountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
});
