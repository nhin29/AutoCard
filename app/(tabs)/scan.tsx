import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Scan Screen
 * 
 * Allows users to scan vehicle registration plates or place ads manually.
 * Features a camera scanner for automatic vehicle detail extraction.
 */

export default function ScanScreen() {
  const router = useRouter();

  const handleOpenCamera = () => {
    router.push('/scanner/camera-scanner');
  };

  const handlePlaceAdManually = () => {
    router.push('/ads/place-ad');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reg Scanner</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('@/assets/images/scan.png')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* Description */}
        <Text style={styles.description}>
          This option allows you to check your vehicle{'\n'}details before purchasing
        </Text>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleOpenCamera}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Open Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handlePlaceAdManually}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Place Ad Manually</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'system-ui',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationImage: {
    width: 300,
    height: 220,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: 'system-ui',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'system-ui',
  },
});
