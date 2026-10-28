import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TxIcon } from './tx-icon';
import { Colors, Fonts, Spacing } from '@/constants';

export type TxDetailData = {
  id?: number;
  reference?: string;
  kind: string;
  amount: number;
  status?: string;
  member?: string;
  member_phone?: string;
  collector?: string;
  approved_by?: string;
  note?: string;
  created_at: string;
};

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD');

const KIND_LABEL: Record<string, string> = {
  deposit:               'Dépôt',
  withdrawal:            'Retrait',
  loan_credit:           'Décaissement prêt',
  transfer_to_blocked:   'Transfert épargne bloquée',
  transfer_from_blocked: 'Retour épargne bloquée',
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente',  color: Colors.warning },
  approved:  { label: 'Approuvé',    color: Colors.primary },
  completed: { label: 'Complété',    color: Colors.growth  },
  rejected:  { label: 'Rejeté',      color: Colors.danger  },
};

type Props = {
  tx: TxDetailData | null;
  onClose: () => void;
};

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

export function TxDetailModal({ tx, onClose }: Props) {
  if (!tx) return null;

  const isCredit  = tx.kind === 'deposit' || tx.kind === 'loan_credit' || tx.kind === 'transfer_from_blocked';
  const statusMeta = tx.status ? (STATUS_LABEL[tx.status] ?? { label: tx.status, color: Colors.steelGray }) : null;
  const fullDate = new Date(tx.created_at).toLocaleDateString('fr-CD', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
  const time = new Date(tx.created_at).toLocaleTimeString('fr-CD', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <Modal transparent animationType="slide" visible={!!tx} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <TxIcon kind={tx.kind} />
          <View style={{ flex: 1 }}>
            <Text style={styles.kindLabel}>{KIND_LABEL[tx.kind] ?? tx.kind}</Text>
            {tx.reference && <Text style={styles.reference}>{tx.reference}</Text>}
          </View>
          {statusMeta && (
            <View style={[styles.statusBadge, { backgroundColor: statusMeta.color + '22' }]}>
              <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
            </View>
          )}
        </View>

        {/* Amount */}
        <View style={styles.amountBlock}>
          <Text style={[styles.amountValue, { color: isCredit ? Colors.growth : Colors.charcoal }]}>
            {isCredit ? '+' : '-'} {fmt(tx.amount)} {CURRENCY}
          </Text>
          <Text style={styles.amountDate}>{fullDate} à {time}</Text>
        </View>

        <View style={styles.divider} />

        {/* Details */}
        <ScrollView contentContainerStyle={styles.details}>
          {tx.member      && <Row label="Membre"      value={tx.member} />}
          {tx.member_phone && <Row label="Téléphone"  value={tx.member_phone} />}
          {tx.collector   && <Row label="Collecteur"  value={tx.collector} />}
          {tx.approved_by && <Row label="Approuvé par" value={tx.approved_by} />}
          {tx.note        && <Row label="Note"        value={tx.note} />}
        </ScrollView>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
          <Text style={styles.closeBtnText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four + 10,
    maxHeight: '80%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.coolGray, alignSelf: 'center', marginBottom: Spacing.three },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginBottom: Spacing.two },
  kindLabel:   { fontFamily: Fonts.bold, fontSize: 17, color: Colors.charcoal },
  reference:   { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray, marginTop: 2 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:  { fontFamily: Fonts.bold, fontSize: 11, textTransform: 'uppercase' },

  amountBlock: { alignItems: 'center', paddingVertical: Spacing.three },
  amountValue: { fontFamily: Fonts.bold, fontSize: 28 },
  amountDate:  { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray, marginTop: 4, textTransform: 'capitalize' },

  divider: { height: 1, backgroundColor: Colors.coolGray, marginBottom: Spacing.three },

  details: { gap: Spacing.two, paddingBottom: Spacing.two },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.three },
  rowLabel: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, flex: 1 },
  rowValue: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal, flex: 2, textAlign: 'right' },

  closeBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.three },
  closeBtnText: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },
});
