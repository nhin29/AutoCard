import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import {
    HomeTabIcon,
    MessageTabIcon,
    ProfileTabIcon,
    ScanTabIcon,
    SearchTabIcon,
    StoryTabIcon,
} from '@/components/icons/TabIcons';

export default function TabLayout() {
  const activeColor = '#4CAF50';
  const inactiveColor = '#374151';

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
          height: Platform.OS === 'ios' ? 70 : 58,
          paddingBottom: Platform.OS === 'ios' ? 10 : 4,
          paddingTop: 6,
          marginBottom: Platform.OS === 'ios' ? 8 : 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          fontFamily: 'system-ui',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <HomeTabIcon size={24} color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <SearchTabIcon size={24} color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <ScanTabIcon size={24} color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Message',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <MessageTabIcon size={24} color={focused ? activeColor : inactiveColor} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>13</Text>
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
            <StoryTabIcon size={24} color={focused ? activeColor : inactiveColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
          tabBarIcon: ({ color, focused }) => (
            <ProfileTabIcon size={24} color={focused ? activeColor : inactiveColor} />
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
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'system-ui',
  },
});
