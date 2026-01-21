import { Platform, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { ONBOARDING_COLORS, ONBOARDING_SPACING, ONBOARDING_TYPOGRAPHY } from '@/constants/onboarding-styles';

interface OnboardingButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'guest' | 'primary' | 'fullWidth';
  style?: ViewStyle;
}

/**
 * Reusable button component for onboarding screens
 */
export function OnboardingButton({
  label,
  onPress,
  variant = 'primary',
  style,
}: OnboardingButtonProps) {
  const isGuest = variant === 'guest';
  const isFullWidth = variant === 'fullWidth';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isGuest && styles.guestButton,
        isFullWidth && styles.fullWidthButton,
        !isGuest && !isFullWidth && styles.primaryButton,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      <Text
        style={[
          styles.buttonText,
          isGuest ? styles.guestButtonText : styles.primaryButtonText,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: ONBOARDING_SPACING.buttonBorderRadius,
    paddingVertical: ONBOARDING_SPACING.buttonPadding,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  guestButton: {
    backgroundColor: ONBOARDING_COLORS.guestButton,
  },
  primaryButton: {
    backgroundColor: ONBOARDING_COLORS.primaryButton,
  },
  fullWidthButton: {
    width: '100%',
    flex: 0,
    marginTop: 32,
  },
  buttonText: {
    fontSize: ONBOARDING_TYPOGRAPHY.button.fontSize,
    fontWeight: ONBOARDING_TYPOGRAPHY.button.fontWeight,
    fontFamily: ONBOARDING_TYPOGRAPHY.button.fontFamily,
  },
  guestButtonText: {
    color: ONBOARDING_COLORS.buttonText,
  },
  primaryButtonText: {
    color: ONBOARDING_COLORS.buttonTextPrimary,
  },
});
