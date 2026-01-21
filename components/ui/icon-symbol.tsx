// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Record<string, MaterialIconName> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.up': 'keyboard-arrow-up',
  'arrow.up': 'arrow-upward',
  'rocket.fill': 'rocket-launch',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'building.fill': 'business',
  'checkmark.circle.fill': 'check-circle',
  'checkmark': 'check',
  'arrow.clockwise': 'refresh',
  'creditcard.fill': 'credit-card',
  'shield.checkmark': 'verified-user',
  'megaphone.fill': 'campaign',
  // Image picker icons
  'camera.fill': 'camera',
  'photo': 'photo-library',
  'photo.fill': 'photo-library',
  'folder': 'folder',
  'folder.fill': 'folder',
  'crop': 'crop',
  // Navigation icons
  'magnifyingglass': 'search',
  'qrcode.viewfinder': 'qr-code-scanner',
  'message.fill': 'message',
  'camera.fill.circle': 'videocam',
  'person.fill': 'person',
  'slider.horizontal.3': 'tune',
  'pencil': 'edit',
  'trash.fill': 'delete',
  'trash': 'delete',
  'xmark.circle.fill': 'cancel',
  'xmark': 'close',
  'star.fill': 'star',
  'square.and.arrow.up': 'share',
  'share': 'share',
  'play.circle.fill': 'play-circle-filled',
  // Ad card icons
  'plus': 'add',
  'flame.fill': 'local-fire-department',
  'location.fill': 'location-on',
  'location': 'place',
  'heart.fill': 'favorite',
  'heart': 'favorite-border',
  'phone.fill': 'phone',
  'phone': 'phone',
  'bell.fill': 'notifications',
  'bell': 'notifications-none',
  'eye': 'remove-red-eye',
  // Preview page icons
  'calendar': 'calendar-today',
  'speed': 'speed',
  'local-gas-station': 'local-gas-station',
  'settings': 'settings',
  'line.3.horizontal': 'menu',
  'photo.on.rectangle': 'photo-library',
  // Location icons
  'mappin': 'place',
  'mappin.circle.fill': 'place',
  // Verification icons
  'checkmark.seal.fill': 'verified-user',
  // Play icons
  'play.fill': 'play-arrow',
  // Arrow icons
  'arrow.down': 'keyboard-arrow-down',
  'arrow.right': 'arrow-forward',
  'rectangle.portrait.and.arrow.right': 'exit-to-app',
};

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] || 'help-outline';
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
