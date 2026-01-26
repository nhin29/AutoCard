import { getCategoryImage } from '@/components/place-ad/category-images';
import { CategorySelector } from '@/components/place-ad/CategorySelector';
import { ContactFields } from '@/components/place-ad/ContactFields';
import { DescriptionInput } from '@/components/place-ad/DescriptionInput';
import { DropdownOption } from '@/components/place-ad/DropdownModal';
import { ImageUploader } from '@/components/place-ad/ImageUploader';
import { PlaceAdActions } from '@/components/place-ad/PlaceAdActions';
import { PlaceAdHeader } from '@/components/place-ad/PlaceAdHeader';
import { PriceInput } from '@/components/place-ad/PriceInput';
import { StoryUploader } from '@/components/place-ad/StoryUploader';
import { SubscriptionBanner } from '@/components/place-ad/SubscriptionBanner';
import { VehicleFields } from '@/components/place-ad/VehicleFields';
import { adService } from '@/services/ad';
import type { Ad } from '@/stores/useAdStore';
import { useAdStore } from '@/stores/useAdStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { AdStatus, AdType, Ad as DatabaseAd, MileageUnit } from '@/types/database';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

/**
 * Place Ad Screen - Refactored
 * 
 * Form for creating a new advertisement using modular components.
 */
/**
 * Map database status to form status
 * Database: 'new', 'used', 'certified'
 * Form: 'available', 'sold', 'pending', 'reserved', 'on-hold'
 */
function mapStatusFromDb(dbStatus: string | null): string {
  if (!dbStatus) return '';
  
  const statusMap: Record<string, string> = {
    'new': 'available',
    'used': 'sold',
    'certified': 'available', // Map certified to available
  };
  
  return statusMap[dbStatus] || '';
}

/**
 * Map database ad type to form ad type
 * Database: 'sale', 'rent', 'lease'
 * Form: 'sell', 'buy', 'rent', 'auction', 'trade'
 */
function mapAdTypeFromDb(dbAdType: string | null): string {
  if (!dbAdType) return '';
  
  const adTypeMap: Record<string, string> = {
    'sale': 'sell',
    'rent': 'rent',
    'lease': 'rent', // Map lease to rent
  };
  
  return adTypeMap[dbAdType] || '';
}

/**
 * Map database mileage unit to form mileage unit
 * Database: 'km', 'miles' (lowercase)
 * Form: 'KM', 'Miles' (uppercase)
 */
function mapMileageUnitFromDb(dbMileageUnit: string | null): string {
  if (!dbMileageUnit) return 'KM';
  
  const mileageUnitMap: Record<string, string> = {
    'km': 'KM',
    'miles': 'Miles',
  };
  
  return mileageUnitMap[dbMileageUnit.toLowerCase()] || 'KM';
}

/**
 * Map form status to database status
 * Form: 'available', 'sold', 'pending', 'reserved', 'on-hold'
 * Database: 'new', 'used', 'certified'
 */
function mapStatusToDb(formStatus: string): string | null {
  if (!formStatus) return null;
  
  const statusMap: Record<string, string> = {
    'available': 'new',
    'sold': 'used',
    'pending': 'new',
    'reserved': 'new',
    'on-hold': 'new',
  };
  
  return statusMap[formStatus] || 'new';
}

/**
 * Map form ad type to database ad type
 * Form: 'sell', 'buy', 'rent', 'auction', 'trade'
 * Database: 'sale', 'rent', 'lease'
 */
function mapAdTypeToDb(formAdType: string): string | null {
  if (!formAdType) return null;
  
  const adTypeMap: Record<string, string> = {
    'sell': 'sale',
    'buy': 'sale',
    'rent': 'rent',
    'auction': 'sale',
    'trade': 'sale',
  };
  
  return adTypeMap[formAdType] || 'sale';
}

/**
 * Map form mileage unit to database mileage unit
 * Form: 'KM', 'Miles'
 * Database: 'km', 'miles'
 */
