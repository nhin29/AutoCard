import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function SplashScreenComponent() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading time (replace with actual asset loading)
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn('Error preparing splash screen:', e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      // Navigate to onboarding after splash screen
      const timer = setTimeout(() => {
        router.replace('/onboarding');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isReady, router]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.centered}>
        <Image
          source={require('@/assets/images/splash-image.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // So image is centered regardless of device size, fill screen like image
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  centered: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    aspectRatio: 271 / 235, // Keeps logo proportions
    maxWidth: 300,
    maxHeight: 235,
  },
});
