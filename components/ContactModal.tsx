import { PhoneIcon } from '@/components/icons/PhoneIcon';
import { VerifyIcon } from '@/components/icons/VerifyIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
  sellerName?: string;
  phoneNumber?: string;
  email?: string;
  profileImage?: any;
  isVerified?: boolean;
  isTradeSeller?: boolean;
  timestamp?: string;
}

/**
 * Contact Information Modal
 * 
 * Displays seller contact information in a bottom sheet modal that slides up from the bottom.
 * Shows profile picture, name with verification badge, timestamp,
 * trade seller badge, and contact methods (phone and email).
 */
export function ContactModal({
  visible,
  onClose,
  sellerName = 'Frances Swann',
  phoneNumber = '003432934516',
  email = 'dealercar@gmail.com',
  profileImage,
  isVerified = true,
  isTradeSeller = true,
  timestamp = '12 mins ago',
}: ContactModalProps) {
  const { isSmall } = useResponsive();
  const insets = useSafeAreaInsets();

  // Calculate responsive values - reduced for small phones like EnquiryModal
  const modalPadding = isSmall ? SPACING.sm : 20;
  // Add safe area bottom inset to avoid system navigation bar overlap
  const baseBottomPadding = isSmall ? SPACING.xs : 40;
  const modalPaddingBottom = baseBottomPadding + insets.bottom;
  const profileImageSize = isSmall ? 44 : 56;
  const profileImageBorderWidth = isSmall ? 1.5 : 2;
  const addFriendBadgeSize = isSmall ? 16 : 20;
  const addFriendIconSize = isSmall ? 8 : 12;
  const sellerNameFontSize = isSmall ? FONT_SIZES.sm : 18;
  const timestampFontSize = isSmall ? FONT_SIZES.xs : 12;
  const verifiedBadgeSize = isSmall ? 14 : 18;
  const tradeSellerPaddingH = isSmall ? SPACING.xs : 12;
  const tradeSellerPaddingV = isSmall ? 4 : 6;
  const tradeSellerFontSize = isSmall ? FONT_SIZES.xs : 12;
  const closeButtonSize = isSmall ? 18 : 20;
  const closeIconSize = isSmall ? 8 : 10;
  const contactIconSize = isSmall ? 16 : 20;
  const contactIconContainerSize = isSmall ? 26 : 32;
  const contactTextFontSize = isSmall ? FONT_SIZES.sm : 16;
  const contactRowPaddingV = isSmall ? SPACING.xs : 12;
  const dividerMarginLeft = isSmall ? 38 : 44;
  const profileHeaderMarginTop = isSmall ? SPACING.xs : 12;
  const profileHeaderMarginBottom = isSmall ? SPACING.md : 20;
  const profileImageMarginRight = isSmall ? SPACING.sm : 12;
  const contactIconMarginRight = isSmall ? SPACING.sm : 12;
  const contactSectionMarginTop = isSmall ? SPACING.xs : 8;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.modalContainer, { padding: modalPadding, paddingBottom: modalPaddingBottom }]} onStartShouldSetResponder={() => true}>
          {/* Profile Header Section */}
          <View style={[styles.profileHeader, { marginTop: profileHeaderMarginTop, marginBottom: profileHeaderMarginBottom }]}>
            <View style={styles.profileInfo}>
              <View style={[styles.profileImageContainer, { marginRight: profileImageMarginRight }]}>
                <Image
                  source={profileImage || require('@/assets/images/message-avatar.png')}
                  style={[styles.profileImage, { width: profileImageSize, height: profileImageSize, borderRadius: profileImageSize / 2, borderWidth: profileImageBorderWidth }]}
                  resizeMode="cover"
                />
                <View style={[styles.addFriendBadge, { width: addFriendBadgeSize, height: addFriendBadgeSize, borderRadius: addFriendBadgeSize / 2 }]}>
                  <IconSymbol name="plus" size={addFriendIconSize} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.sellerDetails}>
                <View style={styles.sellerNameRow}>
                  <Text style={[styles.sellerName, { fontSize: sellerNameFontSize }]}>{sellerName}</Text>
                  {isVerified && (
                    <View style={[styles.verifiedBadge, { width: verifiedBadgeSize, height: verifiedBadgeSize }]}>
                      <VerifyIcon width={verifiedBadgeSize} height={verifiedBadgeSize} />
                    </View>
                  )}
                </View>
                <Text style={[styles.timestamp, { fontSize: timestampFontSize }]}>{timestamp}-</Text>
              </View>
            </View>
            <View style={styles.rightSection}>
              {isTradeSeller && (
                <TouchableOpacity
                  style={[styles.tradeSellerButton, { paddingHorizontal: tradeSellerPaddingH, paddingVertical: tradeSellerPaddingV }]}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <Text style={[styles.tradeSellerButtonText, { fontSize: tradeSellerFontSize }]}>Trade Seller</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View style={[styles.closeButtonCircle, { width: closeButtonSize, height: closeButtonSize, borderRadius: closeButtonSize / 2 }]}>
                  <IconSymbol name="xmark" size={closeIconSize} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Information Section */}
          <View style={[styles.contactSection, { marginTop: contactSectionMarginTop }]}>
            {/* Call Information */}
            <View style={[styles.contactRow, { paddingVertical: contactRowPaddingV }]}>
              <View style={[styles.contactIconContainer, { width: contactIconContainerSize, height: contactIconContainerSize, marginRight: contactIconMarginRight }]}>
                <PhoneIcon width={contactIconSize} height={contactIconSize} color="#000000" />
              </View>
              <Text style={[styles.contactText, { fontSize: contactTextFontSize }]}>Call- {phoneNumber}</Text>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { marginLeft: dividerMarginLeft }]} />

            {/* Email Information */}
            <View style={[styles.contactRow, { paddingVertical: contactRowPaddingV }]}>
              <View style={[styles.contactIconContainer, { width: contactIconContainerSize, height: contactIconContainerSize, marginRight: contactIconMarginRight }]}>
                <IconSymbol name="envelope.fill" size={contactIconSize} color="#000000" />
              </View>
              <Text style={[styles.contactText, { fontSize: contactTextFontSize }]}>Email- {email}</Text>
            </View>
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    // padding and paddingBottom set dynamically
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonCircle: {
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    // width, height, borderRadius set dynamically
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginTop and marginBottom set dynamically
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImageContainer: {
    position: 'relative',
    // marginRight set dynamically
  },
  profileImage: {
    borderColor: '#4CAF50',
    // width, height, borderRadius, borderWidth set dynamically
  },
  addFriendBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    // width, height, borderRadius set dynamically
  },
  sellerDetails: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sellerName: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  verifiedBadge: {
    // width and height set dynamically
  },
  timestamp: {
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  tradeSellerButton: {
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    // paddingHorizontal and paddingVertical set dynamically
  },
  tradeSellerButtonText: {
    fontWeight: '600',
    color: '#0369A1',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  contactSection: {
    // marginTop set dynamically
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingVertical set dynamically
  },
  contactIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // marginRight, width and height set dynamically
  },
  contactText: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    flex: 1,
    // fontSize set dynamically
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    // marginLeft set dynamically
  },
});
