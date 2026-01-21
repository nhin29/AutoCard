import { Stack } from 'expo-router';

/**
 * Settings Layout
 * 
 * Provides navigation stack for settings and profile pages:
 * - Profile editing
 * - About page
 * - Support pages
 * - Data request
 */
export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="about" />
      <Stack.Screen name="support" />
      <Stack.Screen name="data-request" />
      <Stack.Screen name="report-bug" />
      <Stack.Screen name="make-suggestion" />
      <Stack.Screen name="support-other" />
    </Stack>
  );
}
