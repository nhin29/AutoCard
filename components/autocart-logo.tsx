import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

/**
 * AutoCart Logo Component
 * 
 * Recreates the logo design with:
 * - Car outline (dark green)
 * - Rectangular shape with rounded corners (white fill, green outline)
 * - Magnifying glass icon (black)
 * - Blue license plate element
 * - White headlight with green outline
 * - Drop shadows for depth (using multiple paths)
 */
export function AutoCartLogo({ width = 200, height = 150 }: { width?: number; height?: number }) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 200 150">
        {/* Car Outline Shadow */}
        <Path
          d="M 32 82 L 32 62 L 42 52 L 62 47 L 82 47 L 102 52 L 112 62 L 112 82 L 107 87 L 107 97 L 102 102 L 82 102 L 72 97 L 52 97 L 42 102 L 32 97 L 32 87 Z"
          fill="rgba(0, 0, 0, 0.15)"
        />
        
        {/* Car Outline - Main body */}
        <Path
          d="M 30 80 L 30 60 L 40 50 L 60 45 L 80 45 L 100 50 L 110 60 L 110 80 L 105 85 L 105 95 L 100 100 L 80 100 L 70 95 L 50 95 L 40 100 L 30 95 L 30 85 Z"
          fill="none"
          stroke="#2E7D32"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Car windshield/window */}
        <Path
          d="M 50 50 L 50 60 L 70 60 L 80 55 L 100 50"
          fill="none"
          stroke="#2E7D32"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Headlight - Outer circle (white with green border) */}
        <Circle cx="110" cy="60" r="8" fill="#FFFFFF" stroke="#2E7D32" strokeWidth="2" />
        {/* Headlight - Inner dot */}
        <Circle cx="110" cy="60" r="3" fill="#000000" />

        {/* License Plate (Blue Rectangle) - positioned below windshield */}
        <Rect x="65" y="90" width="20" height="8" rx="1" fill="#2196F3" />

        {/* Rectangular Shape Shadow */}
        <Rect
          x="117"
          y="52"
          width="60"
          height="50"
          rx="8"
          fill="rgba(0, 0, 0, 0.15)"
        />

        {/* Rectangular Shape with Rounded Corners (White Fill, Green Outline) */}
        <Rect
          x="115"
          y="50"
          width="60"
          height="50"
          rx="8"
          fill="#FFFFFF"
          stroke="#2E7D32"
          strokeWidth="3"
        />

        {/* Magnifying Glass Icon - centered in rectangle */}
        <G>
          {/* Circle (lens) */}
          <Circle cx="145" cy="75" r="12" fill="none" stroke="#000000" strokeWidth="2.5" />
          {/* Handle - extends down and right */}
          <Path
            d="M 153 83 L 163 93"
            stroke="#000000"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
