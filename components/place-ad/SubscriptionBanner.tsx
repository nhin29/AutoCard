import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { sharedStyles } from './shared-styles';

interface SubscriptionBannerProps {
  onUpgradePlan?: () => void;
}

/**
 * Subscription and billing information banner
 */
export function SubscriptionBanner({ onUpgradePlan }: SubscriptionBannerProps) {
  return (
    <View style={sharedStyles.section}>
      <Text style={sharedStyles.sectionLabel}>Subscription & Billing</Text>
      <View style={styles.trialBox}>
        <Text style={styles.trialTitle}>You&apos;re on a 1-month free trial</Text>
        <Text style={styles.trialText}>Post ads now. No payment required today.</Text>
        <Text style={styles.trialWarning}>SUBSCRIPTION REQUIRED AFTER TRIAL TO KEEP ADS LIVE.</Text>
        <TouchableOpacity
          style={styles.upgradePlanButton}
          onPress={onUpgradePlan}
          {...(Platform.OS === 'web' && { cursor: 'pointer' })}>
          <Text style={styles.upgradePlanText}>Upgrade Plan</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.upgradeInfoText}>
        You can upgrade anytime after publishing your first ad
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  trialBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  trialTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16A34A',
    fontFamily: 'system-ui',
    marginBottom: 8,
  },
  trialText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 4,
  },
  trialWarning: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'system-ui',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  upgradePlanButton: {
    width: '100%',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#16A34A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradePlanText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#16A34A',
    fontFamily: 'system-ui',
  },
  upgradeInfoText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#F97316',
    fontFamily: 'system-ui',
  },
});
