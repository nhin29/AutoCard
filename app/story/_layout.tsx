import { Stack } from 'expo-router';

/**
 * Story Layout
 * 
 * Provides navigation stack for story pages:
 * - Preview story
 */
export default function StoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="preview-story" />
    </Stack>
  );
}
