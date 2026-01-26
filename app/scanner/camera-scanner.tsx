import { recognizePlateFromUri } from '@/services/plateRecognition';
import * as Device from 'expo-device';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    StyleSheet,
    View,
} from 'react-native';

/**
 * Camera Scanner Screen
 *
 * Launches default camera interface for scanning vehicle license plates.
 */

export default function CameraScannerScreen() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleManualEntry = () => {
    router.replace({
      pathname: '/ads/place-ad',
      params: {
        showPlateInput: 'true',
      },
    });
  };

  const launchCamera = async () => {
    if (isProcessing) {
      return; // Prevent multiple launches
    }

    setIsProcessing(true);

    try {
      // Check if running on iOS Simulator - camera doesn't work there
      if (Platform.OS === 'ios' && !Device.isDevice) {
        Alert.alert(
          'Camera Not Available',
          'Camera is not available on iOS Simulator. Please test on a real device to scan license plates.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        setIsProcessing(false);
        return;
      }

      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to scan license plates.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        setIsProcessing(false);
        return;
      }

      // Launch default camera interface
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsProcessing(false);
        router.back();
        return;
      }

      const photo = result.assets[0];
      
      if (!photo.uri) {
        throw new Error('Failed to capture image');
      }

      // Scan the plate using PlateRecognizer API
      const scanResult = await recognizePlateFromUri(photo.uri);

      setIsProcessing(false);

      // Check if we got a plate number
      if (scanResult.plateNumber && scanResult.confidence > 0.3) {
        // Determine confidence level for display
        let confidenceLevel: 'high' | 'medium' | 'low';
        if (scanResult.confidence >= 0.85) {
          confidenceLevel = 'high';
        } else if (scanResult.confidence >= 0.65) {
          confidenceLevel = 'medium';
        } else {
          confidenceLevel = 'low';
        }
        
        Alert.alert(
          'Plate Detected',
          `Number: ${scanResult.plateNumber}\nConfidence: ${(scanResult.confidence * 100).toFixed(0)}%${scanResult.region ? `\nRegion: ${scanResult.region.toUpperCase()}` : ''}`,
          [
            {
              text: 'Use This Plate',
              onPress: () => {
                router.replace({
                  pathname: '/ads/place-ad',
                  params: {
                    plateNumber: scanResult.plateNumber,
                    confidence: confidenceLevel,
                  },
                });
              },
            },
            {
              text: 'Try Again',
              style: 'cancel',
              onPress: () => {
                setIsProcessing(false);
                launchCamera();
              },
            },
          ]
        );
        return;
      }

      // No plate detected or low confidence
      Alert.alert(
        'No Plate Detected',
        scanResult.error || 'Could not detect a license plate in the image. Please ensure the plate is clearly visible and try again.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setIsProcessing(false);
              launchCamera();
            },
          },
          {
            text: 'Enter Manually',
            onPress: handleManualEntry,
          },
        ]
      );

    } catch (error: any) {
      setIsProcessing(false);
      Alert.alert(
        'Capture Error',
        error.message || 'Failed to capture and scan image',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setIsProcessing(false);
              launchCamera();
            },
          },
          {
            text: 'Enter Manually',
            onPress: handleManualEntry,
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  // Launch camera when component mounts
  useEffect(() => {
    launchCamera();
  }, []);

  // Show loading state while processing
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
