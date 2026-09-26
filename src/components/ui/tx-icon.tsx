import { StyleSheet, View } from 'react-native';
import { ArrowDownToLine, ArrowUpFromLine, CreditCard, Lock, LockOpen } from 'lucide-react-native';
import { Colors } from '@/constants';

type TxKind = 'deposit' | 'withdrawal' | 'loan_credit' | 'transfer_to_blocked' | 'transfer_from_blocked';

const CONFIG: Record<TxKind, { bg: string; stroke: string; Icon: React.FC<{ color: string }> }> = {
  deposit:              { bg: '#e8f5e9', stroke: Colors.growth,  Icon: ({ color }) => <ArrowDownToLine size={20} color={color} strokeWidth={1.8} /> },
  withdrawal:           { bg: '#fef3e2', stroke: '#f59e0b',      Icon: ({ color }) => <ArrowUpFromLine size={20} color={color} strokeWidth={1.8} /> },
  loan_credit:          { bg: '#e8f4f8', stroke: Colors.primary, Icon: ({ color }) => <CreditCard      size={20} color={color} strokeWidth={1.8} /> },
  transfer_to_blocked:  { bg: '#f3f0ff', stroke: '#7c3aed',      Icon: ({ color }) => <Lock            size={20} color={color} strokeWidth={1.8} /> },
  transfer_from_blocked:{ bg: '#f0fdf4', stroke: Colors.growth,  Icon: ({ color }) => <LockOpen        size={20} color={color} strokeWidth={1.8} /> },
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
