import { PhoneIcon } from '@/components/icons/PhoneIcon';
import { VerifyIcon } from '@/components/icons/VerifyIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
          {/* Profile Header Section */}
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={profileImage || require('@/assets/images/message-avatar.png')}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
                <View style={styles.addFriendBadge}>
                  <IconSymbol name="plus" size={12} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.sellerDetails}>
                <View style={styles.sellerNameRow}>
                  <Text style={styles.sellerName}>{sellerName}</Text>
                  {isVerified && (
                    <View style={styles.verifiedBadge}>
                      <VerifyIcon width={16} height={16} />
                    </View>
                  )}
                </View>
                <Text style={styles.timestamp}>{timestamp}-</Text>
              </View>
            </View>
            <View style={styles.rightSection}>
              {isTradeSeller && (
                <TouchableOpacity
                  style={styles.tradeSellerButton}
                  {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                  <Text style={styles.tradeSellerButtonText}>Trade Seller</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View style={styles.closeButtonCircle}>
                  <IconSymbol name="xmark" size={10} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Information Section */}
          <View style={styles.contactSection}>
            {/* Call Information */}
            <View style={styles.contactRow}>
              <View style={styles.contactIconContainer}>
                <PhoneIcon width={20} height={20} color="#000000" />
              </View>
              <Text style={styles.contactText}>Call- {phoneNumber}</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Email Information */}
            <View style={styles.contactRow}>
              <View style={styles.contactIconContainer}>
                <IconSymbol name="envelope.fill" size={20} color="#000000" />
              </View>
              <Text style={styles.contactText}>Email- {email}</Text>
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
    padding: 20,
    paddingBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  addFriendBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  verifiedBadge: {
    width: 18,
    height: 18,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
  },
  tradeSellerButton: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tradeSellerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
    fontFamily: 'system-ui',
  },
  contactSection: {
    marginTop: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  contactIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'system-ui',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 44,
  },
});
