import { Stack } from 'expo-router';

/**
 * Legal Layout
 * 
 * Provides navigation stack for legal pages:
 * - Terms of service
 * - Privacy policy
 */
export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="terms-of-service" />
      <Stack.Screen name="privacy-policy" />
    </Stack>
  );
}
