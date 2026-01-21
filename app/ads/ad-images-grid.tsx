import { IconSymbol } from '@/components/ui/icon-symbol';
import { adService } from '@/services/ad';
import type { Ad } from '@/stores/useAdStore';
import { useAdStore } from '@/stores/useAdStore';
import type { Ad as DatabaseAd } from '@/types/database';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_GAP = 4;
const IMAGE_SIZE = (SCREEN_WIDTH - GRID_GAP * (GRID_COLUMNS + 1)) / GRID_COLUMNS;

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
 * Ad Images Grid Screen
 * 
 * Displays all images for an ad in a grid layout (3 columns).
 * Clicking an image opens the full-screen view at that image.
 */
export default function AdImagesGridScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ adId?: string; initialIndex?: string }>();
  const ads = useAdStore((state) => state.ads);
  
  // Ad state - can come from store or database
  const [ad, setAd] = useState<Ad | null>(null);
  const [isLoadingAd, setIsLoadingAd] = useState(true);

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
          console.error('[AdImagesGrid] Error loading ad:', result.error);
          setAd(null);
        } else {
          // Convert database ad to store format
          const convertedAd = convertDatabaseAdToStore(result.ad);
          setAd(convertedAd);
        }
      } catch (error) {
        console.error('[AdImagesGrid] Exception loading ad:', error);
        setAd(null);
      } finally {
        setIsLoadingAd(false);
      }
    };

    loadAd();
  }, [params.adId, ads]);

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

  const images = ad.uploadedImages || [];

  const handleBack = () => {
    router.replace({
      pathname: '/ads/ad-detail',
      params: {
        adId: ad.id,
      },
    });
  };

  const handleImagePress = (index: number) => {
    router.push({
      pathname: '/ads/ad-images',
      params: {
        adId: ad.id,
        initialIndex: index.toString(),
      },
    });
  };

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={styles.imageItem}
      onPress={() => handleImagePress(index)}
      activeOpacity={0.8}
      {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
      <Image source={{ uri: item }} style={styles.gridImage} resizeMode="cover" />
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>All Images</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Image Grid */}
      {images.length > 0 ? (
        <FlatList
          data={images}
          numColumns={GRID_COLUMNS}
          keyExtractor={(item, index) => `${item}-${index}`}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow}
          renderItem={renderImageItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <IconSymbol name="photo" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No images available</Text>
        </View>
      )}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  headerSpacer: {
    width: 40,
  },
  gridContainer: {
    padding: GRID_GAP,
  },
  gridRow: {
    justifyContent: 'flex-start',
    marginBottom: GRID_GAP,
  },
  imageItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginRight: GRID_GAP,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    marginTop: 12,
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
