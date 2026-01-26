import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { useResponsive, getResponsiveFontSize } from '@/utils/responsive';

/**
 * Reusable Onboarding Content Component
 * 
 * Displays:
 * - Navigation dots (with active dot indicator)
 * - Title text
 * - Description text
 * - Action buttons (passed as children)
 */
interface OnboardingContentProps {
  activeDotIndex: number; // 0-based index of the active dot (0, 1, or 2)
  title: string;
  description: string;
  children?: React.ReactNode; // For buttons
}

export function OnboardingContent({
  activeDotIndex,
  title,
  description,
  children,
}: OnboardingContentProps) {
  const { width } = useWindowDimensions();
  const { isSmall, isMedium } = useResponsive();
  
  // Calculate responsive sizes
  const dotSize = isSmall ? 5 : 6; // 5-7px as per image
  const titleFontSize = isSmall ? 22 : isMedium ? 24 : 26; // 24-28px as per image
  const descriptionFontSize = isSmall ? 14 : 15; // 14-16px as per image
  const buttonFontSize = isSmall ? 14 : 16; // Reduced on small phones
  const horizontalPadding = isSmall ? 20 : 24;
  // Text should use full width with padding, not centered with max-width
  const gapBetweenElements = isSmall ? 14 : 18;
  const buttonGap = isSmall ? 10 : 12;
  const buttonHeight = isSmall ? 44 : 52; // Reduced height on small phones
  const dotsToTitleGap = isSmall ? 12 : 16; // Spacing between dots and title
  const titleToDescriptionGap = isSmall ? 12 : 16; // Spacing between title and description
  const descriptionToButtonsGap = isSmall ? 16 : 20; // Spacing between description and buttons
  
  const titleLineHeight = titleFontSize * 1.25; // 25% line height for title
  const descriptionLineHeight = descriptionFontSize * 1.4; // 40% line height for description
  
  const titleStyle = {
    ...styles.title,
    lineHeight: titleLineHeight,
    ...getResponsiveFontSize(titleFontSize, 1.2),
  };
  
  const descriptionStyle = {
    ...styles.description,
    lineHeight: descriptionLineHeight,
    ...getResponsiveFontSize(descriptionFontSize, 1.2),
  };

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
      {/* Navigation Dots */}
      <View style={[styles.dotsContainer, { marginBottom: dotsToTitleGap }]}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
              },
              index === activeDotIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Title */}
      <Text style={[titleStyle, { marginBottom: titleToDescriptionGap }]}>{title}</Text>

      {/* Description */}
      <Text style={[descriptionStyle, { marginBottom: descriptionToButtonsGap }]}>{description}</Text>

      {/* Action Buttons */}
      {children && (
        <View style={[styles.buttonsContainer, { gap: buttonGap }]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
    paddingTop: 0,
    alignItems: 'center', // Center all content horizontally
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Dots remain centered
    gap: 6,
    alignSelf: 'center', // Center the dots container itself
    width: '100%',
  },
  dot: {
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    backgroundColor: '#4CAF50',
  },
  title: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    lineHeight: undefined, // Let it calculate based on fontSize
    textAlign: 'center', // Center the text horizontally
    color: '#030712',
    alignSelf: 'stretch', // Use full width with padding
  },
  description: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    lineHeight: undefined, // Let it calculate based on fontSize
    textAlign: 'center', // Center the text horizontally
    color: '#374151',
    alignSelf: 'stretch', // Use full width with padding
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 0, // Spacing handled by descriptionToButtonsGap
  },
});
