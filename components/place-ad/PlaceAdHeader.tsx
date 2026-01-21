import { IconSymbol } from '@/components/ui/icon-symbol';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PlaceAdHeaderProps {
  onBack: () => void;
  onReset: () => void;
}

/**
 * Header component for Place Ad screen with back button, title, and reset button
 */
export function PlaceAdHeader({ onBack, onReset }: PlaceAdHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
        <IconSymbol name="chevron.left" size={24} color="#000000" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Place Ad</Text>
      <TouchableOpacity
        style={styles.resetButton}
        onPress={onReset}
        {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
        <Text style={styles.resetText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'system-ui',
    paddingHorizontal: 8,
  },
  resetButton: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
    fontFamily: 'system-ui',
  },
});
