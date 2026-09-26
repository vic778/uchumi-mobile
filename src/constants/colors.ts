export const Colors = {
  // Primary
  primary:      '#005f78',
  primaryDark:  '#004d61',
  primaryLight: '#0083a4',
  cardBlue:     '#007b9e',

  // Accent
  green:        '#6cc000',
  greenDark:    '#5aa000',

  // Neutrals
  charcoal:     '#1a202c',
  steelGray:    '#6c7a89',
  iconMuted:    '#9ca3af',
  grey:         '#868686',
  softGray:     '#d1d5db',
  coolGray:     '#e5e7eb',
  muted:        '#e5e7eb',
  navy:         '#2c3e50',

  // Surfaces
  surface:      '#ffffff',
  background:   '#f4f6f8',
  white:        '#ffffff',

  // Status
  growth:       '#22c55e',
  danger:       '#ef4444',
  warning:      '#f59e0b',
} as const;

export type ColorName = keyof typeof Colors;
