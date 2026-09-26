export const Colors = {
  charcoal:  '#212121',
  steelGray: '#808080',
  coolGray:  '#EAEAEA',
  iconMuted: '#B0B0B0',
  grey:      '#868686',
  green:     '#B4DE00',
  growth:    '#00AE2C',
  danger:    '#FF6F61',
  softGray:  '#D0D0D0',
  surface:   '#F8F9FA',
  white:     '#FFFFFF',
  muted:     '#DDDDDD',
  navy:      '#2C3E50',
} as const;

export type ColorName = keyof typeof Colors;
