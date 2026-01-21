import { IconSymbol } from '@/components/ui/icon-symbol';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EnquirySuccessModalProps {
  visible: boolean;
  onClose: () => void;
  onBackToListings?: () => void;
  onViewSimilarCars?: () => void;
}

/**
 * Enquiry Success Modal
 *
 * Displays a confirmation dialog after a successful enquiry submission.
 */
export function EnquirySuccessModal({
  visible,
  onClose,
  onBackToListings,
  onViewSimilarCars,
}: EnquirySuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <View style={styles.closeButtonCircle}>
              <IconSymbol name="xmark" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <IconSymbol name="checkmark" size={20} color="#16A34A" />
            </View>
          </View>

          <Text style={styles.title}>Enquiry Sent Successfully</Text>
          <Text style={styles.subtitle}>
            Your enquiry has been sent to the seller. They’ll contact you shortly.
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={onBackToListings ?? onClose}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Text style={styles.secondaryButtonText}>Back to listings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={onViewSimilarCars ?? onClose}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Text style={styles.primaryButtonText}>View similar cars</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
  },
  closeButtonCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'system-ui',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'system-ui',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  primaryButton: {
    backgroundColor: '#16A34A',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'system-ui',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
});
