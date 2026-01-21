import { Stack } from 'expo-router';

/**
 * Ads Layout
 * 
 * Provides navigation stack for ad-related pages:
 * - Ad detail views
 * - Ad image galleries
 * - Place ad flow
 * - Preview ad
 */
export default function AdsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="ad-detail" />
      <Stack.Screen name="ad-images" />
      <Stack.Screen name="ad-images-grid" />
      <Stack.Screen name="place-ad" />
      <Stack.Screen name="preview-ad" />
    </Stack>
  );
}
