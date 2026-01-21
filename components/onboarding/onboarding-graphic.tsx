import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect, Circle, Line, G } from 'react-native-svg';

/**
 * Onboarding Graphic Component
 * 
 * Displays:
 * - Background gray car (right side)
 * - Dark blue smartphone in center with green car and scanning reticle
 * - Foreground gray car (left side, partially visible)
 * - Dashed road line
 */
export function OnboardingGraphic({ width = 300, height = 250 }: { width?: number; height?: number }) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 300 250">
        {/* Dashed Road Line */}
        <Line
          x1="0"
          y1="200"
          x2="300"
          y2="200"
          stroke="#D0D0D0"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Background Car (Gray SUV, right side) */}
        <G>
          {/* Car body - simplified SUV shape */}
          <Path
            d="M 190 160 L 190 140 L 200 130 L 220 125 L 240 125 L 260 130 L 270 140 L 270 160 L 265 165 L 265 175 L 260 180 L 240 180 L 230 175 L 210 175 L 200 180 L 190 175 L 190 165 Z"
            fill="#E8E8E8"
            stroke="#D0D0D0"
            strokeWidth="1.5"
          />
          {/* Roof/windows - white */}
          <Path
            d="M 210 130 L 210 140 L 230 140 L 250 135 L 260 140 L 260 150"
            fill="#FFFFFF"
            stroke="#D0D0D0"
            strokeWidth="1"
          />
          {/* Rear window */}
          <Path
            d="M 200 130 L 200 140 L 210 140"
            fill="#F5F5F5"
            stroke="#D0D0D0"
            strokeWidth="1"
          />
          {/* Taillight - red */}
          <Circle cx="190" cy="155" r="5" fill="#FF0000" />
        </G>

        {/* Foreground Car (Gray, left side, partially visible) */}
        <G>
          {/* Front portion of car */}
          <Path
            d="M 10 160 L 10 140 L 20 130 L 40 125 L 60 125 L 80 130 L 90 140 L 90 160 L 85 165 L 85 175 L 80 180 L 60 180 L 50 175 L 30 175 L 20 180 L 10 175 L 10 165 Z"
            fill="#E8E8E8"
            stroke="#D0D0D0"
            strokeWidth="1.5"
          />
          {/* Roof - white */}
          <Path
            d="M 30 130 L 30 140 L 50 140 L 70 135 L 80 140 L 80 150"
            fill="#FFFFFF"
            stroke="#D0D0D0"
            strokeWidth="1"
          />
          {/* Headlights - white circles */}
          <Circle cx="90" cy="150" r="4" fill="#FFFFFF" />
          <Circle cx="90" cy="155" r="4" fill="#FFFFFF" />
          {/* Bumper detail */}
          <Path
            d="M 85 160 L 85 165"
            stroke="#A0A0A0"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </G>

        {/* Smartphone (Dark Blue) */}
        <G>
          {/* Phone body */}
          <Rect
            x="110"
            y="80"
            width="80"
            height="140"
            rx="8"
            fill="#1E3A5F"
            stroke="#0F1F35"
            strokeWidth="2"
          />
          
          {/* Phone screen (white) */}
          <Rect
            x="115"
            y="90"
            width="70"
            height="120"
            rx="4"
            fill="#FFFFFF"
          />

          {/* Green Car inside phone */}
          <G>
            <Path
              d="M 130 140 L 130 120 L 140 110 L 160 105 L 180 105 L 200 110 L 210 120 L 210 140 L 205 145 L 205 155 L 200 160 L 180 160 L 170 155 L 150 155 L 140 160 L 130 155 L 130 145 Z"
              fill="#4CAF50"
              stroke="#2E7D32"
              strokeWidth="2"
            />
            {/* Car roof/windows - white */}
            <Path
              d="M 150 110 L 150 120 L 170 120 L 190 115 L 200 120 L 200 130"
              fill="#FFFFFF"
              stroke="#2E7D32"
              strokeWidth="1"
            />
          </G>

          {/* Scanning Reticle (4 L-shaped corners) */}
          <G>
            {/* Top-left corner */}
            <Path
              d="M 125 110 L 125 120 L 135 120"
              stroke="#4CAF50"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Top-right corner */}
            <Path
              d="M 175 110 L 175 120 L 165 120"
              stroke="#4CAF50"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Bottom-left corner */}
            <Path
              d="M 125 190 L 125 180 L 135 180"
              stroke="#4CAF50"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Bottom-right corner */}
            <Path
              d="M 175 190 L 175 180 L 165 180"
              stroke="#4CAF50"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </G>

          {/* Progress dots below car (green dots) */}
          {Array.from({ length: 12 }).map((_, i) => (
            <Circle
              key={i}
              cx={120 + i * 5}
              cy={195}
              r="2"
              fill="#4CAF50"
            />
          ))}
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
