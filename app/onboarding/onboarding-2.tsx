import { OnboardingBackground } from '@/components/onboarding/onboarding-background';
import { OnboardingContent } from '@/components/onboarding/onboarding-content';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useResponsive } from '@/utils/responsive';

/**
 * Second Onboarding Screen
 * 
 * Features:
 * - Back button and Skip button in header
 * - Chat simulation with messages
 * - Verification badges
 * - Navigation dots (second dot active)
 * - Title, description, and buttons
 */
export default function OnboardingScreen2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isSmall } = useResponsive();

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    // Navigate to auth page
    router.replace('/auth/signin');
  };

  const handleBrowseAsGuest = () => {
    // Navigate to main app as guest
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    // Navigate to third onboarding screen
    router.push('/onboarding/onboarding-3');
  };

  // Calculate responsive sizes based on screen dimensions
  const skipFontSize = isSmall ? 14 : 15;
  const skipIconSize = isSmall ? 14 : 16;
  const backIconSize = isSmall ? 18 : 20;
  const topBarPadding = isSmall ? 8 : 10;
  const horizontalPadding = isSmall ? 16 : 20;
  const buttonFontSize = isSmall ? 14 : 16; // Reduced on small phones
  const buttonHeight = isSmall ? 44 : 52; // Reduced height on small phones
  const buttonPaddingVertical = isSmall ? 12 : 14; // Reduced padding on small phones
  const bottomPadding = isSmall ? 20 : 24;
  
  // Responsive chat message widths (percentage-based)
  const chatMaxWidth = width * 0.85; // 85% of screen width
  const messageBubbleMaxWidth = chatMaxWidth * 0.75; // 75% of chat area
  
  // Calculate responsive style values - more aggressive scaling for small phones
  const chatGap = isSmall ? 2 : 6; // Reduced spacing between messages
  const chatMarginBottom = isSmall ? 8 : 16;
  const messagePadding = isSmall ? 8 : 12;
  const messagePaddingVertical = isSmall ? 3 : 6; // Reduced vertical padding
  const messagePaddingHorizontal = isSmall ? 10 : 16;
  const messageFontSize = isSmall ? 12 : 15; // Reduced text size
  const messageLineHeight = isSmall ? 16 : 22; // Tighter line height
  const timestampFontSize = isSmall ? 10 : 12;
  const messageBubbleMinHeight = isSmall ? 36 : 44; // Reduced min height for single-line messages
  // Reduce message bubble width on small phones
  const messageBubbleMaxWidthSmall = isSmall ? chatMaxWidth * 0.7 : messageBubbleMaxWidth;
  const verificationGap = isSmall ? 8 : 10;
  const verificationMarginBottom = isSmall ? 12 : 20;
  const verificationMarginTop = isSmall ? 8 : 12;
  const verificationRowGap = isSmall ? 8 : 12;
  const verificationItemGap = isSmall ? 4 : 6;
  const verificationItemMargin = isSmall ? 4 : 8; // Margin for verification items
  const checkIconSize = isSmall ? 14 : 16; // Reduced from 18/20
  const checkIconBorderRadius = isSmall ? 7 : 8; // Reduced from 9/10
  const checkmarkFontSize = isSmall ? 9 : 10; // Reduced from 11/12
  const verificationTextSize = isSmall ? 11 : 12; // Reduced from 13/14
  const avatarSize = isSmall ? 18 : 20; // Smaller avatars on small phones
  const avatarBorderRadius = isSmall ? 9 : 10;

  return (
    <OnboardingBackground>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar style="dark" />
      
        {/* Top Bar with Back and Skip Buttons */}
        <View style={[styles.topBar, { paddingHorizontal: horizontalPadding, paddingTop: topBarPadding }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name="chevron.left" size={backIconSize} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={[styles.skipText, { fontSize: skipFontSize }]}>Skip</Text>
            <IconSymbol name="chevron.right" size={skipIconSize} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Central Content Area - Takes available space */}
        <View style={[styles.contentArea, { paddingTop: isSmall ? 12 : 20 }]}>
          {/* Chat Bubbles Section */}
          <View style={[styles.chatContainer, { paddingHorizontal: horizontalPadding, gap: chatGap, marginBottom: chatMarginBottom }]}>
            {/* Message 1 - Left side (placeholder/empty message) */}
            <View style={[styles.firstMessageContainer, { maxWidth: chatMaxWidth }]}>
              <View style={styles.firstMessageRow}>
                <View style={[styles.firstMessageAvatar, { width: avatarSize, height: avatarSize, borderRadius: avatarBorderRadius }]}>
                  <Image
                    source={require('@/assets/images/message-avatar.png')}
                    style={[styles.avatarImage, { width: avatarSize, height: avatarSize, borderRadius: avatarBorderRadius }]}
                    resizeMode="cover"
                  />
                </View>
                <View style={[styles.firstMessageBubbleContainer, { maxWidth: messageBubbleMaxWidthSmall }]}>
                  <View style={[styles.firstMessageBubble, { padding: messagePadding, minHeight: messageBubbleMinHeight }]}>
                    <View style={styles.firstMessageContent}>
                      {/* Empty content or placeholder */}
                    </View>
                  </View>
                </View>
              </View>
              <Text style={[styles.firstMessageTimestamp, { fontSize: timestampFontSize }]}>1:30 am</Text>
            </View>

            {/* Message 2 - Right side (incoming, white bubble) */}
            <View style={[styles.messageContainerRight, { maxWidth: chatMaxWidth }]}>
              <View style={styles.messageRowRight}>
                <View style={[styles.messageBubbleRight, { maxWidth: messageBubbleMaxWidthSmall, paddingVertical: messagePaddingVertical, paddingHorizontal: messagePaddingHorizontal, minHeight: messageBubbleMinHeight }]}>
                  <Text style={[styles.messageTextRight, { fontSize: messageFontSize, lineHeight: messageLineHeight }]}>
                    Yes, it&apos;s available. Would you like to schedule a viewing?
                  </Text>
                </View>
                <View style={[styles.messageAvatarRight, { width: avatarSize, height: avatarSize, borderRadius: avatarBorderRadius }]}>
                  <Image
                    source={require('@/assets/images/message-avatar.png')}
                    style={[styles.avatarImage, { width: avatarSize, height: avatarSize, borderRadius: avatarBorderRadius }]}
                    resizeMode="cover"
                  />
                </View>
              </View>
              <Text style={[styles.messageTimestampRight, { fontSize: timestampFontSize }]}>1:30 am</Text>
            </View>

            {/* Message 3 - Left side (outgoing, green bubble) */}
            <View style={[styles.messageContainerLeft, { maxWidth: chatMaxWidth }]}>
              <View style={styles.messageRowLeft}>
                <View style={[styles.messageAvatarLeft, { width: avatarSize, height: avatarSize, borderRadius: avatarBorderRadius }]}>
                  <Image
                    source={require('@/assets/images/message-avatar.png')}
                    style={[styles.avatarImage, { width: avatarSize, height: avatarSize, borderRadius: avatarBorderRadius }]}
                    resizeMode="cover"
                  />
                </View>
                <View style={[styles.messageBubbleLeft, { maxWidth: messageBubbleMaxWidthSmall, paddingVertical: messagePaddingVertical, paddingHorizontal: messagePaddingHorizontal, minHeight: messageBubbleMinHeight }]}>
                  <Text style={[styles.messageTextLeft, { fontSize: messageFontSize, lineHeight: messageLineHeight }]}>
                    Can you send more pictures of it?
                  </Text>
                </View>
              </View>
              <Text style={[styles.messageTimestampLeft, { fontSize: timestampFontSize }]}>1:30 am</Text>
            </View>

            {/* Message 4 - Right side (incoming, white bubble) */}
            <View style={[styles.messageContainerRight, { maxWidth: chatMaxWidth }]}>
              <View style={styles.messageRowRight}>
                <View style={[styles.messageBubbleRight, { maxWidth: messageBubbleMaxWidthSmall, paddingVertical: messagePaddingVertical, paddingHorizontal: messagePaddingHorizontal, minHeight: messageBubbleMinHeight }]}>
                  <Text style={[styles.messageTextRight, { fontSize: messageFontSize, lineHeight: messageLineHeight }]}>
                    Sure, I&apos;ll send more pictures today.
                  </Text>
                </View>
                <View style={[styles.messageAvatarRight, { width: avatarSize, height: avatarSize, borderRadius: avatarBorderRadius }]}>
                  <Image
                    source={require('@/assets/images/message-avatar.png')}
                    style={[styles.avatarImage, { width: avatarSize, height: avatarSize, borderRadius: avatarBorderRadius }]}
                    resizeMode="cover"
                  />
                </View>
              </View>
              <Text style={[styles.messageTimestampRight, { fontSize: timestampFontSize }]}>1:30 am</Text>
            </View>
          </View>

          {/* Verification Badges */}
          <View style={[styles.verificationContainer, { paddingHorizontal: horizontalPadding, gap: verificationGap, marginBottom: verificationMarginBottom, marginTop: verificationMarginTop }]}>
            <View style={[styles.verificationRow, { gap: verificationRowGap }]}>
              <View style={[styles.verificationItem, { gap: verificationItemGap, marginHorizontal: verificationItemMargin }]}>
                <View style={[styles.checkIcon, { width: checkIconSize, height: checkIconSize, borderRadius: checkIconBorderRadius }]}>
                  <Text style={[styles.checkmark, { fontSize: checkmarkFontSize }]}>✓</Text>
                </View>
                <Text style={[styles.verificationText, { fontSize: verificationTextSize }]}>Verified Trade sellers</Text>
              </View>
              <View style={[styles.verificationItem, { gap: verificationItemGap, marginHorizontal: verificationItemMargin }]}>
                <View style={[styles.checkIcon, { width: checkIconSize, height: checkIconSize, borderRadius: checkIconBorderRadius }]}>
                  <Text style={[styles.checkmark, { fontSize: checkmarkFontSize }]}>✓</Text>
                </View>
                <Text style={[styles.verificationText, { fontSize: verificationTextSize }]}>Verified Private sellers</Text>
              </View>
            </View>
            <View style={[styles.verificationItemCenter, { gap: verificationItemGap, marginTop: 4 }]}>
              <View style={[styles.checkIcon, { width: checkIconSize, height: checkIconSize, borderRadius: checkIconBorderRadius }]}>
                <Text style={[styles.checkmark, { fontSize: checkmarkFontSize }]}>✓</Text>
              </View>
              <Text style={[styles.verificationText, { fontSize: verificationTextSize }]}>In-app chat (no external links)</Text>
            </View>
          </View>
        </View>

        {/* Bottom Section - Anchored to bottom */}
        <View style={[styles.onboardingContentWrapper, { paddingBottom: bottomPadding }]}>
          <OnboardingContent
            activeDotIndex={1}
            title="Chat Directly With Real Sellers"
            description="Message private owners and verified trade sellers instantly inside the app.">
            <TouchableOpacity
              style={[styles.guestButton, { backgroundColor: '#E5E7EB', minHeight: buttonHeight, paddingVertical: buttonPaddingVertical }]}
              onPress={handleBrowseAsGuest}
              activeOpacity={0.8}>
              <Text style={[styles.guestButtonText, { fontSize: buttonFontSize }]}>Browse as Guest</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextButton, { minHeight: buttonHeight, paddingVertical: buttonPaddingVertical }]}
              onPress={handleNext}>
              <Text style={[styles.nextButtonText, { fontSize: buttonFontSize }]}>Next</Text>
            </TouchableOpacity>
          </OnboardingContent>
        </View>
      </View>
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between', // Push content to top and bottom
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    flexShrink: 0, // Don't shrink the top bar
  },
  backButton: {
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  skipText: {
    fontWeight: '400',
    color: '#000000',
    flexShrink: 1,
  },
  contentArea: {
    flex: 1, // Take available space between top bar and bottom content
    backgroundColor: 'transparent',
    paddingTop: 20,
    paddingBottom: 0,
    overflow: 'visible', // Allow verification items to be visible
  },
  onboardingContentWrapper: {
    flexShrink: 0, // Don't shrink, keep at bottom
  },
  chatContainer: {
    position: 'relative',
    alignItems: 'stretch',
  },
  avatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  // First message (placeholder/empty, left side)
  firstMessageContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    alignSelf: 'flex-start',
  },
  firstMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  firstMessageAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    opacity: 0.3, // Faded appearance for placeholder
    flexShrink: 0,
  },
  firstMessageBubbleContainer: {
    flex: 1,
    minWidth: 0,
    opacity: 0.3, // Faded appearance for placeholder
  },
  firstMessageBubble: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6', // Light grey for placeholder
    borderRadius: 12,
    borderTopLeftRadius: 8,
  },
  firstMessageContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    width: '100%',
    minHeight: 24,
  },
  firstMessageTimestamp: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'left',
    color: '#6B7280',
    opacity: 0.5, // Faded timestamp
    marginTop: 2, // Reduced from 4
    paddingLeft: 24, // Align with bubble edge
  },
  // Right side messages (incoming)
  messageContainerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
    alignSelf: 'flex-end',
  },
  messageRowRight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  messageBubbleRight: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderTopRightRadius: 4,
  },
  messageTextRight: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    color: '#111827',
    flexShrink: 1,
  },
  messageAvatarRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
  },
  messageTimestampRight: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'right',
    color: '#6B7280',
    marginTop: 2, // Reduced from 4
    paddingRight: 24, // Align with bubble edge
  },
  // Left side messages (outgoing)
  messageContainerLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    alignSelf: 'flex-start',
  },
  messageRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  messageBubbleLeft: {
    backgroundColor: '#07B007',
    borderRadius: 12,
    borderTopLeftRadius: 8,
  },
  messageTextLeft: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  messageAvatarLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
  },
  messageTimestampLeft: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'left',
    color: '#6B7280',
    marginTop: 2, // Reduced from 4
    paddingLeft: 24, // Align with bubble edge
  },
  verificationContainer: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8, // Add vertical padding to ensure visibility
  },
  verificationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%',
    paddingHorizontal: 8, // Add horizontal padding
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  verificationItemCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 4, // Add top margin
  },
  checkIcon: {
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  verificationText: {
    fontWeight: '400',
    color: '#374151',
    fontFamily: 'Source Sans Pro',
  },
  guestButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  guestButtonText: {
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    flexShrink: 1,
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  nextButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
    flexShrink: 1,
  },
});
