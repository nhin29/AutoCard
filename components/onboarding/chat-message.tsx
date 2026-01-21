import { Image, StyleSheet, Text, View } from 'react-native';
import { CHAT_MESSAGE_SIZES, ONBOARDING_COLORS } from '@/constants/onboarding-styles';

interface ChatMessageProps {
  text: string;
  timestamp: string;
  isRight?: boolean;
  isFaded?: boolean;
}

/**
 * Reusable chat message component
 */
export function ChatMessage({ text, timestamp, isRight = false, isFaded = false }: ChatMessageProps) {
  const containerStyle = isRight ? styles.rightContainer : styles.leftContainer;
  const rowStyle = isRight ? styles.rightRow : styles.leftRow;
  const bubbleStyle = isRight ? styles.rightBubble : styles.leftBubble;
  const textStyle = isRight ? styles.rightText : styles.leftText;
  const timestampStyle = isRight ? styles.rightTimestamp : styles.leftTimestamp;

  return (
    <View style={[containerStyle, isFaded && styles.faded]}>
      <View style={rowStyle}>
        {!isRight && (
          <View style={styles.avatar}>
            <Image
              source={require('@/assets/images/message-avatar.png')}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>
        )}
        <View style={bubbleStyle}>
          <Text style={textStyle}>{text}</Text>
        </View>
        {isRight && (
          <View style={styles.avatar}>
            <Image
              source={require('@/assets/images/message-avatar.png')}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>
        )}
      </View>
      <Text style={timestampStyle}>{timestamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  leftContainer: {
    width: CHAT_MESSAGE_SIZES.container,
    minHeight: 72,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  rightContainer: {
    width: CHAT_MESSAGE_SIZES.container,
    height: 88,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 4,
    alignSelf: 'flex-end',
  },
  faded: {
    opacity: 0.2,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    width: CHAT_MESSAGE_SIZES.row,
    minHeight: 48,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    width: CHAT_MESSAGE_SIZES.row,
    height: 64,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  leftBubble: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 12,
    gap: 4,
    width: CHAT_MESSAGE_SIZES.bubble,
    minHeight: 48,
    backgroundColor: ONBOARDING_COLORS.chatBubbleGreen,
    borderRadius: 12,
    borderTopLeftRadius: 8,
  },
  rightBubble: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 10,
    width: CHAT_MESSAGE_SIZES.bubble,
    height: 64,
    backgroundColor: ONBOARDING_COLORS.chatBubbleWhite,
    borderRadius: 12,
    borderTopRightRadius: 4,
  },
  leftText: {
    maxWidth: CHAT_MESSAGE_SIZES.text,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: ONBOARDING_COLORS.chatTextLight,
  },
  rightText: {
    width: 220,
    height: 48,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: ONBOARDING_COLORS.chatTextDark,
  },
  leftTimestamp: {
    width: CHAT_MESSAGE_SIZES.timestamp,
    height: 20,
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'right',
    color: ONBOARDING_COLORS.chatTimestamp,
  },
  rightTimestamp: {
    width: CHAT_MESSAGE_SIZES.timestamp,
    height: 20,
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'left',
    color: ONBOARDING_COLORS.chatTimestamp,
  },
});
