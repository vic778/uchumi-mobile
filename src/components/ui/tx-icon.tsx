import { StyleSheet, View } from 'react-native';
import { ArrowDownToLine, ArrowUpFromLine, CreditCard, Lock, LockOpen } from 'lucide-react-native';
import { Colors } from '@/constants';

type TxKind = 'deposit' | 'withdrawal' | 'loan_credit' | 'transfer_to_blocked' | 'transfer_from_blocked';

const BG: Record<TxKind, string> = {
  deposit:               '#e8f5e9',
  withdrawal:            '#fef3e2',
  loan_credit:           '#e8f4f8',
  transfer_to_blocked:   '#f3f0ff',
  transfer_from_blocked: '#f0fdf4',
};

const STROKE: Record<TxKind, string> = {
  deposit:               Colors.growth,
  withdrawal:            '#f59e0b',
  loan_credit:           Colors.primary,
  transfer_to_blocked:   '#7c3aed',
  transfer_from_blocked: Colors.growth,
};

function KindIcon({ kind, color }: { kind: TxKind; color: string }) {
  const props = { size: 20, color, strokeWidth: 1.8 } as const;
  if (kind === 'withdrawal')           return <ArrowUpFromLine {...props} />;
  if (kind === 'loan_credit')          return <CreditCard      {...props} />;
  if (kind === 'transfer_to_blocked')  return <Lock            {...props} />;
  if (kind === 'transfer_from_blocked')return <LockOpen        {...props} />;
  return <ArrowDownToLine {...props} />;
}

export function TxIcon({ kind }: { kind: string }) {
  const k = (Object.keys(BG).includes(kind) ? kind : 'deposit') as TxKind;
  return (
    <View style={[styles.box, { backgroundColor: BG[k] }]}>
      <KindIcon kind={k} color={STROKE[k]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
