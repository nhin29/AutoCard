/**
 * Shared styles and constants for onboarding screens
 */

export const ONBOARDING_COLORS = {
  // Button colors
  guestButton: '#E5E7EB', // grey/200
  primaryButton: '#4CAF50', // Green
  boostButton: '#9333EA', // Purple
  
  // Text colors
  title: '#030712', // gray/950
  description: '#374151', // gray/700
  buttonText: '#000000',
  buttonTextPrimary: '#FFFFFF',
  
  // Chat colors
  chatBubbleWhite: '#FFFFFF',
  chatBubbleGreen: '#07B007',
  chatTextDark: '#111827', // gray/900
  chatTextLight: '#FFFFFF',
  chatTimestamp: '#6B7280', // gray/500
  chatAvatar: '#D9D9D9',
  
  // Verification badges
  verificationIcon: '#4B5563', // Dark grey
  verificationText: '#374151', // Dark grey
  verificationCheckmark: '#FFFFFF',
  
  // Dots
  dotInactive: '#E0E0E0',
  dotActive: '#4CAF50',
} as const;

export const ONBOARDING_SPACING = {
  buttonPadding: 16,
  buttonGap: 12,
  buttonBorderRadius: 12,
  containerPadding: 24,
  contentGap: 24,
} as const;

export const ONBOARDING_TYPOGRAPHY = {
  title: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
    fontFamily: 'Source Sans Pro',
  },
  description: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 20,
    fontFamily: 'Source Sans Pro',
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: 'system-ui',
  },
} as const;

export const CHAT_MESSAGE_SIZES = {
  container: 304,
  bubble: 280,
  text: 256,
  row: 304,
  timestamp: 304,
} as const;
