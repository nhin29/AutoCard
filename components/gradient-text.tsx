import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TextProps } from 'react-native';

/**
 * Gradient Text Component
 * 
 * Creates text with a gradient effect from one color to another
 */
interface GradientTextProps extends TextProps {
  colors: string[];
  children: React.ReactNode;
}

export function GradientText({ colors, style, children, ...props }: GradientTextProps) {
  return (
    <MaskedView
      style={styles.mask}
      maskElement={
        <Text style={[styles.text, style]} {...props}>
          {children}
        </Text>
      }>
      <LinearGradient colors={colors as [string, string, ...string[]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={[styles.text, style, { opacity: 0 }]} {...props}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  mask: {
    flexDirection: 'row',
  },
  text: {
    backgroundColor: 'transparent',
  },
});
