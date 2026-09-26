import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants';

type TxKind = 'deposit' | 'withdrawal' | 'loan_credit' | 'transfer_to_blocked' | 'transfer_from_blocked';

const CONFIG: Record<TxKind, { bg: string; stroke: string; Icon: React.FC<{ color: string }> }> = {
  deposit: {
    bg: '#e8f5e9',
    stroke: Colors.growth,
    Icon: ({ color }) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M12 3V15M12 15L7 10M12 15L17 10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M3 21H21" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    ),
  },
  withdrawal: {
    bg: '#fef3e2',
    stroke: '#f59e0b',
    Icon: ({ color }) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M12 21V9M12 9L7 14M12 9L17 14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M3 3H21" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    ),
  },
  loan_credit: {
    bg: '#e8f4f8',
    stroke: Colors.primary,
    Icon: ({ color }) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M21 4H3C1.9 4 3 5 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 5 22.1 4 21 4Z"
          stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M1 10H23" stroke={color} strokeWidth={1.8} />
        <Path d="M7 15H10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    ),
  },
  transfer_to_blocked: {
    bg: '#f3f0ff',
    stroke: '#7c3aed',
    Icon: ({ color }) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M8 7H3M3 7L6 4M3 7L6 10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M16 17H21M21 17L18 14M21 17L18 20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M3 17H10M14 7H21" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    ),
  },
  transfer_from_blocked: {
    bg: '#f0fdf4',
    stroke: Colors.growth,
    Icon: ({ color }) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M16 7H21M21 7L18 4M21 7L18 10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8 17H3M3 17L6 14M3 17L6 20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M21 17H14M10 7H3" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    ),
  },
};

const FALLBACK = CONFIG.deposit;

export function TxIcon({ kind }: { kind: string }) {
  const cfg = CONFIG[kind as TxKind] ?? FALLBACK;
  return (
    <View style={[styles.box, { backgroundColor: cfg.bg }]}>
      <cfg.Icon color={cfg.stroke} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
