import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import {
    HomeTabIcon,
    MessageTabIcon,
    ProfileTabIcon,
    ScanTabIcon,
    SearchTabIcon,
    StoryTabIcon,
} from '@/components/icons/TabIcons';
import { FONT_SIZES, useResponsive } from '@/utils/responsive';

export default function TabLayout() {
  const activeColor = '#4CAF50';
  const inactiveColor = '#374151';
  const insets = useSafeAreaInsets();
  const { isSmall } = useResponsive();

  // Calculate responsive tab bar sizes
  const tabBarHeight = isSmall ? 48 : 56;
  const tabBarPaddingTop = isSmall ? 4 : 6;
  const tabIconSize = isSmall ? 20 : 24;
  const tabLabelFontSize = isSmall ? FONT_SIZES.xs : FONT_SIZES.sm;
  const badgeMinSize = isSmall ? 18 : 20;
  const badgeFontSize = isSmall ? 9 : 10;
  const badgeTopOffset = isSmall ? -8 : -6;
  const badgeRightOffset = isSmall ? -10 : -8;
  const badgePaddingH = isSmall ? 4 : 5;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: tabBarPaddingTop,
          overflow: 'visible', // Allow badges to extend beyond tab bar
        },
        tabBarLabelStyle: {
          fontSize: tabLabelFontSize,
          fontWeight: '500',
          fontFamily: 'system-ui',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <HomeTabIcon size={tabIconSize} color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <SearchTabIcon size={tabIconSize} color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <ScanTabIcon size={tabIconSize} color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Message',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <MessageTabIcon size={tabIconSize} color={focused ? activeColor : inactiveColor} />
              <View style={[
                styles.badge,
                {
                  height: badgeMinSize,
                  borderRadius: badgeMinSize / 2,
                  minWidth: badgeMinSize,
                  paddingHorizontal: badgePaddingH,
                  top: badgeTopOffset,
                  right: badgeRightOffset,
                }
              ]}>
                <Text style={[styles.badgeText, { fontSize: badgeFontSize, lineHeight: badgeFontSize }]}>13</Text>
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="story"
        options={{
          title: 'Story',
          tabBarIcon: ({ color, focused }) => (
            <StoryTabIcon size={tabIconSize} color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
          tabBarIcon: ({ color, focused }) => (
            <ProfileTabIcon size={tabIconSize} color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="filter"
        options={{
          href: null, // Hide from tab bar
          tabBarStyle: {
            display: 'none',
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    overflow: 'visible', // Allow badge to extend beyond container
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10, // Ensure badge is above other elements
    // height, borderRadius, minWidth, paddingHorizontal, top, and right set dynamically
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'system-ui',
    // fontSize and lineHeight set dynamically
  },
});
