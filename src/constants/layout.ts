import { Dimensions } from 'react-native';
import { Spacing } from './spacing';

export const APP_SCALE = 0.92;
export const Layout = {
  inputHeight:        48,
  buttonHeight:       56,
  iconSize:           24,
  backHeaderHeight:   100,
  keyboardExtraHeight: 220,
  keyboardSpacer:     280,
} as const;

export const Radii = {
  button: 8,
  input:  8,
  pill:   16,
  circle: 20,
  avatar: 24,
} as const;

const { height: windowHeight } = Dimensions.get('window');

export function tabBarBottomPad(insetBottom: number, height: number): number {
  const base = height > 800 ? 24 : 16;
  return insetBottom > 0 ? insetBottom + 8 : base;
}

export function ctaBottomPad(insetBottom: number): number {
  return insetBottom > 0 ? insetBottom + Spacing.three : Spacing.five;
}

export function confirmBottomPad(insetBottom: number): number {
  return insetBottom > 0 ? insetBottom + Spacing.two : Spacing.four;
}
