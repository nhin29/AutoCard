import { IconSymbol } from '@/components/ui/icon-symbol';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
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
  const { isSmall, width: screenWidth } = useResponsive();

  // Calculate responsive values - reduced for small phones like EnquiryModal
  const modalPadding = isSmall ? SPACING.xs : 20;
  const modalMaxWidth = isSmall ? screenWidth - (SPACING.sm * 2) : 420;
  const modalPaddingH = isSmall ? SPACING.sm : 24;
  const modalPaddingTop = isSmall ? SPACING.md : 32;
  const modalPaddingBottom = isSmall ? SPACING.sm : 24;
  const closeButtonSize = isSmall ? 20 : 26;
  const closeIconSize = isSmall ? 10 : 12;
  const iconCircleSize = isSmall ? 48 : 64;
  const titleFontSize = isSmall ? FONT_SIZES.sm : 20;
  const subtitleFontSize = isSmall ? FONT_SIZES.xs : 14;
  const buttonHeight = isSmall ? 38 : 44;
  const buttonFontSize = isSmall ? FONT_SIZES.xs : 14;
  const iconMarginBottom = isSmall ? SPACING.sm : 16;
  const titleMarginBottom = isSmall ? SPACING.xs : 10;
  const subtitleMarginBottom = isSmall ? SPACING.sm : 24;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={[styles.modalOverlay, { padding: modalPadding }]} onPress={onClose}>
        <View style={[styles.modalCard, { maxWidth: modalMaxWidth, paddingHorizontal: modalPaddingH, paddingTop: modalPaddingTop, paddingBottom: modalPaddingBottom }]} onStartShouldSetResponder={() => true}>
          <TouchableOpacity
            style={[styles.closeButton, { top: isSmall ? 12 : 16, right: isSmall ? 12 : 16 }]}
            onPress={onClose}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
            <View style={[styles.closeButtonCircle, { width: closeButtonSize, height: closeButtonSize, borderRadius: closeButtonSize / 2 }]}>
              <IconSymbol name="xmark" size={closeIconSize} color="#FFFFFF" />
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
              style={[styles.actionButton, styles.secondaryButton, { height: buttonHeight }]}
              onPress={onBackToListings ?? onClose}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Text style={[styles.secondaryButtonText, { fontSize: buttonFontSize }]}>Back to listings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, { height: buttonHeight }]}
              onPress={onViewSimilarCars ?? onClose}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <Text style={[styles.primaryButtonText, { fontSize: buttonFontSize }]}>View similar cars</Text>
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
    // padding set dynamically
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    // maxWidth, paddingHorizontal, paddingTop, paddingBottom set dynamically
  },
  closeButton: {
    position: 'absolute',
    zIndex: 2,
    // top and right set dynamically
  },
  closeButtonCircle: {
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    // width, height, borderRadius set dynamically
  },
  iconWrapper: {
    alignItems: 'center',
    // marginBottom set dynamically
  },
  iconCircle: {
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    // width, height, borderRadius set dynamically
  },
  title: {
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    fontFamily: 'system-ui',
    // fontSize and marginBottom set dynamically
  },
  subtitle: {
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'system-ui',
    // fontSize and marginBottom set dynamically
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // height set dynamically
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  primaryButton: {
    backgroundColor: '#16A34A',
  },
  secondaryButtonText: {
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  primaryButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
});
