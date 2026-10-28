import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/back-button';
import { TxIcon } from '@/components/ui/tx-icon';
import { TxDetailModal, type TxDetailData } from '@/components/ui/tx-detail-modal';
import { Colors, Fonts, Spacing } from '@/constants';
import { getAdminTransactions, type AdminTransaction } from '@/services/admin';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;

const KIND_LABEL: Record<string, string> = {
  deposit:               'Dépôt',
  withdrawal:            'Retrait',
  loan_credit:           'Décaissement prêt',
  transfer_to_blocked:   'Transfert épargne bloquée',
  transfer_from_blocked: 'Retour épargne bloquée',
};

const KIND_FILTERS = [
  { label: 'Tous',    value: '' },
  { label: 'Crédits', value: 'credit' },
  { label: 'Débits',  value: 'debit' },
];

const PERIOD_FILTERS = [
  { label: 'Ce mois',        value: 'current_month' },
  { label: 'Mois précédent', value: 'previous_month' },
  { label: '3 mois',         value: 'last_3_months' },
  { label: 'Tout',           value: '' },
];

function toDetail(tx: AdminTransaction): TxDetailData {
  return {
    id:           tx.id,
    reference:    tx.reference,
    kind:         tx.kind,
    amount:       tx.amount,
    status:       tx.status,
    member:       tx.member,
    member_phone: tx.member_phone,
    collector:    tx.collector,
    approved_by:  tx.approved_by,
    note:         tx.note,
    created_at:   tx.created_at,
  };
}

export default function AdminTransactionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [kind, setKind]                 = useState('');
  const [period, setPeriod]             = useState('current_month');
  const [selected, setSelected]         = useState<TxDetailData | null>(null);

  useEffect(() => {
    setLoading(true);
    getAdminTransactions({ kind: kind || undefined, period: period || undefined })
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [kind, period]);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} light />
        <Text style={styles.headerTitle}>Transactions</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Filters */}
      <View style={styles.filtersWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {KIND_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value + 'k'}
              style={[styles.chip, kind === f.value && styles.chipActive]}
              onPress={() => setKind(f.value)}
              activeOpacity={0.75}>
              <Text style={[styles.chipLabel, kind === f.value && styles.chipLabelActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.chipDivider} />
          {PERIOD_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value + 'p'}
              style={[styles.chip, period === f.value && styles.chipActive]}
              onPress={() => setPeriod(f.value)}
              activeOpacity={0.75}>
              <Text style={[styles.chipLabel, period === f.value && styles.chipLabelActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(t) => String(t.id)}
          contentContainerStyle={{ paddingBottom: Spacing.four }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>Aucune transaction pour cette période</Text>}
          renderItem={({ item: tx }) => {
            const isCredit = tx.kind === 'deposit' || tx.kind === 'loan_credit' || tx.kind === 'transfer_from_blocked';
            const date = new Date(tx.created_at).toLocaleDateString('fr-CD', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            });
            return (
              <TouchableOpacity style={styles.txRow} onPress={() => setSelected(toDetail(tx))} activeOpacity={0.7}>
                <TxIcon kind={tx.kind} />
                <View style={styles.txMid}>
                  <Text style={styles.txTitle}>{KIND_LABEL[tx.kind] ?? tx.kind}</Text>
                  <Text style={styles.txMember} numberOfLines={1}>{tx.member ?? '—'}</Text>
                  <Text style={styles.txDate}>{date}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={[styles.txAmount, { color: isCredit ? Colors.growth : Colors.charcoal }]}>
                    {isCredit ? '+' : '-'} {fmt(tx.amount)}
                  </Text>
                  <Text style={[styles.txRef]}>{tx.reference}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TxDetailModal tx={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, flex: 1, textAlign: 'center' },

  filtersWrap: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.coolGray, flexGrow: 0 },
  filterRow:   { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, gap: Spacing.two, flexDirection: 'row', alignItems: 'center' },
  chip:        { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9' },
  chipActive:  { backgroundColor: Colors.primary },
  chipLabel:   { fontFamily: Fonts.medium, fontSize: 12, color: Colors.steelGray },
  chipLabelActive: { color: Colors.white, fontFamily: Fonts.semiBold },
  chipDivider: { width: 1, height: 20, backgroundColor: Colors.coolGray, marginHorizontal: Spacing.one },

  separator: { height: 1, backgroundColor: Colors.coolGray, marginLeft: Spacing.four + 46 + Spacing.three },
  txRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: Colors.white },
  txMid:   { flex: 1 },
  txTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },
  txMember:{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray, marginTop: 1 },
  txDate:  { fontFamily: Fonts.regular, fontSize: 11, color: Colors.iconMuted, marginTop: 1 },
  txRight: { alignItems: 'flex-end', gap: 3 },
  txAmount:{ fontFamily: Fonts.bold, fontSize: 14 },
  txRef:   { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray },

  empty: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.steelGray, textAlign: 'center', marginTop: 60 },
});
