import { OnboardingBackground } from '@/components/onboarding/onboarding-background';
import { OnboardingContent } from '@/components/onboarding/onboarding-content';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  return (
    <OnboardingBackground>
      <View style={styles.container}>
        <StatusBar style="dark" />
      
      {/* Top Bar with Back and Skip Buttons */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <IconSymbol name="chevron.left" size={20} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
          <IconSymbol name="chevron.right" size={16} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Central Content Area */}
      <View style={styles.contentArea}>
        {/* Chat Bubbles Section */}
        <View style={styles.chatContainer}>
          {/* Message 1 - Left side (faded, first message) */}
          <View style={styles.firstMessageContainer}>
            <View style={styles.firstMessageRow}>
              <View style={styles.firstMessageAvatar}>
                <Image
                  source={require('@/assets/images/message-avatar.png')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.firstMessageBubbleContainer}>
                <View style={styles.firstMessageBubble}>
                  <View style={styles.firstMessageContent}>
                    {/* Empty content or placeholder */}
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.firstMessageTimestamp}>1:30 am</Text>
          </View>

          {/* Message 2 - Right side (white bubble) */}
          <View style={styles.secondMessageContainer}>
            <View style={styles.secondMessageRow}>
              <View style={styles.secondMessageBubble}>
                <Text style={styles.secondMessageText}>
                  Yes, it&apos;s available. Would you like to schedule a viewing?
                </Text>
              </View>
              <View style={styles.secondMessageAvatar}>
                <Image
                  source={require('@/assets/images/message-avatar.png')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
            </View>
            <Text style={styles.secondMessageTimestamp}>1:30 am</Text>
          </View>

          {/* Message 3 - Left side (green bubble) */}
          <View style={styles.thirdMessageContainer}>
            <View style={styles.thirdMessageRow}>
              <View style={styles.thirdMessageAvatar}>
                <Image
                  source={require('@/assets/images/message-avatar.png')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.thirdMessageBubbleContainer}>
                <View style={styles.thirdMessageBubble}>
                  <Text style={styles.thirdMessageText}>
                    Can you send more pictures of it?
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.thirdMessageTimestamp}>1:30 am</Text>
          </View>

          {/* Message 4 - Right side (white bubble) */}
          <View style={styles.fourthMessageContainer}>
            <View style={styles.fourthMessageRow}>
              <View style={styles.fourthMessageBubble}>
                <Text style={styles.fourthMessageText}>
                  Sure, I&apos;ll send more pictures today.
                </Text>
              </View>
              <View style={styles.fourthMessageAvatar}>
                <Image
                  source={require('@/assets/images/message-avatar.png')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
            </View>
            <Text style={styles.fourthMessageTimestamp}>1:30 am</Text>
          </View>
        </View>

        {/* Verification Badges */}
        <View style={styles.verificationContainer}>
          <View style={styles.verificationRow}>
            <View style={styles.verificationItem}>
              <View style={styles.checkIcon}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              <Text style={styles.verificationText}>Verified Trade sellers</Text>
            </View>
            <View style={styles.verificationItem}>
              <View style={styles.checkIcon}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              <Text style={styles.verificationText}>Verified Private sellers</Text>
            </View>
          </View>
          <View style={styles.verificationItemCenter}>
            <View style={styles.checkIcon}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.verificationText}>In-app chat (no external links)</Text>
          </View>
        </View>

      </View>

      {/* Bottom Section */}
      <View style={styles.onboardingContentWrapper}>
      <OnboardingContent
        activeDotIndex={1}
        title="Chat Directly With Real Sellers"
        description="Message private owners and verified trade sellers instantly inside the app.">
        <TouchableOpacity
          style={[styles.guestButton, { backgroundColor: '#E5E7EB' }]}
          onPress={handleBrowseAsGuest}
          activeOpacity={0.8}>
          <Text style={styles.guestButtonText}>Browse as Guest</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
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
    paddingTop: 50, // Space for status bar
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
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
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },
  contentArea: {
    flex: 1,
    backgroundColor: 'transparent', // Shows gradient background
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0, // Reduce bottom padding to move content up
  },
  onboardingContentWrapper: {
    marginTop: -30, // Move onboarding content up
  },
  chatContainer: {
    gap: 12,
    marginBottom: 24,
    position: 'relative',
    alignItems: 'stretch',
  },
  firstMessageContainer: {
    width: 304,
    height: 72,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
    opacity: 1, // Container opacity
  },
  firstMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    width: 304,
    height: 48,
  },
  firstMessageAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    opacity: 0.2,
    flexShrink: 0,
  },
  avatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  firstMessageBubbleContainer: {
    width: 280,
    height: 48,
    opacity: 0.2,
    flex: 1,
  },
  firstMessageBubble: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    gap: 4,
    width: 280,
    height: 48,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
    borderRadius: 12, // 8px 12px 12px 12px
    borderTopLeftRadius: 8, // Top-left corner is 8px
  },
  firstMessageContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    width: 256,
    height: 24,
  },
  firstMessageTimestamp: {
    width: 304,
    height: 20,
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'right',
    color: '#6B7280', // gray/500
    opacity: 0.2,
  },
  secondMessageContainer: {
    width: 276,
    height: 88,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 4,
    alignSelf: 'flex-end', // Align container to the right
  },
  secondMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    width: 276,
    height: 64,
  },
  secondMessageBubble: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 10,
    width: 252,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 12, // 12px 4px 12px 12px
    borderTopRightRadius: 4, // Top-right corner is 4px
  },
  secondMessageText: {
    width: 220,
    height: 48,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#111827', // gray/900
  },
  secondMessageAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
  },
  secondMessageTimestamp: {
    width: 276,
    height: 20,
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'left', // Align with left border of message bubble
    paddingLeft: 0, // Align with bubble's left edge
    color: '#6B7280', // gray/500
  },
  thirdMessageContainer: {
    width: 304,
    height: 72,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  thirdMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    width: 304,
    height: 48,
  },
  thirdMessageAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
  },
  thirdMessageBubbleContainer: {
    width: 280,
    minHeight: 48,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    flex: 1,
  },
  thirdMessageBubble: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 12,
    gap: 4,
    width: 280,
    minHeight: 48,
    backgroundColor: '#07B007', // Green background
    borderRadius: 12, // 8px 12px 12px 12px
    borderTopLeftRadius: 8, // Top-left corner is 8px
  },
  thirdMessageText: {
    maxWidth: 256,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF', // White text
  },
  thirdMessageTimestamp: {
    width: 304,
    height: 20,
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'right',
    color: '#6B7280', // gray/500
  },
  fourthMessageContainer: {
    width: 276,
    height: 88,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 4,
    alignSelf: 'flex-end', // Align container to the right
  },
  fourthMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    width: 276,
    height: 64,
  },
  fourthMessageBubble: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 10,
    width: 252,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 12, // 12px 4px 12px 12px
    borderTopRightRadius: 4, // Top-right corner is 4px
  },
  fourthMessageText: {
    width: 220,
    height: 48,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#111827', // gray/900
  },
  fourthMessageAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
  },
  fourthMessageTimestamp: {
    width: 276,
    height: 20,
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'left', // Align with left border of message bubble
    paddingLeft: 0, // Align with bubble's left edge
    color: '#6B7280', // gray/500
  },
  messageRowRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageRowLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageBubbleRight: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: SCREEN_WIDTH * 0.65,
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    // Tail pointing right
    position: 'relative',
  },
  messageBubbleLeft: {
    backgroundColor: '#4CAF50',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: SCREEN_WIDTH * 0.65,
    borderBottomLeftRadius: 4,
    // Tail pointing left
    position: 'relative',
  },
  messageBubbleFaded: {
    backgroundColor: '#F3F4F6', // Light grey for faded message
    opacity: 0.4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageTextRight: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 20,
  },
  messageTextLeft: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  messageTextFaded: {
    color: '#9CA3AF',
    opacity: 0.5,
  },
  avatarFaded: {
    opacity: 0.4,
  },
  avatarContainer: {
    width: 36,
    height: 36,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9CA3AF',
  },
  timestampRight: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'right',
    marginTop: 4,
    marginRight: 40,
    marginBottom: 8,
  },
  timestampLeft: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'left',
    marginTop: 4,
    marginLeft: 40,
    marginBottom: 8,
  },
  verificationContainer: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  verificationRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verificationItemCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4B5563', // Dark grey circular icon
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151', // Dark grey text
    fontFamily: 'Source Sans Pro',
  },
  guestButton: {
    flex: 1,
    backgroundColor: '#E5E7EB', // grey/200
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'system-ui',
  },
});
