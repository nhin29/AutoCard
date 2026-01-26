/**
 * SafeAreaView Wrapper Component
 * 
 * Provides safe area insets for content that needs to avoid system UI.
 * Use this instead of React Native's SafeAreaView for consistent behavior.
 * 
 * @example
 * <SafeAreaView edges={['top', 'bottom']}>
 *   <YourContent />
 * </SafeAreaView>
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useSafeAreaInsets, Edge } from 'react-native-safe-area-context';

interface SafeAreaViewProps {
  children: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
  backgroundColor?: string;
}

/**
 * SafeAreaView component that applies safe area insets
 * 
 * @param edges - Which edges to apply safe area insets to (default: ['top', 'bottom'])
 * @param style - Additional styles to apply
 * @param backgroundColor - Background color (useful for status bar area)
 */
export function SafeAreaView({ 
  children, 
  edges = ['top', 'bottom'],
  style,
  backgroundColor 
}: SafeAreaViewProps) {
  const insets = useSafeAreaInsets();
  
  const safeAreaStyle: ViewStyle = {};
  
  if (edges.includes('top')) {
    safeAreaStyle.paddingTop = insets.top;
  }
  if (edges.includes('bottom')) {
    safeAreaStyle.paddingBottom = insets.bottom;
  }
  if (edges.includes('left')) {
    safeAreaStyle.paddingLeft = insets.left;
  }
  if (edges.includes('right')) {
    safeAreaStyle.paddingRight = insets.right;
  }
  
  if (backgroundColor) {
    safeAreaStyle.backgroundColor = backgroundColor;
  }
  
  return (
    <View style={[safeAreaStyle, style]}>
      {children}
    </View>
  );
}
