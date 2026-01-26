/**
 * Responsive Design Utilities
 * 
 * Provides hooks and utilities for responsive layouts that work across
 * all device sizes, orientations, and accessibility settings.
 */

import { PixelRatio, useWindowDimensions } from 'react-native';

/**
 * Screen size breakpoints
 */
export const BREAKPOINTS = {
  small: 360,   // Small phones (iPhone SE, small Android)
  medium: 414,  // Standard phones (iPhone 11, most Android)
  large: 768,   // Tablets (iPad, large Android tablets)
} as const;

/**
 * Reference width for scale calculations
 * Using 390px as base (common iPhone 12/13/14 width)
 */
const REFERENCE_WIDTH = 390;

/**
 * Responsive spacing scale
 * Use these instead of fixed pixel values
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

/**
 * Responsive font scale
 * Base sizes that scale with system font size settings
 */
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
} as const;

/**
 * Container max widths for different screen sizes
 * Prevents content from stretching too wide on tablets
 */
export const CONTAINER_MAX_WIDTH = {
  small: '100%',
  medium: 600,
  large: 800,
} as const;

/**
 * Hook to get responsive screen dimensions
 * Updates on rotation and window size changes
 * 
 * Uses scale factor approach for more accurate sizing across devices.
 * Scale factor is calculated relative to a reference width (390px).
 * 
 * @example
 * const { width, height, isSmall, isMedium, isLarge, scaleFactor } = useResponsive();
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const pixelRatio = PixelRatio.get();
  
  // Calculate scale factor based on width relative to reference width
  // This ensures large phones get appropriately sized UI elements
  // Clamp scale factor between 0.85 and 1.3 to prevent extreme scaling
  const rawScaleFactor = width / REFERENCE_WIDTH;
  const scaleFactor = Math.max(0.85, Math.min(1.3, rawScaleFactor));
  
  // Improved breakpoint logic based on common phone sizes (2024-2025):
  // - Small: <= 375px (iPhone SE, Samsung S24 - small phones)
  // - Medium: 375-430px (iPhone 16, S24+, S24 Ultra, Pixel 8 - standard to large phones)
  // - Large: >= 768px (tablets)
  // Note: Scale factor is used for sizing, not breakpoints, ensuring proper scaling
  // for all devices including large phones (430-440px) which get 1.10-1.13 scale
  const isSmall = width <= 375;
  const isMedium = width > 375 && width < BREAKPOINTS.large;
  const isLarge = width >= BREAKPOINTS.large;
  
  return {
    width,
    height,
    isSmall,
    isMedium,
    isLarge,
    isTablet: isLarge,
    isPhone: !isLarge,
    scaleFactor,
    pixelRatio,
  };
}

/**
 * Hook to get responsive container styles
 * Applies maxWidth for tablets, full width for phones
 * 
 * @example
 * const containerStyle = useContainerStyle();
 * <View style={[styles.content, containerStyle]}>
 */
export function useContainerStyle() {
  const { isLarge } = useResponsive();
  
  return {
    width: '100%',
    maxWidth: isLarge ? CONTAINER_MAX_WIDTH.large : CONTAINER_MAX_WIDTH.medium,
    alignSelf: 'center' as const,
  };
}

/**
 * Calculate responsive grid item size
 * 
 * @param columns - Number of columns in grid
 * @param padding - Horizontal padding (default: SPACING.base)
 * @param gap - Gap between items (default: SPACING.sm)
 * @returns Width for each grid item
 * 
 * @example
 * const itemWidth = useGridItemSize(3); // 3-column grid
 */
export function useGridItemSize(
  columns: number,
  padding: number = SPACING.base,
  gap: number = SPACING.sm
): number {
  const { width } = useWindowDimensions();
  const availableWidth = width - (padding * 2);
  const totalGaps = gap * (columns - 1);
  return (availableWidth - totalGaps) / columns;
}

/**
 * Get responsive padding based on screen size
 * 
 * @param base - Base padding value
 * @param multiplier - Multiplier for larger screens (default: 1.5)
 */
export function useResponsivePadding(
  base: number = SPACING.base,
  multiplier: number = 1.5
): number {
  const { isLarge } = useResponsive();
  return isLarge ? base * multiplier : base;
}

/**
 * Get responsive font size
 * Scales with system font size settings
 * 
 * @param baseSize - Base font size
 * @param maxMultiplier - Maximum scale multiplier (default: 1.3)
 */
export function getResponsiveFontSize(
  baseSize: number,
  maxMultiplier: number = 1.3
): { fontSize: number; maxFontSizeMultiplier: number } {
  return {
    fontSize: baseSize,
    maxFontSizeMultiplier: maxMultiplier,
  };
}

/**
 * Calculate aspect ratio size
 * Maintains aspect ratio while fitting within bounds
 * 
 * @param width - Desired width
 * @param aspectRatio - Width/Height ratio (e.g., 16/9)
 * @param maxWidth - Maximum width constraint
 * @param maxHeight - Maximum height constraint
 */
export function useAspectRatioSize(
  width: number,
  aspectRatio: number,
  maxWidth?: number,
  maxHeight?: number
): { width: number; height: number } {
  const { width: screenWidth } = useWindowDimensions();
  
  let calculatedWidth = width;
  if (maxWidth) {
    calculatedWidth = Math.min(calculatedWidth, maxWidth);
  }
  calculatedWidth = Math.min(calculatedWidth, screenWidth);
  
  let calculatedHeight = calculatedWidth / aspectRatio;
  if (maxHeight) {
    calculatedHeight = Math.min(calculatedHeight, maxHeight);
  }
  
  return {
    width: calculatedWidth,
    height: calculatedHeight,
  };
}

/**
 * Responsive icon size
 * Scales icons appropriately for screen size using scale factor
 */
export function useIconSize(baseSize: number = 24): number {
  const { scaleFactor, isLarge } = useResponsive();
  
  // Use scale factor for phones, slightly larger for tablets
  if (isLarge) {
    return baseSize * 1.15; // Tablets get larger icons
  }
  
  // Scale based on actual screen width relative to reference
  return Math.round(baseSize * scaleFactor);
}

/**
 * Get scaled size based on screen width
 * This is the recommended way to scale UI elements proportionally
 * 
 * @param baseSize - Base size at reference width (390px)
 * @param minSize - Optional minimum size (default: baseSize * 0.85)
 * @param maxSize - Optional maximum size (default: baseSize * 1.3)
 * @returns Scaled size appropriate for current device
 * 
 * @example
 * const iconSize = useScaledSize(24); // Scales from 24px base
 * const fontSize = useScaledSize(16, 14, 20); // Font between 14-20px
 */
export function useScaledSize(
  baseSize: number,
  minSize?: number,
  maxSize?: number
): number {
  const { scaleFactor } = useResponsive();
  
  const calculatedSize = baseSize * scaleFactor;
  const min = minSize ?? baseSize * 0.85;
  const max = maxSize ?? baseSize * 1.3;
  
  return Math.round(Math.max(min, Math.min(max, calculatedSize)));
}

/**
 * Check if device is in landscape orientation
 */
export function useIsLandscape(): boolean {
  const { width, height } = useWindowDimensions();
  return width > height;
}