function mapMileageUnitToDb(formMileageUnit: string): string | null {
  if (!formMileageUnit) return null;
  
  const unitMap: Record<string, string> = {
    'KM': 'km',
    'Miles': 'miles',
  };
  
  return unitMap[formMileageUnit] || 'km';
}

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
    status: mapStatusFromDb(ad.status),
    adType: mapAdTypeFromDb(ad.ad_type),
    mileage: ad.mileage || '',
    mileageUnit: mapMileageUnitFromDb(ad.mileage_unit),
    motNctStatus: ad.mot_nct_status || '',
    vanMake: ad.van_make || '',
    vanModel: ad.van_model || '',
    vanYearOfProduction: ad.van_year_of_production || '',
    loadCapacity: ad.load_capacity || '',
    createdAt: ad.created_at,
    updatedAt: ad.updated_at,
  };
}

export default function PlaceAdScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ scannedPlateNumber?: string; showPlateInput?: string; adId?: string }>();
  const { user } = useAuthStore();
  const addAd = useAdStore((state) => state.addAd);
  const updateAd = useAdStore((state) => state.updateAd);
  const getAdById = useAdStore((state) => state.getAdById);
  const syncAdFromDatabase = useAdStore((state) => state.syncAdFromDatabase);
  const draftAd = useAdStore((state) => state.draftAd);
  const setDraftAd = useAdStore((state) => state.setDraftAd);
  
  // Loading state for ad creation/editing
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Check if user is a guest (no session/user = guest)
  const isGuest = !user;
  
  // Basic form state
  const [category, setCategory] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [currency, setCurrency] = useState('€');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [itemName, setItemName] = useState('');
  
  // Image and story state
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedStories, setUploadedStories] = useState<string[]>([]);
  
  // Vehicle fields state
  const [vehicleLicenseNumber, setVehicleLicenseNumber] = useState('');
  const [status, setStatus] = useState('');
  const [adType, setAdType] = useState('');
  const [mileage, setMileage] = useState('');
  const [mileageUnit, setMileageUnit] = useState('KM');
  const [motNctStatus, setMotNctStatus] = useState('');
  const [vanMake, setVanMake] = useState('');
  const [vanModel, setVanModel] = useState('');
  const [vanYearOfProduction, setVanYearOfProduction] = useState('');
  const [loadCapacity, setLoadCapacity] = useState('');
  
  // Check if user is guest when component mounts
  useEffect(() => {
    if (isGuest) {
      Alert.alert(
        'Sign Up Required',
        'Guest users cannot create ads. Please sign up to post your advertisement.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
          {
            text: 'Sign Up',
            onPress: () => {
              router.replace('/auth/signup');
            },
          },
        ]
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuest]);

  // Restore draft data when component mounts
  useEffect(() => {
    if (draftAd) {
      setCategory(draftAd.category || '');
      setPhoneNumber(draftAd.phoneNumber || '');
      setLocation(draftAd.location || '');
      setCurrency(draftAd.currency || '€');
      setAmount(draftAd.amount || '');
      setDescription(draftAd.description || '');
      setItemName(draftAd.itemName || '');
      setUploadedImages(draftAd.uploadedImages || []);
      setUploadedStories(draftAd.uploadedStories || []);
      setVehicleLicenseNumber(draftAd.vehicleLicenseNumber || '');
      setStatus(draftAd.status || '');
      setAdType(draftAd.adType || '');
      setMileage(draftAd.mileage || '');
      setMileageUnit(draftAd.mileageUnit || 'KM');
      setMotNctStatus(draftAd.motNctStatus || '');
      setVanMake(draftAd.vanMake || '');
      setVanModel(draftAd.vanModel || '');
      setVanYearOfProduction(draftAd.vanYearOfProduction || '');
      setLoadCapacity(draftAd.loadCapacity || '');
    }
  }, [draftAd]);

  // Load ad data when editing (adId is provided)
  useEffect(() => {
    const loadAdForEdit = async () => {
      if (!params.adId || !user?.id) {
        setIsLoadingAd(false);
        return;
      }

      try {
        setIsLoadingAd(true);
        setIsEditMode(true);
        const result = await adService.getAdById(params.adId);
        
        if (result.error || !result.ad) {
          Alert.alert('Error', 'Failed to load ad. Please try again.');
          router.back();
          return;
        }

        // Check if user owns this ad
        if (result.ad.user_id !== user.id) {
          Alert.alert('Error', 'You can only edit your own ads.');
          router.back();
          return;
        }

        // Convert database ad to store format
        const convertedAd = convertDatabaseAdToStore(result.ad);
        
        // Populate form fields with ad data
        setCategory(convertedAd.category || '');
        setPhoneNumber(convertedAd.phoneNumber || '');
        setLocation(convertedAd.location || '');
        setCurrency(convertedAd.currency || '€');
        setAmount(convertedAd.amount || '');
        setDescription(convertedAd.description || '');
        setItemName(convertedAd.itemName || '');
        setUploadedImages(convertedAd.uploadedImages || []);
        setUploadedStories(convertedAd.uploadedStories || []);
        setVehicleLicenseNumber(convertedAd.vehicleLicenseNumber || '');
        setStatus(convertedAd.status || '');
        setAdType(convertedAd.adType || '');
        setMileage(convertedAd.mileage || '');
        setMileageUnit(convertedAd.mileageUnit || 'KM');
        setMotNctStatus(convertedAd.motNctStatus || '');
        setVanMake(convertedAd.vanMake || '');
        setVanModel(convertedAd.vanModel || '');
        setVanYearOfProduction(convertedAd.vanYearOfProduction || '');
        setLoadCapacity(convertedAd.loadCapacity || '');
      } catch (error) {
        Alert.alert('Error', 'Failed to load ad. Please try again.');
        router.back();
      } finally {
        setIsLoadingAd(false);
      }
    };

    loadAdForEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.adId, user?.id]);

  // Handle scanned plate number from camera scanner
  useEffect(() => {
    if (params.scannedPlateNumber) {
      setVehicleLicenseNumber(params.scannedPlateNumber);
      // Auto-select a vehicle category if not already selected
      if (!category) {
        setCategory('cars');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.scannedPlateNumber]);
  
  // Modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAdTypeModal, setShowAdTypeModal] = useState(false);
  const [showMileageUnitModal, setShowMileageUnitModal] = useState(false);
  const [showMotNctModal, setShowMotNctModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLoadCapacityModal, setShowLoadCapacityModal] = useState(false);
  
  // Dropdown position tracking
  const [dropdownLayouts, setDropdownLayouts] = useState<{
    [key: string]: { x: number; y: number; width: number; height: number };
  }>({});
  
  // Refs for measuring dropdown positions
  const categoryRef = useRef<View>(null);
  const statusRef = useRef<View>(null);
  const adTypeRef = useRef<View>(null);
  const mileageUnitRef = useRef<View>(null);
  const motNctRef = useRef<View>(null);
  const currencyRef = useRef<View>(null);
  const loadCapacityRef = useRef<View>(null);

  // Options data
  const vehicleCategories: DropdownOption[] = [
    { id: 'cars', name: 'Cars', image: getCategoryImage('cars') },
    { id: 'motorbikes', name: 'Motorbikes', image: getCategoryImage('motorbikes') },
    { id: 'car-parts', name: 'Car Parts', image: getCategoryImage('car-parts') },
    { id: 'van-light-commercials', name: 'Van & Light Commercials', image: getCategoryImage('van-light-commercials') },
    { id: 'car-extras', name: 'Car Extras', image: getCategoryImage('car-extras') },
    { id: 'coaches-buses', name: 'Coaches and Buses', image: getCategoryImage('coaches-buses') },
    { id: 'modified-cars', name: 'Modified cars', image: getCategoryImage('modified-cars') },
    { id: 'motorbike-extras', name: 'Motorbike Extras', image: getCategoryImage('motorbike-extras') },
    { id: 'vintage-cars', name: 'Vintage Cars', image: getCategoryImage('vintage-cars') },
    { id: 'breakings-repairables', name: 'Breakings and Repairables', image: getCategoryImage('breakings-repairables') },
    { id: 'rally-cars', name: 'Rally Cars', image: getCategoryImage('rally-cars') },
    { id: 'trucks', name: 'Trucks', image: getCategoryImage('trucks') },
    { id: 'vintage-bikes', name: 'Vintage Bikes', image: getCategoryImage('vintage-bikes') },
    { id: 'campers', name: 'Campers', image: getCategoryImage('campers') },
    { id: 'moped', name: 'Moped', image: getCategoryImage('moped') },
    { id: 'new-car', name: 'New Car', image: getCategoryImage('new-car') },
    { id: 'dealerships', name: 'Dealerships', image: getCategoryImage('dealerships') },
  ];

  const mileageUnits: DropdownOption[] = [
    { id: 'KM', name: 'KM' },
    { id: 'Miles', name: 'Miles' },
  ];

  const currencyOptions: DropdownOption[] = [
    { id: '€', name: '€' },
    { id: '$', name: '$' },
    { id: '£', name: '£' },
    { id: '¥', name: '¥' },
    { id: '₹', name: '₹' },
    { id: 'A$', name: 'A$' },
    { id: 'C$', name: 'C$' },
  ];

  const loadCapacityOptions: DropdownOption[] = [
    { id: '500', name: 'Up to 500 kg' },
    { id: '750', name: 'Up to 750 kg' },
    { id: '1000', name: 'Up to 1,000 kg' },
    { id: '1500', name: 'Up to 1,500 kg' },
    { id: '2000', name: 'Up to 2,000 kg' },
    { id: '2500', name: 'Up to 2,500 kg' },
    { id: '3000', name: 'Up to 3,000 kg' },
    { id: '3500', name: 'Up to 3,500 kg' },
    { id: '4000', name: 'Up to 4,000 kg' },
    { id: '5000', name: 'Up to 5,000 kg' },
    { id: '6000', name: 'Up to 6,000 kg' },
    { id: '7000', name: 'Up to 7,000 kg' },
    { id: '8000', name: 'Up to 8,000 kg' },
    { id: '9000', name: 'Up to 9,000 kg' },
    { id: '10000', name: 'Up to 10,000 kg' },
    { id: 'custom', name: 'Custom' },
  ];

  const motNctStatusOptions: DropdownOption[] = [
    { id: 'valid', name: 'Valid' },
    { id: 'expired', name: 'Expired' },
    { id: 'not-required', name: 'Not Required' },
    { id: 'pending', name: 'Pending' },
  ];

  const adTypeOptions: DropdownOption[] = [
    { id: 'sell', name: 'Sell' },
    { id: 'buy', name: 'Buy' },
    { id: 'rent', name: 'Rent' },
    { id: 'auction', name: 'Auction' },
    { id: 'trade', name: 'Trade' },
  ];

  const statusOptions: DropdownOption[] = [
    { id: 'available', name: 'Available' },
    { id: 'sold', name: 'Sold' },
    { id: 'pending', name: 'Pending' },
    { id: 'reserved', name: 'Reserved' },
    { id: 'on-hold', name: 'On Hold' },
  ];

  // Category-based field visibility
  const categoriesWithLicenseNumber = [
    'cars',
    'motorbikes',
    'van-light-commercials',
    'coaches-buses',
    'modified-cars',
    'vintage-cars',
    'rally-cars',
    'trucks',
    'vintage-bikes',
    'new-car',
    'dealerships',
  ];

  const categoriesWithAdType = [
    'cars',
    'motorbikes',
    'van-light-commercials',
    'coaches-buses',
    'modified-cars',
    'motorbike-extras',
    'vintage-cars',
    'breakings-repairables',
    'rally-cars',
    'trucks',
    'vintage-bikes',
    'campers',
    'moped',
    'new-car',
    'dealerships',
  ];

  const categoriesWithMileage = [
    'cars',
    'motorbikes',
    'van-light-commercials',
    'coaches-buses',
    'modified-cars',
    'vintage-cars',
    'rally-cars',
    'trucks',
    'vintage-bikes',
    'campers',
    'moped',
  ];

  const categoriesWithMotNct = [
    'motorbikes',
    'coaches-buses',
    'modified-cars',
    'vintage-cars',
    'rally-cars',
    'trucks',
    'vintage-bikes',
    'campers',
    'moped',
  ];

  const showLicenseNumberField = Boolean(category && categoriesWithLicenseNumber.includes(category));
  const showAdTypeField = Boolean(category && categoriesWithAdType.includes(category));
  const showMileageField = Boolean(category && categoriesWithMileage.includes(category));
  const showMotNctField = Boolean(category && categoriesWithMotNct.includes(category));
  const showVanFields = Boolean(category === 'van-light-commercials');

  // Measure dropdown position
  const measureDropdown = (key: string, ref: React.RefObject<View | null>) => {
    if (!ref.current) return;
    ref.current.measureInWindow((x, y, width, height) => {
      setDropdownLayouts((prev) => ({
        ...prev,
        [key]: { x, y, width, height },
      }));
    });
  };

  // Handle dropdown open with measurement
  const handleDropdownOpen = (
    key: string,
    ref: React.RefObject<View | null>,
    setter: (value: boolean) => void
  ) => {
    // Close all other dropdowns
    setShowCategoryModal(false);
    setShowStatusModal(false);
    setShowAdTypeModal(false);
    setShowMileageUnitModal(false);
    setShowMotNctModal(false);
    setShowCurrencyModal(false);
    setShowLoadCapacityModal(false);
    
    // Measure position and open
    setTimeout(() => {
      measureDropdown(key, ref);
      setter(true);
    }, 0);
  };

  const handleBack = () => {
    // Always navigate to home page instead of going back in history
    // This prevents going back to preview page when coming from preview
    router.replace('/(tabs)');
  };

  const handleReset = () => {
    setCategory('');
    setPhoneNumber('');
    setLocation('');
    setCurrency('€');
    setAmount('');
    setDescription('');
    setUploadedImages([]);
    setUploadedStories([]);
    setItemName('');
    setStatus('');
    setVehicleLicenseNumber('');
    setAdType('');
    setMileage('');
    setMileageUnit('KM');
    setMotNctStatus('');
    setVanMake('');
    setVanModel('');
    setVanYearOfProduction('');
    setLoadCapacity('');
  };

  /**
   * Handle publish action - creates ad in Supabase database
   * Validates required fields, uploads images/stories, and creates ad record
   */
  const handlePublish = async () => {
    // Check if user is a guest
    if (isGuest) {
      Alert.alert(
        'Sign Up Required',
        'Guest users cannot create ads. Please sign up to post your advertisement.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Up',
            onPress: () => {
              router.push('/auth/signup');
            },
          },
        ]
      );
      return;
    }
    
    // Validate required fields
    if (!category) {
      Alert.alert('Validation Error', 'Please select a category');
      return;
    }
    
    if (!itemName) {
      Alert.alert('Validation Error', 'Please enter an item name');
      return;
    }
    
    if (!amount) {
      Alert.alert('Validation Error', 'Please enter a price');
      return;
    }
    
    // Validate amount is a valid number
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return;
    }
    
    if (!user?.id) {
      Alert.alert('Error', 'User ID is missing. Please sign in again.');
      return;
    }
    
    // Set loading state
    setIsPublishing(true);
    
    try {
      // Collect all form data
      const adFormData = {
        // Basic fields
        category,
        phoneNumber,
        location,
        currency,
        amount,
        description,
        itemName,
        
        // Image and story fields (local URIs)
        uploadedImages,
        uploadedStories,
        
        // Vehicle fields
        vehicleLicenseNumber,
        status,
        adType,
        mileage,
        mileageUnit,
        motNctStatus,
        vanMake,
        vanModel,
        vanYearOfProduction,
        loadCapacity,
      };
      
      if (isEditMode && params.adId) {
        // Update existing ad
        
        // Upload new images/stories if any
        let imageUrls = uploadedImages.filter(url => url.startsWith('http')); // Keep existing URLs
        let storyUrls = uploadedStories.filter(url => url.startsWith('http')); // Keep existing URLs
        
        const newImages = uploadedImages.filter(url => !url.startsWith('http'));
        const newStories = uploadedStories.filter(url => !url.startsWith('http'));
        
        if (newImages.length > 0) {
          const uploadResult = await adService.uploadAdImages(newImages, user.id, params.adId);
          if (uploadResult.errors.length > 0) {
            Alert.alert('Error', `Failed to upload images: ${uploadResult.errors.join(', ')}`);
            setIsPublishing(false);
            return;
          }
          imageUrls = [...imageUrls, ...uploadResult.urls];
        }
        
        if (newStories.length > 0) {
          const uploadResult = await adService.uploadAdStories(newStories, user.id, params.adId);
          if (uploadResult.errors.length > 0) {
            Alert.alert('Error', `Failed to upload stories: ${uploadResult.errors.join(', ')}`);
            setIsPublishing(false);
            return;
          }
          storyUrls = [...storyUrls, ...uploadResult.urls];
        }
        
        // Prepare update data - map form values to database values
        const updateData = {
          category,
          item_name: itemName,
          description: description || null,
          vehicle_license_number: vehicleLicenseNumber || null,
          status: mapStatusToDb(status) as AdStatus | null,
          ad_type: mapAdTypeToDb(adType) as AdType | null,
          mileage: mileage || null,
          mileage_unit: mapMileageUnitToDb(mileageUnit) as MileageUnit | null,
          mot_nct_status: motNctStatus || null,
          van_make: vanMake || null,
          van_model: vanModel || null,
          van_year_of_production: vanYearOfProduction || null,
          load_capacity: loadCapacity || null,
          currency: currency || 'EUR',
          amount: amountNum,
          location: location || null,
          phone_number: phoneNumber || null,
          uploaded_images: imageUrls,
          uploaded_stories: storyUrls,
        };
        
        const updateResult = await adService.updateAd(params.adId, updateData);
        
        if (updateResult.error) {
          Alert.alert(
            'Error',
            `Failed to update ad: ${updateResult.error}`,
            [{ text: 'OK' }]
          );
          setIsPublishing(false);
          return;
        }
        
        if (!updateResult.ad) {
          Alert.alert(
            'Error',
            'Ad update failed. Please try again.',
            [{ text: 'OK' }]
          );
          setIsPublishing(false);
          return;
        }
        
        // Convert database ad to store format for local state
        const storeAd: Ad = convertDatabaseAdToStore(updateResult.ad);
        
        // Sync ad in store - this will update if exists, or add if new
        // syncAdFromDatabase checks for existing ad by ID and updates it, preventing duplicates
        syncAdFromDatabase(storeAd);
        
        // Clear draft
        setDraftAd(null);
        
        // Show success message
        Alert.alert(
          'Success',
          'Ad updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                router.back();
              },
            },
          ]
        );
      } else {
        // Create new ad
        const result = await adService.createAd(adFormData, user.id);
        
        if (result.error) {
          Alert.alert(
            'Error',
            `Failed to create ad: ${result.error}`,
            [{ text: 'OK' }]
          );
          setIsPublishing(false);
          return;
        }
        
        if (!result.ad) {
          Alert.alert(
            'Error',
            'Ad creation failed. Please try again.',
            [{ text: 'OK' }]
          );
          setIsPublishing(false);
          return;
        }
        
        // Convert database ad to store format for local state
        const storeAd: Ad = convertDatabaseAdToStore(result.ad);
        
        // Add to local store for immediate UI update
        addAd(storeAd);
        
        // Clear draft
        setDraftAd(null);
        
        // Show success message
        Alert.alert(
          'Success',
          'Your ad has been published successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form and navigate back
                handleReset();
                router.back();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        `An unexpected error occurred: ${error?.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsPublishing(false);
    }
  };

  /**
   * Handle preview action - navigates to preview page with current form data
   * Saves form data to draft store for restoration when navigating back
   */
  const handlePreview = () => {
    // Collect all form data
    const adData = {
      // Basic fields
      category,
      phoneNumber,
      location,
      currency,
      amount,
      description,
      itemName,
      
      // Image and story fields
      uploadedImages,
      uploadedStories,
      
      // Vehicle fields
      vehicleLicenseNumber,
      status,
      adType,
      mileage,
      mileageUnit,
      motNctStatus,
      vanMake,
      vanModel,
      vanYearOfProduction,
      loadCapacity,
    };
    
    // Save to draft store for restoration when navigating back
    setDraftAd(adData);
    
    // Navigate to preview page with ad data
    router.push({
      pathname: '/ads/preview-ad',
      params: {
        adData: JSON.stringify(adData),
      },
    });
  };

  const handleUpgradePlan = () => {
    // TODO: Implement upgrade plan logic
  };

  // Show loading indicator while loading ad for edit
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <StatusBar style="dark" />

      <PlaceAdHeader onBack={handleBack} onReset={handleReset} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        
        <CategorySelector
          selectedCategory={category}
          categories={vehicleCategories}
          onSelect={setCategory}
          isOpen={showCategoryModal}
          onOpen={() => handleDropdownOpen('category', categoryRef, setShowCategoryModal)}
          onClose={() => setShowCategoryModal(false)}
          dropdownRef={categoryRef}
          dropdownPosition={dropdownLayouts.category}
        />

        <VehicleFields
          category={category}
          showLicenseNumberField={showLicenseNumberField}
          vehicleLicenseNumber={vehicleLicenseNumber}
          onVehicleLicenseNumberChange={setVehicleLicenseNumber}
          itemName={itemName}
          onItemNameChange={setItemName}
          status={status}
          onStatusChange={setStatus}
          statusOptions={statusOptions}
          showStatusModal={showStatusModal}
          onStatusModalOpen={() => handleDropdownOpen('status', statusRef, setShowStatusModal)}
          onStatusModalClose={() => setShowStatusModal(false)}
          statusRef={statusRef}
          statusDropdownPosition={dropdownLayouts.status}
          showAdTypeField={showAdTypeField}
          adType={adType}
          onAdTypeChange={setAdType}
          adTypeOptions={adTypeOptions}
          showAdTypeModal={showAdTypeModal}
          onAdTypeModalOpen={() => handleDropdownOpen('adType', adTypeRef, setShowAdTypeModal)}
          onAdTypeModalClose={() => setShowAdTypeModal(false)}
          adTypeRef={adTypeRef}
          adTypeDropdownPosition={dropdownLayouts.adType}
          showMileageField={showMileageField}
          mileage={mileage}
          onMileageChange={setMileage}
          mileageUnit={mileageUnit}
          onMileageUnitChange={setMileageUnit}
          mileageUnitOptions={mileageUnits}
          showMileageUnitModal={showMileageUnitModal}
          onMileageUnitModalOpen={() => handleDropdownOpen('mileageUnit', mileageUnitRef, setShowMileageUnitModal)}
          onMileageUnitModalClose={() => setShowMileageUnitModal(false)}
          mileageUnitRef={mileageUnitRef}
          mileageUnitDropdownPosition={dropdownLayouts.mileageUnit}
          showMotNctField={showMotNctField}
          motNctStatus={motNctStatus}
          onMotNctStatusChange={setMotNctStatus}
          motNctStatusOptions={motNctStatusOptions}
          showMotNctModal={showMotNctModal}
          onMotNctModalOpen={() => handleDropdownOpen('motNct', motNctRef, setShowMotNctModal)}
          onMotNctModalClose={() => setShowMotNctModal(false)}
          motNctRef={motNctRef}
          motNctDropdownPosition={dropdownLayouts.motNct}
          showVanFields={showVanFields}
          vanMake={vanMake}
          onVanMakeChange={setVanMake}
          vanModel={vanModel}
          onVanModelChange={setVanModel}
          vanYearOfProduction={vanYearOfProduction}
          onVanYearOfProductionChange={setVanYearOfProduction}
          loadCapacity={loadCapacity}
          onLoadCapacityChange={setLoadCapacity}
          loadCapacityOptions={loadCapacityOptions}
          showLoadCapacityModal={showLoadCapacityModal}
          onLoadCapacityModalOpen={() => handleDropdownOpen('loadCapacity', loadCapacityRef, setShowLoadCapacityModal)}
          onLoadCapacityModalClose={() => setShowLoadCapacityModal(false)}
          loadCapacityRef={loadCapacityRef}
          loadCapacityDropdownPosition={dropdownLayouts.loadCapacity}
        />

        <ImageUploader
          images={uploadedImages}
          onImagesChange={setUploadedImages}
          maxImages={20}
        />

        <StoryUploader
          stories={uploadedStories}
          onStoriesChange={setUploadedStories}
          maxStories={5}
          onBeforePreview={() => {
            // Save draft before navigating to preview story
            const adData = {
              category,
              phoneNumber,
              location,
              currency,
              amount,
              description,
              itemName,
              uploadedImages,
              uploadedStories,
              vehicleLicenseNumber,
              status,
              adType,
              mileage,
              mileageUnit,
              motNctStatus,
              vanMake,
              vanModel,
              vanYearOfProduction,
              loadCapacity,
            };
            setDraftAd(adData);
          }}
        />

        <ContactFields
          phoneNumber={phoneNumber}
          location={location}
          onPhoneNumberChange={setPhoneNumber}
          onLocationChange={setLocation}
        />

        <PriceInput
          currency={currency}
          amount={amount}
          onCurrencyChange={setCurrency}
          onAmountChange={setAmount}
          currencyOptions={currencyOptions}
          isCurrencyModalOpen={showCurrencyModal}
          onCurrencyModalOpen={() => handleDropdownOpen('currency', currencyRef, setShowCurrencyModal)}
          onCurrencyModalClose={() => setShowCurrencyModal(false)}
          currencyRef={currencyRef}
          currencyDropdownPosition={dropdownLayouts.currency}
        />

        <DescriptionInput
          description={description}
          onDescriptionChange={setDescription}
        />

        <SubscriptionBanner onUpgradePlan={handleUpgradePlan} />

        <PlaceAdActions
          onPublish={handlePublish}
          onPreview={handlePreview}
          isPublishing={isPublishing}
          isEditMode={isEditMode}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
});
