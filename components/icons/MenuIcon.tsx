import Svg, { Path } from 'react-native-svg';

interface MenuIconProps {
  width?: number;
  height?: number;
  color?: string;
}

/**
 * Menu Icon Component
 * 
 * Three horizontal lines of different lengths (hamburger menu style)
 */
export function MenuIcon({ width = 19, height = 17, color = '#1F2937' }: MenuIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 19 17" fill="none">
      <Path
        d="M1.125 1.125L13.125 1.125M1.125 8.125L17.125 8.125M1.125 15.125L9.125 15.125"
        stroke={color}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
