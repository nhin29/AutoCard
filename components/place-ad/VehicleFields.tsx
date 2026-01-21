import { IconSymbol } from '@/components/ui/icon-symbol';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DropdownField } from './DropdownField';
import { DropdownModal, DropdownOption } from './DropdownModal';
import { FormInput } from './FormInput';
import { sharedStyles } from './shared-styles';

interface VehicleFieldsProps {
  category: string | null;
  // License Number
  showLicenseNumberField: boolean;
  vehicleLicenseNumber: string;
  onVehicleLicenseNumberChange: (value: string) => void;
  onFindVehicle?: () => void;
  // Item Name
  itemName: string;
  onItemNameChange: (value: string) => void;
  // Status
  status: string;
  onStatusChange: (value: string) => void;
  statusOptions: DropdownOption[];
  showStatusModal: boolean;
  onStatusModalOpen: () => void;
  onStatusModalClose: () => void;
  statusRef: React.RefObject<View | null>;
  statusDropdownPosition?: { x: number; y: number; width: number; height: number };
  // Ad Type
  showAdTypeField: boolean;
  adType: string;
  onAdTypeChange: (value: string) => void;
  adTypeOptions: DropdownOption[];
  showAdTypeModal: boolean;
  onAdTypeModalOpen: () => void;
  onAdTypeModalClose: () => void;
  adTypeRef: React.RefObject<View | null>;
  adTypeDropdownPosition?: { x: number; y: number; width: number; height: number };
  // Mileage
  showMileageField: boolean;
  mileage: string;
  onMileageChange: (value: string) => void;
  mileageUnit: string;
  onMileageUnitChange: (value: string) => void;
  mileageUnitOptions: DropdownOption[];
  showMileageUnitModal: boolean;
  onMileageUnitModalOpen: () => void;
  onMileageUnitModalClose: () => void;
  mileageUnitRef: React.RefObject<View | null>;
  mileageUnitDropdownPosition?: { x: number; y: number; width: number; height: number };
  // MOT/NCT
  showMotNctField: boolean;
  motNctStatus: string;
  onMotNctStatusChange: (value: string) => void;
  motNctStatusOptions: DropdownOption[];
  showMotNctModal: boolean;
  onMotNctModalOpen: () => void;
  onMotNctModalClose: () => void;
  motNctRef: React.RefObject<View | null>;
  motNctDropdownPosition?: { x: number; y: number; width: number; height: number };
  // Van Fields
  showVanFields: boolean;
  vanMake: string;
  onVanMakeChange: (value: string) => void;
  vanModel: string;
  onVanModelChange: (value: string) => void;
  vanYearOfProduction: string;
  onVanYearOfProductionChange: (value: string) => void;
  loadCapacity: string;
  onLoadCapacityChange: (value: string) => void;
  loadCapacityOptions: DropdownOption[];
  showLoadCapacityModal: boolean;
  onLoadCapacityModalOpen: () => void;
  onLoadCapacityModalClose: () => void;
  loadCapacityRef: React.RefObject<View | null>;
  loadCapacityDropdownPosition?: { x: number; y: number; width: number; height: number };
}

/**
 * Vehicle-related fields component that conditionally renders based on category
 */
