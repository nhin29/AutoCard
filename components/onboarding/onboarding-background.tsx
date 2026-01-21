import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Onboarding Background Gradient Component
 * 
 * Creates a horizontal gradient from light blue-grey (#CBD5E1) to transparent white
 * Based on the design specification: left side solid, right side transparent
 */
interface OnboardingBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function OnboardingBackground({ children, style }: OnboardingBackgroundProps) {
  return (
    <LinearGradient
      colors={['#CBD5E1', 'rgba(255, 255, 255, 0)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.gradient, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
