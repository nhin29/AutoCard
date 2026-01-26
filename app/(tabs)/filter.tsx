import { IconSymbol } from '@/components/ui/icon-symbol';
import { safeBack } from '@/utils/safeBack';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  KeyboardAvoidingView,
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
  const insets = useSafeAreaInsets();
  const { isSmall } = useResponsive();
  const [category, setCategory] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [countryOfRegistration, setCountryOfRegistration] = useState('');

  // Calculate responsive values
  const horizontalPadding = isSmall ? SPACING.sm : SPACING.base;
  // Add extra padding on top of safe area insets for better spacing from status bar
  const headerPaddingTop = insets.top + (isSmall ? SPACING.md : SPACING.base);
  const headerPaddingBottom = isSmall ? SPACING.sm : SPACING.base;
  const backButtonSize = isSmall ? 36 : 40;
  const backIconSize = isSmall ? 20 : 24;
  const headerTitleFontSize = isSmall ? FONT_SIZES.md : 18;
  const clearAllFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;
  const scrollPaddingTop = isSmall ? SPACING.md : 24;
  const scrollPaddingBottom = isSmall ? SPACING.xl : 100;
  const filterSectionMarginBottom = isSmall ? SPACING.md : 24;
  const filterLabelFontSize = isSmall ? FONT_SIZES.sm : 14;
  const inputHeight = isSmall ? 44 : 48;
  const inputFontSize = isSmall ? FONT_SIZES.sm : 15;
  const inputIconSize = isSmall ? 18 : 20;
  const buttonContainerPaddingTop = isSmall ? SPACING.sm : SPACING.base;
  const applyButtonHeight = isSmall ? 48 : 52;
  const applyButtonFontSize = isSmall ? FONT_SIZES.sm : FONT_SIZES.md;

  const handleBack = () => {
    safeBack(router);
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
    safeBack(router);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: headerPaddingTop, paddingBottom: headerPaddingBottom, paddingHorizontal: horizontalPadding }]}>
        <TouchableOpacity
          style={[styles.backButton, { width: backButtonSize, height: backButtonSize }]}
          onPress={handleBack}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="chevron.left" size={backIconSize} color="#000000" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>Filter</Text>
        <TouchableOpacity
          style={styles.clearAllButton}
          onPress={handleClearAll}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={[styles.clearAllText, { fontSize: clearAllFontSize }]}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding, paddingTop: scrollPaddingTop, paddingBottom: scrollPaddingBottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        
        {/* Category */}
        <View style={[styles.filterSection, { marginBottom: filterSectionMarginBottom }]}>
          <Text style={[styles.filterLabel, { fontSize: filterLabelFontSize }]}>Category</Text>
          <View style={[styles.inputContainer, { height: inputHeight }]}>
            <TextInput
              style={[styles.input, { fontSize: inputFontSize }]}
              placeholder="Select Category"
              placeholderTextColor="#9CA3AF"
              value={category}
              onChangeText={setCategory}
            />
            <IconSymbol name="chevron.down" size={inputIconSize} color="#9CA3AF" />
          </View>
        </View>

        {/* Year */}
        <View style={[styles.filterSection, { marginBottom: filterSectionMarginBottom }]}>
          <Text style={[styles.filterLabel, { fontSize: filterLabelFontSize }]}>Year</Text>
          <View style={styles.rowInputs}>
            <View style={[styles.inputContainer, styles.halfWidth, { height: inputHeight }]}>
              <TextInput
                style={[styles.input, { fontSize: inputFontSize }]}
                placeholder="Min Year"
                placeholderTextColor="#9CA3AF"
                value={minYear}
                onChangeText={setMinYear}
                keyboardType="number-pad"
              />
              <IconSymbol name="chevron.down" size={inputIconSize} color="#9CA3AF" />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth, { height: inputHeight }]}>
              <TextInput
                style={[styles.input, { fontSize: inputFontSize }]}
                placeholder="Max Year"
                placeholderTextColor="#9CA3AF"
                value={maxYear}
                onChangeText={setMaxYear}
                keyboardType="number-pad"
              />
              <IconSymbol name="chevron.down" size={inputIconSize} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* Price */}
        <View style={[styles.filterSection, { marginBottom: filterSectionMarginBottom }]}>
          <Text style={[styles.filterLabel, { fontSize: filterLabelFontSize }]}>Price</Text>
          <View style={styles.rowInputs}>
            <View style={[styles.inputContainer, styles.halfWidth, { height: inputHeight }]}>
              <TextInput
                style={[styles.input, { fontSize: inputFontSize }]}
                placeholder="Min Price"
                placeholderTextColor="#9CA3AF"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="number-pad"
              />
              <IconSymbol name="chevron.down" size={inputIconSize} color="#9CA3AF" />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth, { height: inputHeight }]}>
              <TextInput
                style={[styles.input, { fontSize: inputFontSize }]}
                placeholder="Max Price"
                placeholderTextColor="#9CA3AF"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="number-pad"
              />
              <IconSymbol name="chevron.down" size={inputIconSize} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={[styles.filterSection, { marginBottom: filterSectionMarginBottom }]}>
          <Text style={[styles.filterLabel, { fontSize: filterLabelFontSize }]}>Location</Text>
          <View style={[styles.inputContainer, { height: inputHeight }]}>
            <TextInput
              style={[styles.input, { fontSize: inputFontSize }]}
              placeholder="Select Location"
              placeholderTextColor="#9CA3AF"
              value={location}
              onChangeText={setLocation}
            />
            <IconSymbol name="chevron.down" size={inputIconSize} color="#9CA3AF" />
          </View>
        </View>

        {/* Current Country of Registration */}
        <View style={[styles.filterSection, { marginBottom: filterSectionMarginBottom }]}>
          <Text style={[styles.filterLabel, { fontSize: filterLabelFontSize }]}>Current Country of Registration</Text>
          <View style={[styles.inputContainer, { height: inputHeight }]}>
            <TextInput
              style={[styles.input, { fontSize: inputFontSize }]}
              placeholder="Select Current Country of Registration"
              placeholderTextColor="#9CA3AF"
              value={countryOfRegistration}
              onChangeText={setCountryOfRegistration}
            />
            <IconSymbol name="chevron.down" size={inputIconSize} color="#9CA3AF" />
          </View>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={[styles.buttonContainer, { paddingHorizontal: horizontalPadding, paddingTop: buttonContainerPaddingTop, paddingBottom: Math.max(insets.bottom, isSmall ? SPACING.sm : SPACING.base) }]}>
        <TouchableOpacity
          style={[styles.applyButton, { height: applyButtonHeight }]}
          onPress={handleApply}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={[styles.applyButtonText, { fontSize: applyButtonFontSize }]}>Apply</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    // paddingTop, paddingBottom, paddingHorizontal set dynamically
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    // width and height set dynamically
  },
  headerTitle: {
    flex: 1,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'system-ui',
    paddingHorizontal: 8,
    // fontSize set dynamically
  },
  clearAllButton: {
    width: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  clearAllText: {
    fontWeight: '500',
    color: '#EF4444',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingHorizontal, paddingTop, paddingBottom set dynamically
  },
  filterSection: {
    // marginBottom set dynamically
  },
  filterLabel: {
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'system-ui',
    marginBottom: 8,
    // fontSize set dynamically
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    // height set dynamically
  },
  input: {
    flex: 1,
    color: '#000000',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  buttonContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    // paddingHorizontal, paddingTop, paddingBottom set dynamically
  },
  applyButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // height set dynamically
  },
  applyButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
});
