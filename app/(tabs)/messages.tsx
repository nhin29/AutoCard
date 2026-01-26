import { useResponsive, FONT_SIZES } from '@/utils/responsive';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function MessagesScreen() {
  const { isSmall } = useResponsive();
  const textFontSize = isSmall ? FONT_SIZES.md : 18;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={[styles.text, { fontSize: textFontSize }]}>Messages Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#000000',
    // fontSize set dynamically
  },
});
