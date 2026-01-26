import { IconSymbol } from '@/components/ui/icon-symbol';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useResponsive, SPACING, FONT_SIZES } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const { isSmall, width: screenWidth } = useResponsive();
  const { user, logout } = useAuthStore();
  const accountType = user?.profile?.account_type || 'private';
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Calculate responsive values - reduced for small phones
  const sidebarWidth = isSmall ? '75%' : '70%';
  const sidebarMaxWidth = isSmall ? 280 : 300;
  const sidebarActualWidth = Math.min(screenWidth * (isSmall ? 0.75 : 0.7), sidebarMaxWidth);
  const slideAnim = useRef(new Animated.Value(-sidebarActualWidth)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const sidebarPaddingTop = Math.max(insets.top + (isSmall ? SPACING.base : SPACING.md), isSmall ? 40 : (Platform.OS === 'ios' ? 50 : 40));
  const sidebarPaddingH = isSmall ? SPACING.sm : SPACING.base;
  const sidebarPaddingBottom = isSmall ? SPACING.md : 20;
  const closeButtonSize = isSmall ? 24 : 28;
  const closeButtonIconSize = isSmall ? 16 : 20;
  const menuItemIconSize = isSmall ? 16 : 18;
  const menuItemTextSize = isSmall ? FONT_SIZES.sm : 14;
  const menuItemPaddingV = isSmall ? 6 : 8;
  const menuItemGap = isSmall ? 8 : 10;
  const infoIconSize = isSmall ? 16 : 18;
  const infoIconTextSize = isSmall ? 10 : 11;
  const socialSectionTitleSize = isSmall ? 11 : 12;
  const socialIconSize = isSmall ? 18 : 20;
  const socialIconInnerSize = isSmall ? 10 : 12;
  const socialIconTextSize = isSmall ? 9 : 10;
  const socialLinkTextSize = isSmall ? FONT_SIZES.sm : 13;
  const socialLinkPaddingV = isSmall ? 5 : 6;
  const toggleLabelSize = isSmall ? FONT_SIZES.sm : 13;
  const toggleWidth = isSmall ? 40 : 44;
  const toggleHeight = isSmall ? 24 : 26;
  const toggleThumbSize = isSmall ? 20 : 22;
  const actionButtonTextSize = isSmall ? FONT_SIZES.sm : 14;
  const actionButtonIconSize = isSmall ? 16 : 18;
  const actionButtonGap = isSmall ? 8 : 10;

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
          toValue: -sidebarActualWidth,
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
              width: sidebarWidth,
              maxWidth: sidebarMaxWidth,
              paddingTop: sidebarPaddingTop,
              paddingHorizontal: sidebarPaddingH,
              paddingBottom: sidebarPaddingBottom,
              transform: [{ translateX: slideAnim }],
            },
          ]}>
        {/* Close Button */}
        <TouchableOpacity
          style={[styles.closeButton, { width: closeButtonSize, height: closeButtonSize, borderRadius: closeButtonSize / 2 }]}
          onPress={onClose}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <IconSymbol name="xmark" size={closeButtonIconSize} color="#000000" />
        </TouchableOpacity>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}>
          {/* Menu Items */}
          <View style={styles.menuSection}>
            <TouchableOpacity
              style={[styles.menuItem, { paddingVertical: menuItemPaddingV, gap: menuItemGap }]}
              onPress={handleEditProfile}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="pencil" size={menuItemIconSize} color="#1F2937" />
              <Text style={[styles.menuItemText, { fontSize: menuItemTextSize }]}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { paddingVertical: menuItemPaddingV, gap: menuItemGap }]}
              onPress={() => handleMenuItem('ads-management')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="slider.horizontal.3" size={menuItemIconSize} color="#1F2937" />
              <Text style={[styles.menuItemText, { fontSize: menuItemTextSize }]}>Ads Managements</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { paddingVertical: menuItemPaddingV, gap: menuItemGap }]}
              onPress={() => handleMenuItem('viewed-ads')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="eye.fill" size={menuItemIconSize} color="#1F2937" />
              <Text style={[styles.menuItemText, { fontSize: menuItemTextSize }]}>Viewed Ads</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { paddingVertical: menuItemPaddingV, gap: menuItemGap }]}
              onPress={() => handleMenuItem('likes')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="heart.fill" size={menuItemIconSize} color="#1F2937" />
              <Text style={[styles.menuItemText, { fontSize: menuItemTextSize }]}>Likes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { paddingVertical: menuItemPaddingV, gap: menuItemGap }]}
              onPress={() => handleMenuItem('about')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={[styles.infoIcon, { width: infoIconSize, height: infoIconSize, borderRadius: infoIconSize / 2 }]}>
                <Text style={[styles.infoIconText, { fontSize: infoIconTextSize }]}>i</Text>
              </View>
              <Text style={[styles.menuItemText, { fontSize: menuItemTextSize }]}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { paddingVertical: menuItemPaddingV, gap: menuItemGap }]}
              onPress={() => handleMenuItem('terms')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="creditcard.fill" size={menuItemIconSize} color="#1F2937" />
              <Text style={[styles.menuItemText, { fontSize: menuItemTextSize }]}>Terms of Service</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { paddingVertical: menuItemPaddingV, gap: menuItemGap }]}
              onPress={() => handleMenuItem('privacy')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="shield.checkmark" size={menuItemIconSize} color="#1F2937" />
              <Text style={[styles.menuItemText, { fontSize: menuItemTextSize }]}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { paddingVertical: menuItemPaddingV, gap: menuItemGap }]}
              onPress={() => handleMenuItem('support')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="message.fill" size={menuItemIconSize} color="#1F2937" />
              <Text style={[styles.menuItemText, { fontSize: menuItemTextSize }]}>Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { paddingVertical: menuItemPaddingV, gap: menuItemGap }]}
              onPress={() => handleMenuItem('purchase-history')}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="creditcard.fill" size={menuItemIconSize} color="#1F2937" />
              <Text style={[styles.menuItemText, { fontSize: menuItemTextSize }]}>Purchase History</Text>
            </TouchableOpacity>
          </View>

          {/* Follow us on Section */}
          <View style={styles.socialSection}>
            <Text style={[styles.socialSectionTitle, { fontSize: socialSectionTitleSize }]}>Follow us on</Text>
            <View style={styles.socialLinks}>
              <TouchableOpacity
                style={[styles.socialLink, { paddingVertical: socialLinkPaddingV, gap: menuItemGap }]}
                onPress={() => handleMenuItem('autocart-website')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <IconSymbol name="house.fill" size={menuItemIconSize} color="#1F2937" />
                <Text style={[styles.socialLinkText, { fontSize: socialLinkTextSize }]}>AutoCart.ie</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialLink, { paddingVertical: socialLinkPaddingV, gap: menuItemGap }]}
                onPress={() => handleMenuItem('facebook')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View style={[styles.socialIcon, styles.facebookIcon, { width: socialIconSize, height: socialIconSize }]}>
                  <Text style={[styles.socialIconText, { fontSize: socialIconTextSize }]}>f</Text>
                </View>
                <Text style={[styles.socialLinkText, { fontSize: socialLinkTextSize }]}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialLink, { paddingVertical: socialLinkPaddingV, gap: menuItemGap }]}
                onPress={() => handleMenuItem('instagram')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View style={[styles.socialIcon, styles.instagramIcon, { width: socialIconSize, height: socialIconSize }]}>
                  <IconSymbol name="camera.fill" size={socialIconInnerSize} color="#FFFFFF" />
                </View>
                <Text style={[styles.socialLinkText, { fontSize: socialLinkTextSize }]}>Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialLink, { paddingVertical: socialLinkPaddingV, gap: menuItemGap }]}
                onPress={() => handleMenuItem('tiktok')}
                {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
                <View style={[styles.socialIcon, styles.tiktokIcon, { width: socialIconSize, height: socialIconSize }]}>
                  <Text style={[styles.socialIconText, { fontSize: socialIconTextSize }]}>T</Text>
                </View>
                <Text style={[styles.socialLinkText, { fontSize: socialLinkTextSize }]}>TikTok</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Seller Type Toggle */}
          <View style={styles.toggleSection}>
            <Text style={[styles.toggleLabel, { fontSize: toggleLabelSize }]}>Private Seller</Text>
            <TouchableOpacity
              style={[styles.toggle, { width: toggleWidth, height: toggleHeight, borderRadius: toggleHeight / 2 }, accountType === 'trade' && styles.toggleActive]}
              onPress={handleToggleSellerType}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={[styles.toggleThumb, { width: toggleThumbSize, height: toggleThumbSize, borderRadius: toggleThumbSize / 2 }, accountType === 'trade' && styles.toggleThumbActive]} />
            </TouchableOpacity>
            <Text style={[styles.toggleLabel, { fontSize: toggleLabelSize }]}>Trade Seller</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.actionButton, { gap: actionButtonGap }]}
              onPress={handleDeleteAccount}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <IconSymbol name="trash.fill" size={actionButtonIconSize} color="#EF4444" />
              <Text style={[styles.actionButtonText, { fontSize: actionButtonTextSize }]}>Delete Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { gap: actionButtonGap }]}
              onPress={handleLogout}
              {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
              <View style={[styles.logoutIcon, { width: actionButtonIconSize, height: actionButtonIconSize }]}>
                <IconSymbol name="chevron.right" size={isSmall ? 12 : 14} color="#EF4444" />
              </View>
              <Text style={[styles.actionButtonText, { fontSize: actionButtonTextSize }]}>Log out</Text>
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
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    // width, maxWidth, paddingTop, paddingHorizontal, paddingBottom set dynamically
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 10,
  },
  closeButton: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
    // width, height, borderRadius set dynamically
  },
  menuSection: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingVertical and gap set dynamically
  },
  menuItemText: {
    fontWeight: '400',
    color: '#1F2937',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  infoIcon: {
    borderWidth: 1.5,
    borderColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    // width, height, borderRadius set dynamically
  },
  infoIconText: {
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  socialSection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  socialSectionTitle: {
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'system-ui',
    marginBottom: 10,
    // fontSize set dynamically
  },
  socialLinks: {
    gap: 8,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap and paddingVertical set dynamically
  },
  socialIcon: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    // width and height set dynamically
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
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  socialLinkText: {
    fontWeight: '400',
    color: '#1F2937',
    fontFamily: 'system-ui',
    // fontSize set dynamically
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
    fontWeight: '500',
    color: '#1F2937',
    fontFamily: 'system-ui',
    // fontSize set dynamically
  },
  toggle: {
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    paddingHorizontal: 2,
    // width, height, borderRadius set dynamically
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    // width, height, borderRadius set dynamically
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
    paddingVertical: 8,
    // gap set dynamically
  },
  logoutIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    // width and height set dynamically
  },
  actionButtonText: {
    fontWeight: '500',
    color: '#EF4444',
    fontFamily: 'system-ui',
    // fontSize set dynamically
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
