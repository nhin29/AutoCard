import { Stack } from 'expo-router';

/**
 * Onboarding Layout
 * Handles onboarding-related screens (index, onboarding-2, onboarding-3)
 */
export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-2" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-3" options={{ headerShown: false }} />
    </Stack>
  );
}
