import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * Filter Screen
 * 
 * Filter page with various filter options for searching.
 */
export default function FilterScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [countryOfRegistration, setCountryOfRegistration] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleClearAll = () => {
    setCategory('');
    setMinYear('');
    setMaxYear('');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setCountryOfRegistration('');
  };

  const handleApply = () => {
    // TODO: Apply filters and navigate back or update search results
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter</Text>
        <TouchableOpacity
          style={styles.clearAllButton}
          onPress={handleClearAll}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Category */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Category</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Select Category"
              placeholderTextColor="#9CA3AF"
              value={category}
              onChangeText={setCategory}
            />
            <IconSymbol name="chevron.down" size={20} color="#9CA3AF" />
          </View>
        </View>

        {/* Year */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Year</Text>
          <View style={styles.rowInputs}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <TextInput
                style={styles.input}
                placeholder="Min Year"
                placeholderTextColor="#9CA3AF"
                value={minYear}
                onChangeText={setMinYear}
                keyboardType="number-pad"
              />
              <IconSymbol name="chevron.down" size={20} color="#9CA3AF" />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <TextInput
                style={styles.input}
                placeholder="Min Year"
                placeholderTextColor="#9CA3AF"
                value={maxYear}
                onChangeText={setMaxYear}
                keyboardType="number-pad"
              />
              <IconSymbol name="chevron.down" size={20} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* Price */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Price</Text>
          <View style={styles.rowInputs}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <TextInput
                style={styles.input}
                placeholder="Min Price"
                placeholderTextColor="#9CA3AF"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="number-pad"
              />
              <IconSymbol name="chevron.down" size={20} color="#9CA3AF" />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <TextInput
                style={styles.input}
                placeholder="Min Price"
                placeholderTextColor="#9CA3AF"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="number-pad"
              />
              <IconSymbol name="chevron.down" size={20} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Location</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Select Location"
              placeholderTextColor="#9CA3AF"
              value={location}
              onChangeText={setLocation}
            />
            <IconSymbol name="chevron.down" size={20} color="#9CA3AF" />
          </View>
        </View>

        {/* Current Country of Registration */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Current Country of Registration</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Select Current Country of Registration"
              placeholderTextColor="#9CA3AF"
              value={countryOfRegistration}
              onChangeText={setCountryOfRegistration}
            />
            <IconSymbol name="chevron.down" size={20} color="#9CA3AF" />
          </View>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  clearAllButton: {
    width: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  clearAllText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
    fontFamily: 'system-ui',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 100,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'system-ui',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    fontFamily: 'system-ui',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
});
