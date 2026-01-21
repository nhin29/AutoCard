import { IconSymbol } from '@/components/ui/icon-symbol';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Sidebar Menu Component
 * 
 * Left-side navigation drawer with menu items, social links, and account actions
 */
export function Sidebar({ visible, onClose }: SidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const accountType = user?.profile?.account_type || 'private';
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleLogout = () => {
    // Show confirmation modal
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    try {
      // Close modal first
      setShowLogoutModal(false);
      onClose();
      
      // Sign out from Supabase
      await authService.signOut();
      // Clear auth store
      logout();
      // Navigate to login
      router.replace('/auth/signin');
    } catch (error) {
      console.error('[Sidebar] Logout error:', error);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleDeleteAccount = () => {
    // TODO: Implement delete account functionality
  };

  const handleEditProfile = () => {
    onClose();
    router.push('/settings/edit-profile');
  };

  const handleMenuItem = (route: string) => {
    onClose();
    // Navigate to respective pages
    if (route === 'about') {
      router.push('/settings/about');
    } else if (route === 'terms') {
      router.push('/legal/terms-of-service');
    } else if (route === 'privacy') {
      router.push('/legal/privacy-policy');
    } else if (route === 'support') {
      router.push('/settings/support');
    }
  };

  const handleToggleSellerType = () => {
    // TODO: Implement seller type toggle
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Overlay */}
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: opacityAnim,
            },
          ]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
            {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          </TouchableOpacity>
        </Animated.View>

        {/* Sidebar */}
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}>
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="xmark" size={20} color="#000000" />
        </TouchableOpacity>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}>
          {/* Menu Items */}
          <View style={styles.menuSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEditProfile}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="pencil" size={18} color="#1F2937" />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItem('ads-management')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="slider.horizontal.3" size={18} color="#1F2937" />
              <Text style={styles.menuItemText}>Ads Managements</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItem('viewed-ads')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="eye.fill" size={18} color="#1F2937" />
              <Text style={styles.menuItemText}>Viewed Ads</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItem('likes')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="heart.fill" size={18} color="#1F2937" />
              <Text style={styles.menuItemText}>Likes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItem('about')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>i</Text>
              </View>
              <Text style={styles.menuItemText}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItem('terms')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="creditcard.fill" size={18} color="#1F2937" />
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItem('privacy')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="shield.checkmark" size={18} color="#1F2937" />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItem('support')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="message.fill" size={18} color="#1F2937" />
              <Text style={styles.menuItemText}>Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItem('purchase-history')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="creditcard.fill" size={18} color="#1F2937" />
              <Text style={styles.menuItemText}>Purchase History</Text>
            </TouchableOpacity>
          </View>

          {/* Follow us on Section */}
          <View style={styles.socialSection}>
            <Text style={styles.socialSectionTitle}>Follow us on</Text>
            <View style={styles.socialLinks}>
              <TouchableOpacity
                style={styles.socialLink}
                onPress={() => handleMenuItem('autocart-website')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <IconSymbol name="house.fill" size={18} color="#1F2937" />
                <Text style={styles.socialLinkText}>AutoCart.ie</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialLink}
                onPress={() => handleMenuItem('facebook')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View style={[styles.socialIcon, styles.facebookIcon]}>
                  <Text style={styles.socialIconText}>f</Text>
                </View>
                <Text style={styles.socialLinkText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialLink}
                onPress={() => handleMenuItem('instagram')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View style={[styles.socialIcon, styles.instagramIcon]}>
                  <IconSymbol name="camera.fill" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.socialLinkText}>Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialLink}
                onPress={() => handleMenuItem('tiktok')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View style={[styles.socialIcon, styles.tiktokIcon]}>
                  <Text style={styles.socialIconText}>T</Text>
                </View>
                <Text style={styles.socialLinkText}>TikTok</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Seller Type Toggle */}
          <View style={styles.toggleSection}>
            <Text style={styles.toggleLabel}>Private Seller</Text>
            <TouchableOpacity
              style={[styles.toggle, accountType === 'trade' && styles.toggleActive]}
              onPress={handleToggleSellerType}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={[styles.toggleThumb, accountType === 'trade' && styles.toggleThumbActive]} />
            </TouchableOpacity>
            <Text style={styles.toggleLabel}>Trade Seller</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeleteAccount}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="trash.fill" size={18} color="#EF4444" />
              <Text style={styles.actionButtonText}>Delete Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLogout}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={styles.logoutIcon}>
                <IconSymbol name="chevron.right" size={14} color="#EF4444" />
              </View>
              <Text style={styles.actionButtonText}>Log out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelLogout}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Icon */}
            <View style={styles.modalIconContainer}>
              <View style={styles.modalIconCircle}>
                <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FFFFFF" />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Log out</Text>

            {/* Message */}
            <Text style={styles.modalMessage}>
              Are you sure, you want to log out the app
            </Text>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCancelLogout}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalLogoutButton}
                onPress={handleConfirmLogout}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <Text style={styles.modalLogoutButtonText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: '70%',
    maxWidth: 300,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 16,
    paddingBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 10,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  menuSection: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1F2937',
    fontFamily: 'system-ui',
  },
  infoIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'system-ui',
  },
  socialSection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  socialSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'system-ui',
    marginBottom: 10,
  },
  socialLinks: {
    gap: 8,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  socialIcon: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookIcon: {
    backgroundColor: '#1877F2',
  },
  instagramIcon: {
    backgroundColor: '#E4405F',
  },
  tiktokIcon: {
    backgroundColor: '#000000',
  },
  socialIconText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
  socialLinkText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#1F2937',
    fontFamily: 'system-ui',
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily: 'system-ui',
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  actionsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  logoutIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
    fontFamily: 'system-ui',
  },
  // Logout Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FCE7F3',
    borderWidth: 2,
    borderColor: '#F9A8D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'system-ui',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'system-ui',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'system-ui',
  },
  modalLogoutButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLogoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
});