export function VehicleFields({
  category,
  showLicenseNumberField,
  vehicleLicenseNumber,
  onVehicleLicenseNumberChange,
  onFindVehicle,
  itemName,
  onItemNameChange,
  status,
  onStatusChange,
  statusOptions,
  showStatusModal,
  onStatusModalOpen,
  onStatusModalClose,
  statusRef,
  statusDropdownPosition,
  showAdTypeField,
  adType,
  onAdTypeChange,
  adTypeOptions,
  showAdTypeModal,
  onAdTypeModalOpen,
  onAdTypeModalClose,
  adTypeRef,
  adTypeDropdownPosition,
  showMileageField,
  mileage,
  onMileageChange,
  mileageUnit,
  onMileageUnitChange,
  mileageUnitOptions,
  showMileageUnitModal,
  onMileageUnitModalOpen,
  onMileageUnitModalClose,
  mileageUnitRef,
  mileageUnitDropdownPosition,
  showMotNctField,
  motNctStatus,
  onMotNctStatusChange,
  motNctStatusOptions,
  showMotNctModal,
  onMotNctModalOpen,
  onMotNctModalClose,
  motNctRef,
  motNctDropdownPosition,
  showVanFields,
  vanMake,
  onVanMakeChange,
  vanModel,
  onVanModelChange,
  vanYearOfProduction,
  onVanYearOfProductionChange,
  loadCapacity,
  onLoadCapacityChange,
  loadCapacityOptions,
  showLoadCapacityModal,
  onLoadCapacityModalOpen,
  onLoadCapacityModalClose,
  loadCapacityRef,
  loadCapacityDropdownPosition,
}: VehicleFieldsProps) {
  if (!category) return null;

  return (
    <>
      {/* Vehicle License Number */}
      {showLicenseNumberField && (
        <View style={sharedStyles.section}>
          <Text style={sharedStyles.sectionLabel}>Vehicle License Number</Text>
          <View style={styles.licenseNumberRow}>
            <TextInput
              style={[sharedStyles.input, styles.licenseNumberInput]}
              placeholder="Write License Number"
              placeholderTextColor="#9CA3AF"
              value={vehicleLicenseNumber}
              onChangeText={onVehicleLicenseNumberChange}
            />
            <TouchableOpacity
              style={styles.findButton}
              onPress={onFindVehicle}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Text style={styles.findButtonText}>Find</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Item Name */}
      <FormInput
        label="Item Name"
        value={itemName}
        onChangeText={onItemNameChange}
        placeholder="Item Name"
      />

      {/* Status */}
      <DropdownField
        label="Status"
        selectedValue={status}
        options={statusOptions}
        onSelect={onStatusChange}
        placeholder="Select Status"
        isOpen={showStatusModal}
        onOpen={onStatusModalOpen}
        onClose={onStatusModalClose}
        dropdownRef={statusRef}
        dropdownPosition={statusDropdownPosition}
      />

      {/* Ad Type */}
      {showAdTypeField && (
        <DropdownField
          label="Ad Type"
          selectedValue={adType}
          options={adTypeOptions}
          onSelect={onAdTypeChange}
          placeholder="Select Ad type"
          isOpen={showAdTypeModal}
          onOpen={onAdTypeModalOpen}
          onClose={onAdTypeModalClose}
          dropdownRef={adTypeRef}
          dropdownPosition={adTypeDropdownPosition}
        />
      )}

      {/* Mileage */}
      {showMileageField && (
        <View style={sharedStyles.section}>
          <Text style={sharedStyles.sectionLabel}>Mileage</Text>
          <View style={styles.mileageRow}>
            <View ref={mileageUnitRef} style={styles.categoryDropdownContainer}>
              <TouchableOpacity
                style={[sharedStyles.inputContainer, styles.mileageUnitContainer]}
                onPress={onMileageUnitModalOpen}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={styles.mileageUnitText}>{mileageUnit}</Text>
                <IconSymbol
                  name={showMileageUnitModal ? 'chevron.up' : 'chevron.down'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            <DropdownModal
              visible={showMileageUnitModal}
              options={mileageUnitOptions}
              selectedValue={mileageUnit}
              onSelect={onMileageUnitChange}
              onClose={onMileageUnitModalClose}
              position={mileageUnitDropdownPosition}
            />

            <TextInput
              style={[sharedStyles.input, styles.mileageInput]}
              placeholder="Mileage"
              placeholderTextColor="#9CA3AF"
              value={mileage}
              onChangeText={onMileageChange}
              keyboardType="number-pad"
            />
          </View>
        </View>
      )}

      {/* MOT/NCT Status */}
      {showMotNctField && (
        <DropdownField
          label="MOT/NCT Status"
          selectedValue={motNctStatus}
          options={motNctStatusOptions}
          onSelect={onMotNctStatusChange}
          placeholder="MOT/NCT"
          isOpen={showMotNctModal}
          onOpen={onMotNctModalOpen}
          onClose={onMotNctModalClose}
          dropdownRef={motNctRef}
          dropdownPosition={motNctDropdownPosition}
        />
      )}

      {/* Van & Light Commercials Specific Fields */}
      {showVanFields && (
        <>
          <FormInput
            label="Van & Light Commercials Make"
            value={vanMake}
            onChangeText={onVanMakeChange}
            placeholder="Write Van & Light Commercials Make"
          />
          <FormInput
            label="Van & Light Commercials Model"
            value={vanModel}
            onChangeText={onVanModelChange}
            placeholder="Write Van & Light Commercials Model"
          />
          <FormInput
            label="Van & Light Commercials Year of Production"
            value={vanYearOfProduction}
            onChangeText={onVanYearOfProductionChange}
            placeholder="Year of Production"
            keyboardType="number-pad"
          />
          <DropdownField
            label="Load Capacity"
            selectedValue={loadCapacity}
            options={loadCapacityOptions}
            onSelect={onLoadCapacityChange}
            placeholder="Select Load Capacity"
            isOpen={showLoadCapacityModal}
            onOpen={onLoadCapacityModalOpen}
            onClose={onLoadCapacityModalClose}
            dropdownRef={loadCapacityRef}
            dropdownPosition={loadCapacityDropdownPosition}
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  licenseNumberRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  licenseNumberInput: {
    flex: 1,
  },
  findButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  mileageRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  categoryDropdownContainer: {
    width: 100,
  },
  mileageUnitContainer: {
    width: 100,
    justifyContent: 'space-between',
  },
  mileageUnitText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  mileageInput: {
    flex: 1,
  },
});
