import { Platform, StyleProp, ViewStyle } from 'react-native';

interface ShadowOptions {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  blur?: number;
  opacity?: number;
}

function parseHexToRgb(color: string): [number, number, number] {
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
  }
  return [0, 0, 0];
}

export function createShadow({
  color = '#000000',
  offsetX = 0,
  offsetY = 4,
  blur = 8,
  opacity = 0.08,
}: ShadowOptions = {}): StyleProp<ViewStyle> {
  const [r, g, b] = parseHexToRgb(color);

  return Platform.select({
    web: { boxShadow: `${offsetX}px ${offsetY}px ${blur}px rgba(${r}, ${g}, ${b}, ${opacity})` },
    default: {
      shadowColor: color,
      shadowOffset: { width: offsetX, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
  });
}

export const shadows = {
  xs:  createShadow({ offsetY: 2, blur: 4,  opacity: 0.02 }),
  sm:  createShadow({ offsetY: 2, blur: 4,  opacity: 0.03 }),
  md:  createShadow({ offsetY: 4, blur: 8,  opacity: 0.05 }),
  lg:  createShadow({ offsetY: 4, blur: 10, opacity: 0.08 }),
  xl:  createShadow({ offsetY: 4, blur: 8,  opacity: 0.12 }),
  xxl: createShadow({ offsetY: 8, blur: 20, opacity: 0.15 }),
  colored: (hex: string, opacity = 0.25) =>
    createShadow({ color: hex, offsetY: 4, blur: 8, opacity }),
};
