import { FormInput } from './FormInput';

interface ContactFieldsProps {
  phoneNumber: string;
  location: string;
  onPhoneNumberChange: (phone: string) => void;
  onLocationChange: (location: string) => void;
}

/**
 * Contact fields component (phone number and location)
 */
export function ContactFields({
  phoneNumber,
  location,
  onPhoneNumberChange,
  onLocationChange,
}: ContactFieldsProps) {
  return (
    <>
      <FormInput
        label="Phone Number"
        value={phoneNumber}
        onChangeText={onPhoneNumberChange}
        placeholder="Input your Phone number"
        keyboardType="phone-pad"
      />
      <FormInput
        label="Location"
        value={location}
        onChangeText={onLocationChange}
        placeholder="Enter your Location"
      />
    </>
  );
}
