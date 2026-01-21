import { Stack } from 'expo-router';

/**
 * Auth Layout
 * Handles authentication-related screens (signin, signup, etc.)
 */
export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="signup-step2" options={{ headerShown: false }} />
      <Stack.Screen name="signup-step3" options={{ headerShown: false }} />
      <Stack.Screen name="signup-step4" options={{ headerShown: false }} />
      <Stack.Screen name="verify-otp" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
    </Stack>
  );
}
