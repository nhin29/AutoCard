/**
 * Figma Design Specifications
 * 
 * This file contains the design specs extracted from Figma.
 * Update this file after running: node scripts/fetch-figma-design.js
 * 
 * Figma Design URL:
 * https://www.figma.com/design/Q5IhAuBOfjRsqYZzhiCS4E/AutoCart-%7C-Ben--Copy-?node-id=7952-78560
 */

export interface FigmaDesignSpecs {
  backgroundColor: string;
  logo: {
    width: number;
    height: number;
    source: any; // Image source
  };
  spacing: {
    containerPadding: number;
    logoBottomMargin: number;
    loaderTopMargin: number;
  };
  colors: {
    primary: string;
    loader: string;
    text?: string;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
  };
}

/**
 * Design specs based on the actual Figma design
 * 
 * Design URL: https://www.figma.com/design/Q5IhAuBOfjRsqYZzhiCS4E/AutoCart-%7C-Ben--Copy-?node-id=7952-78560
 */
export const SPLASH_SCREEN_SPECS: FigmaDesignSpecs = {
  backgroundColor: '#FFFFFF',
  logo: {
    width: 200,
    height: 150,
    source: null, // Using SVG component instead
  },
  spacing: {
    containerPadding: 20,
    logoBottomMargin: 16,
    loaderTopMargin: 0, // No loader in design
  },
  colors: {
    primary: '#2E7D32', // Dark green (car outline, "Auto" part of gradient)
    loader: '#4CAF50', // Lighter green ("Cart," part of gradient)
    text: '#616161', // Tagline color
  },
  typography: {
    fontFamily: 'system-ui',
    fontSize: 44,
    fontWeight: '700',
  },
};

/**
 * Helper function to convert Figma color to React Native color
 */
export function figmaColorToRNColor(figmaColor: {
  r: number;
  g: number;
  b: number;
  a?: number;
}): string {
  const r = Math.round(figmaColor.r * 255);
  const g = Math.round(figmaColor.g * 255);
  const b = Math.round(figmaColor.b * 255);
  const a = figmaColor.a !== undefined ? figmaColor.a : 1;

  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Helper function to convert Figma dimensions (points) to React Native pixels
 * Figma uses points, React Native uses density-independent pixels (dp)
 */
export function figmaDimensionToRN(figmaValue: number): number {
  // For most cases, 1 Figma point = 1 React Native dp
  // Adjust if needed based on design scale
  return figmaValue;
}
