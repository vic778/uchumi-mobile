import { Colors } from './colors';
import { Fonts } from './fonts';

export const Typography = {
  title: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    color: Colors.charcoal,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.steelGray,
  },
  label: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.steelGray,
  },
  button: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.charcoal,
  },
  buttonBold: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.white,
  },
  link: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.charcoal,
    textDecorationLine: 'underline' as const,
  },
} as const;
