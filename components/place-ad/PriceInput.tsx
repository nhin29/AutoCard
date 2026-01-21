import { IconSymbol } from '@/components/ui/icon-symbol';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DropdownModal, DropdownOption } from './DropdownModal';
import { sharedStyles } from './shared-styles';

interface PriceInputProps {
  currency: string;
  amount: string;
  onCurrencyChange: (currency: string) => void;
  onAmountChange: (amount: string) => void;
  currencyOptions: DropdownOption[];
  isCurrencyModalOpen: boolean;
  onCurrencyModalOpen: () => void;
  onCurrencyModalClose: () => void;
  currencyRef: React.RefObject<View | null>;
  currencyDropdownPosition?: { x: number; y: number; width: number; height: number };
}

/**
 * Price input component with currency selector
 */
export function PriceInput({
  currency,
  amount,
  onCurrencyChange,
  onAmountChange,
  currencyOptions,
  isCurrencyModalOpen,
  onCurrencyModalOpen,
  onCurrencyModalClose,
  currencyRef,
  currencyDropdownPosition,
}: PriceInputProps) {
  return (
    <View style={sharedStyles.section}>
      <Text style={sharedStyles.sectionLabel}>Price</Text>
      <View style={styles.priceRow}>
        <View ref={currencyRef} style={styles.categoryDropdownContainer}>
          <TouchableOpacity
            style={[sharedStyles.inputContainer, styles.currencyContainer]}
            onPress={onCurrencyModalOpen}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <Text style={styles.currencySymbol}>{currency}</Text>
            <IconSymbol
              name={isCurrencyModalOpen ? 'chevron.up' : 'chevron.down'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <DropdownModal
          visible={isCurrencyModalOpen}
          options={currencyOptions}
          selectedValue={currency}
          onSelect={onCurrencyChange}
          onClose={onCurrencyModalClose}
          position={currencyDropdownPosition}
        />

        <TextInput
          style={[sharedStyles.input, styles.amountInput]}
          placeholder="Amount"
          placeholderTextColor="#9CA3AF"
          value={amount}
          onChangeText={onAmountChange}
          keyboardType="decimal-pad"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryDropdownContainer: {
    width: 80,
  },
  currencyContainer: {
    width: 80,
    justifyContent: 'space-between',
  },
  currencySymbol: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  amountInput: {
    flex: 1,
  },
});
