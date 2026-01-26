import { IconSymbol } from '@/components/ui/icon-symbol';
// NOTE: expo-av is deprecated in SDK 54, but still functional
// TODO: Migrate to expo-video when ready (expo-av will be removed in future SDK versions)
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive, SPACING } from '@/utils/responsive';
import {
    Animated,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

/**
 * Preview Story Screen
 * 
 * Displays uploaded stories (images and videos) in a full-screen preview.
 */
export default function PreviewStoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSmall } = useResponsive();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const params = useLocalSearchParams<{ stories?: string; adId?: string }>();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Auto-slider timer and progress animation
  const STORY_DURATION = 5000; // 5 seconds per story
  const progressAnimRefs = useRef<Animated.Value[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  
  // Parse stories from params (passed as JSON string)
  const stories: string[] = params.stories ? JSON.parse(params.stories) : [];
  
  // Initialize progress animations for each story
  useEffect(() => {
    progressAnimRefs.current = stories.map(() => new Animated.Value(0));
    return () => {
      // Cleanup animations
      progressAnimRefs.current.forEach(anim => anim.removeAllListeners());
    };
  }, [stories.length]);
  
  const currentStory = stories[currentStoryIndex];
  // Detect if story is a video by extension
  const isVideo = currentStory?.toLowerCase().endsWith('.mp4') || 
                  currentStory?.toLowerCase().endsWith('.mov') || 
                  currentStory?.toLowerCase().endsWith('.avi') ||
                  currentStory?.toLowerCase().includes('video');
  
  // Reset and start progress animation for current story
  const startProgressAnimation = () => {
    if (progressAnimRefs.current[currentStoryIndex]) {
      // Reset previous stories to full
      progressAnimRefs.current.forEach((anim, index) => {
        if (index < currentStoryIndex) {
          anim.setValue(1);
        } else if (index > currentStoryIndex) {
          anim.setValue(0);
        }
      });
      
      // Reset current story progress
      progressAnimRefs.current[currentStoryIndex].setValue(0);
      
      // Start animation for current story
      if (!isPaused) {
        Animated.timing(progressAnimRefs.current[currentStoryIndex], {
          toValue: 1,
          duration: STORY_DURATION,
          useNativeDriver: false, // width animation doesn't support native driver
        }).start(({ finished }) => {
          if (finished && !isPaused) {
            handleNextStory();
          }
        });
      }
    }
  };

  // Pause progress animation
  const pauseProgress = () => {
    if (progressAnimRefs.current[currentStoryIndex]) {
      progressAnimRefs.current[currentStoryIndex].stopAnimation((value) => {
        pausedTimeRef.current = value;
      });
    }
    setIsPaused(true);
  };

  // Resume progress animation
  const resumeProgress = () => {
    if (progressAnimRefs.current[currentStoryIndex] && isPaused) {
      const remainingDuration = STORY_DURATION * (1 - pausedTimeRef.current);
      Animated.timing(progressAnimRefs.current[currentStoryIndex], {
        toValue: 1,
        duration: remainingDuration,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && !isPaused) {
          handleNextStory();
        }
      });
      setIsPaused(false);
    }
  };

  // Start progress animation when story changes (for images) or component mounts
  useEffect(() => {
    if (!isVideo && stories.length > 0 && progressAnimRefs.current.length === stories.length) {
      // Small delay to ensure animations are initialized
      const timer = setTimeout(() => {
        startProgressAnimation();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStoryIndex, isVideo, stories.length]);

  // Handle video playback when story changes
  useEffect(() => {
    if (isVideo && videoRef.current) {
      // Play video when it becomes current
      videoRef.current.playAsync().catch(() => {});
      setIsPlaying(true);
      setIsPaused(false);
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
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [currentStoryIndex, isVideo, currentStory]);
  
  // Handle video playback status
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      
      // Update progress bar based on video progress
      if (status.durationMillis && progressAnimRefs.current[currentStoryIndex]) {
        const progress = status.positionMillis / status.durationMillis;
        progressAnimRefs.current[currentStoryIndex].setValue(Math.min(progress, 1));
      }
      
      // Auto-advance to next story when video ends
      if (status.didJustFinish) {
        handleNextStory();
      }
    }
  };
  
  // Toggle play/pause on video tap
  const handleVideoPress = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pauseAsync().catch(() => {});
        pauseProgress();
      } else {
        videoRef.current.playAsync().catch(() => {});
        resumeProgress();
      }
    }
  };

  const handleBack = () => {
    // If adId is provided, navigate back to ad detail, otherwise go to place-ad
    if (params.adId) {
      router.push({
        pathname: '/ads/ad-detail',
        params: { adId: params.adId },
      });
    } else {
      router.push('/ads/place-ad');
    }
  };

  const handleRemove = () => {
    // TODO: Implement remove story functionality
    // Only allow remove if not viewing from ad detail
    if (!params.adId) {
      router.push('/ads/place-ad');
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  const handleSeeAd = () => {
    // Navigate to ad detail if adId is provided
    if (params.adId) {
      router.push({
        pathname: '/ads/ad-detail',
        params: { adId: params.adId },
      });
    }
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      // Stop current progress
      if (progressAnimRefs.current[currentStoryIndex]) {
        progressAnimRefs.current[currentStoryIndex].stopAnimation();
      }
      setIsPaused(false);
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const handleNextStory = () => {
    // Stop current progress
    if (progressAnimRefs.current[currentStoryIndex]) {
      progressAnimRefs.current[currentStoryIndex].stopAnimation();
    }
    setIsPaused(false);
    
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      // Last story - navigate back
      handleBack();
    }
  };

  // Swipe gesture handler
  // Swipe left (negative translationX) -> next story
  // Swipe right (positive translationX) -> previous story
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Only activate for horizontal swipes
    .onStart(() => {
      // Pause progress when user starts swiping
      runOnJS(pauseProgress)();
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      const swipeThreshold = 50; // Minimum distance to trigger navigation
      const velocityThreshold = 500; // Minimum velocity to trigger navigation

      // Swipe left (negative translationX) -> next story
      if (translationX < -swipeThreshold || velocityX < -velocityThreshold) {
        if (currentStoryIndex < stories.length - 1) {
          runOnJS(handleNextStory)();
        }
      }
      // Swipe right (positive translationX) -> previous story
      else if (translationX > swipeThreshold || velocityX > velocityThreshold) {
        if (currentStoryIndex > 0) {
          runOnJS(handlePreviousStory)();
        } else {
          // Resume if swipe didn't trigger navigation
          runOnJS(resumeProgress)();
        }
      } else {
        // Resume if swipe didn't trigger navigation
        runOnJS(resumeProgress)();
      }
    });

  if (stories.length === 0) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="dark" />
        <View style={[styles.header, { paddingTop: insets.top + (isSmall ? SPACING.md : SPACING.base) }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name="chevron.left" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{params.adId ? 'Story' : 'My Story (Preview)'}</Text>
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
      <View style={[styles.header, { paddingTop: insets.top + (isSmall ? SPACING.sm : SPACING.base) }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{params.adId ? 'Story' : 'My Story (Preview)'}</Text>
        {!params.adId && (
          <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        )}
        {params.adId && <View style={styles.headerSpacer} />}
      </View>

      {/* Progress Indicators - Positioned below header with top padding and animation */}
      {stories.length > 1 && (
        <View style={[styles.progressContainer, { 
          top: insets.top + (isSmall ? SPACING.sm : SPACING.base) + 40 + 12 + (isSmall ? SPACING.sm : SPACING.base)
        }]}>
          {stories.map((_, index) => {
            const progressWidth = progressAnimRefs.current[index]?.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }) || '0%';
            
            return (
              <View key={index} style={styles.progressBarWrapper}>
                <View style={styles.progressBarBackground} />
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressWidth,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
      )}

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

        {/* Navigation Areas - Tap left side to go to previous, right side to go to next */}
        {currentStoryIndex > 0 && (
          <TouchableOpacity
            style={styles.leftNavArea}
            onPress={() => {
              pauseProgress();
              handlePreviousStory();
            }}
            activeOpacity={0.7}
          />
        )}
        {currentStoryIndex < stories.length - 1 && (
          <TouchableOpacity
            style={styles.rightNavArea}
            onPress={() => {
              pauseProgress();
              handleNextStory();
            }}
            activeOpacity={0.7}
          />
        )}

        {/* Bottom Overlay - Only show "See Ad" button when viewing from ad detail */}
        {params.adId && (
          <View style={[styles.bottomOverlay, { paddingBottom: insets.bottom + (isSmall ? SPACING.md : SPACING.base) }]}>
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
        )}
        </View>
      </GestureDetector>

      {/* Share Button Overlay - Positioned outside storyContent for proper iOS visibility */}
      <TouchableOpacity
        style={[styles.shareButton, { 
          top: insets.top + (isSmall ? SPACING.sm : SPACING.base) + 40 + 12 + (isSmall ? SPACING.sm : SPACING.base) + 3 + SPACING.xs + (isSmall ? SPACING.md : SPACING.base)
        }]}
        onPress={handleShare}
        activeOpacity={0.8}
        {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
        <View style={styles.shareIconContainer}>
          <IconSymbol name="share" size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.shareButtonText}>Share</Text>
      </TouchableOpacity>
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
    // paddingTop set dynamically via inline style using SafeAreaInsets
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
    // Header respects safe area insets to avoid notch/camera cutout overlap
    // Progress bar (zIndex: 30) appears above header
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
    paddingVertical: SPACING.xs,
    position: 'absolute',
    // top set dynamically via inline style - positioned below header with top padding
    left: 0,
    right: 0,
    backgroundColor: 'transparent', // Ensure transparent background
    zIndex: 15,
    // Progress bar positioned below header with additional top padding, above story content
  },
  progressBarWrapper: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  storyContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
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
    width: '33.33%',
    zIndex: 5,
  },
  rightNavArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '33.33%',
    zIndex: 5,
  },
  shareButton: {
    position: 'absolute',
    // top set dynamically via inline style using SafeAreaInsets
    right: 16,
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 25,
    elevation: 10, // Android elevation to ensure visibility
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // Share button positioned below header, visible above story content
    // Moved outside storyContent for proper iOS visibility
  },
  shareIconContainer: {
    marginRight: 8, // Use margin instead of gap for iOS compatibility
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
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
    // paddingBottom set dynamically via inline style using SafeAreaInsets
    paddingTop: 16,
    zIndex: 15,
    // Ensures bottom overlay respects safe area insets for devices with gesture navigation
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
