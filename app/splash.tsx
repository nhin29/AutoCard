import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { SPLASH_SCREEN_SPECS } from '@/utils/figma-design-specs';

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Splash Screen Component
 * 
 * This component matches the Figma design from:
 * https://www.figma.com/design/Q5IhAuBOfjRsqYZzhiCS4E/AutoCart-%7C-Ben--Copy-?node-id=7952-78560
 * 
 * Design specs are defined in utils/figma-design-specs.ts
 * To update with latest Figma data, run: node scripts/fetch-figma-design.js
 * Then update utils/figma-design-specs.ts with the fetched values
 */
export default function SplashScreenComponent() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading time (replace with actual asset loading)
        // In production, load fonts, images, and other assets here
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
      // Navigate to main app after splash screen
      const timer = setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isReady, router]);

  const specs = SPLASH_SCREEN_SPECS;

  return (
    <View style={[styles.container, { backgroundColor: specs.backgroundColor }]}>
      <StatusBar style="auto" />
      
      {/* Main Content Container */}
      <View style={[styles.contentContainer, { gap: specs.spacing.logoBottomMargin }]}>
        {/* Logo/Image - Dimensions and source from Figma design specs */}
        <Image
          source={specs.logo.source}
          style={[
            styles.logo,
            {
              width: specs.logo.width,
              height: specs.logo.height,
            },
          ]}
          contentFit="contain"
          transition={200}
        />

        {/* Loading Indicator - Color from Figma design specs */}
        <ActivityIndicator
          size="large"
          color={specs.colors.loader}
          style={[styles.loader, { marginTop: specs.spacing.loaderTopMargin }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    resizeMode: 'contain',
  },
  loader: {
    // Additional styling can be added here if needed
  },
});
