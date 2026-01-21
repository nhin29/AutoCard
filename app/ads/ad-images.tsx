import { IconSymbol } from '@/components/ui/icon-symbol';
import { adService } from '@/services/ad';
import type { Ad } from '@/stores/useAdStore';
import { useAdStore } from '@/stores/useAdStore';
import type { Ad as DatabaseAd } from '@/types/database';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Convert database Ad format to store Ad format
 */
function convertDatabaseAdToStore(ad: DatabaseAd): Ad {
  return {
    id: ad.id,
    userId: ad.user_id,
    category: ad.category,
    phoneNumber: ad.phone_number || '',
    location: ad.location || '',
    currency: ad.currency,
    amount: ad.amount?.toString() || '',
    description: ad.description || '',
    itemName: ad.item_name,
    uploadedImages: ad.uploaded_images,
    uploadedStories: ad.uploaded_stories,
    vehicleLicenseNumber: ad.vehicle_license_number || '',
    status: ad.status || '',
    adType: ad.ad_type || '',
    mileage: ad.mileage || '',
    mileageUnit: ad.mileage_unit || '',
    motNctStatus: ad.mot_nct_status || '',
    vanMake: ad.van_make || '',
    vanModel: ad.van_model || '',
    vanYearOfProduction: ad.van_year_of_production || '',
    loadCapacity: ad.load_capacity || '',
    createdAt: ad.created_at,
    updatedAt: ad.updated_at,
  };
}

/**
 * Ad Images Screen
 * 
 * Displays all images for an ad in a full-screen gallery view
 * with navigation controls and image counter.
 */
export default function AdImagesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ adId?: string; initialIndex?: string }>();
  const ads = useAdStore((state) => state.ads);
  const [currentImageIndex, setCurrentImageIndex] = useState(
    params.initialIndex ? parseInt(params.initialIndex) : 0
  );
  
  // Ad state - can come from store or database
  const [ad, setAd] = useState<Ad | null>(null);
  const [isLoadingAd, setIsLoadingAd] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);
  const images = ad?.uploadedImages || [];
  const isScrollingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // Load ad from store or database
  useEffect(() => {
    const loadAd = async () => {
      if (!params.adId) {
        setIsLoadingAd(false);
        return;
      }

      // First check store
      const storeAd = ads.find((a) => a.id === params.adId);
      if (storeAd) {
        setAd(storeAd);
        setIsLoadingAd(false);
        return;
      }

      // If not in store, fetch from database
      try {
        setIsLoadingAd(true);
        const result = await adService.getAdById(params.adId);
        
        if (result.error || !result.ad) {
          console.error('[AdImages] Error loading ad:', result.error);
          setAd(null);
        } else {
          // Convert database ad to store format
          const convertedAd = convertDatabaseAdToStore(result.ad);
          setAd(convertedAd);
        }
      } catch (error) {
        console.error('[AdImages] Exception loading ad:', error);
        setAd(null);
      } finally {
        setIsLoadingAd(false);
      }
    };

    loadAd();
  }, [params.adId, ads]);

  // Initialize scroll position when images or initialIndex changes
  useEffect(() => {
    if (images.length === 0) {
      return;
    }

    const parsedInitialIndex = params.initialIndex
      ? Number.parseInt(params.initialIndex, 10)
      : 0;
    const maxInitialIndex = Math.max(images.length - 1, 0);
    const safeInitialIndex =
      Number.isFinite(parsedInitialIndex) && parsedInitialIndex >= 0
        ? Math.min(parsedInitialIndex, maxInitialIndex)
        : 0;

    // Only initialize once or when initialIndex changes
    if (!hasInitializedRef.current || params.initialIndex !== undefined) {
      setCurrentImageIndex(safeInitialIndex);
      hasInitializedRef.current = true;

      // Delay scroll to ensure FlatList is mounted and measured
      const timeoutId = setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: safeInitialIndex,
            animated: false,
          });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [images.length, params.initialIndex]);

  // Handle scrollToIndex failures - fallback to scrollToOffset
  const handleScrollToIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
      const wait = new Promise((resolve) => setTimeout(resolve, 500));
      wait.then(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: false,
          });
        }
      });
    },
    []
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      // Only update if not currently programmatically scrolling
      if (!isScrollingRef.current && viewableItems.length > 0) {
        const index = viewableItems[0].index;
        if (index !== null && index !== undefined && index !== currentImageIndex) {
          setCurrentImageIndex(index);
        }
      }
    },
    [currentImageIndex]
  );

  if (isLoadingAd) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </View>
    );
  }

  if (!ad) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ad not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleBack = () => {
    if (ad) {
      router.replace({
        pathname: '/ads/ad-detail',
        params: {
          adId: ad.id,
        },
      });
      return;
    }

    router.back();
  };

  const handleViewAll = () => {
    router.push({
      pathname: '/ads/ad-images-grid',
      params: {
        adId: ad.id,
        initialIndex: currentImageIndex.toString(),
      },
    });
  };

  const handleImageChange = (index: number) => {
    if (index >= 0 && index < images.length && index !== currentImageIndex) {
      isScrollingRef.current = true;
      setCurrentImageIndex(index);
      flatListRef.current?.scrollToIndex({ 
        index, 
        animated: true,
      });
      // Reset scrolling flag after animation completes
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Only update index during manual scrolling (not programmatic)
    if (!isScrollingRef.current) {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
      if (index >= 0 && index < images.length && index !== currentImageIndex) {
        setCurrentImageIndex(index);
      }
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={handleBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.imageCounter}>
          {currentImageIndex + 1}/{images.length}
        </Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={handleViewAll}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={styles.viewAllButtonText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Main Image Display */}
      <View style={styles.imageContainer}>
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `${item}-${index}`}
          initialScrollIndex={currentImageIndex}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item }) => (
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: item }}
                style={styles.mainImage}
                resizeMode="contain"
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.imagePlaceholder}>
              <IconSymbol name="photo" size={48} color="#9CA3AF" />
            </View>
          }
          decelerationRate="fast"
        />

        {/* Progress Dots - Overlay on Image */}
        {images.length > 1 && (
          <View style={styles.progressDotsContainer}>
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleImageChange(index)}
                activeOpacity={0.7}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View
                  style={[
                    styles.progressDot,
                    index === currentImageIndex && styles.progressDotActive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  viewAllButton: {
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
});
