import { Stack } from 'expo-router';

/**
 * Scanner Layout
 * 
 * Provides navigation stack for scanner pages:
 * - Camera scanner
 */
export default function ScannerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="camera-scanner" />
    </Stack>
  );
}
