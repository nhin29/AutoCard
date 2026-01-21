import Svg, { Path } from 'react-native-svg';

interface AlertIconProps {
  width?: number;
  height?: number;
  color?: string;
}

/**
 * Alert Icon Component
 * 
 * Renders the alert/bell icon from assets/icons/alert.svg
 */
export function AlertIcon({ width = 21, height = 22, color = '#991B1B' }: AlertIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 21 22" fill="none">
      <Path
        d="M7.25098 19.75C8.04698 20.372 9.09898 20.75 10.251 20.75C11.403 20.75 12.455 20.372 13.251 19.75M0.780982 13.144C0.567982 14.497 1.51898 15.436 2.68298 15.904C7.14598 17.699 13.356 17.699 17.819 15.904C18.983 15.436 19.934 14.497 19.721 13.144C19.591 12.312 18.944 11.62 18.465 10.944C17.838 10.047 17.776 9.07 17.775 8.029C17.776 4.01 14.408 0.75 10.251 0.75C6.09398 0.75 2.72598 4.01 2.72598 8.03C2.72598 9.07 2.66398 10.048 2.03598 10.944C1.55798 11.62 0.911982 12.312 0.780982 13.144Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
