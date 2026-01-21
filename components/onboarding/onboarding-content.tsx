import { StyleSheet, View, Text } from 'react-native';

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
  return (
    <View style={styles.container}>
      {/* Navigation Dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeDotIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Description */}
      <Text style={styles.description}>{description}</Text>

      {/* Action Buttons */}
      {children && <View style={styles.buttonsContainer}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 0,
    gap: 24,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    backgroundColor: '#4CAF50',
  },
  title: {
    width: 335,
    height: 30,
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
    color: '#030712', // gray/950
    alignSelf: 'center',
  },
  description: {
    width: 335,
    height: 40,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
    color: '#374151', // gray/700
    alignSelf: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32, // Increased space between content and buttons
  },
});
