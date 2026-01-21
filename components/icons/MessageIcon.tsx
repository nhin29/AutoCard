import Svg, { Path } from 'react-native-svg';

interface MessageIconProps {
  width?: number;
  height?: number;
  color?: string;
}

/**
 * Message Icon Component
 * 
 * Renders the message icon from assets/icons/mesasge.svg
 */
export function MessageIcon({ width = 20, height = 19, color = '#115E59' }: MessageIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 19" fill="none">
      <Path
        d="M5.75 5.75H13.75M5.75 9.75H11.75M15.75 0.75C16.5456 0.75 17.3087 1.06607 17.8713 1.62868C18.4339 2.19129 18.75 2.95435 18.75 3.75V11.75C18.75 12.5456 18.4339 13.3087 17.8713 13.8713C17.3087 14.4339 16.5456 14.75 15.75 14.75H10.75L5.75 17.75V14.75H3.75C2.95435 14.75 2.19129 14.4339 1.62868 13.8713C1.06607 13.3087 0.75 12.5456 0.75 11.75V3.75C0.75 2.95435 1.06607 2.19129 1.62868 1.62868C2.19129 1.06607 2.95435 0.75 3.75 0.75H15.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
