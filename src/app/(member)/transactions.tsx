import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BackButton } from '@/components/ui/back-button';
import { TxIcon } from '@/components/ui/tx-icon';
import { Colors, Fonts, Spacing } from '@/constants';
import { getTransactions } from '@/services/member/account';
import type { Transaction } from '@/types';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;

const KIND_LABEL: Record<string, string> = {
  deposit:               'Dépôt reçu',
  withdrawal:            'Retrait effectué',
  loan_credit:           'Décaissement prêt',
  transfer_to_blocked:   'Transfert bloqué',
  transfer_from_blocked: 'Transfert débloqué',
};

const KIND_FILTERS = [
  { label: 'Tous',    value: '' },
  { label: 'Crédits', value: 'credit' },
  { label: 'Débits',  value: 'debit' },
];

const PERIOD_FILTERS = [
  { label: 'Ce mois',       value: 'current_month' },
  { label: 'Mois précédent', value: 'previous_month' },
  { label: '3 mois',        value: 'last_3_months' },
];

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [kind, setKind]                 = useState('');
  const [period, setPeriod]             = useState('current_month');

  useEffect(() => {
    setLoading(true);
    getTransactions({ kind: kind || undefined, period })
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [kind, period]);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Vos transactions</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filters */}
      <View style={styles.filtersWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {KIND_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.chip, kind === f.value && styles.chipActive]}
              onPress={() => setKind(f.value)}
              activeOpacity={0.75}>
              <Text style={[styles.chipLabel, kind === f.value && styles.chipLabelActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.chipDivider} />

          {PERIOD_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
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
          keyExtractor={t => String(t.id)}
          contentContainerStyle={{ paddingBottom: Spacing.four }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>Aucune transaction pour cette période</Text>}
          renderItem={({ item: tx }) => {
            const isCredit = tx.kind === 'deposit' || tx.kind === 'loan_credit';
            const date = new Date(tx.created_at).toLocaleDateString('fr-CD', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            });
            return (
              <View style={styles.txRow}>
                <TxIcon kind={tx.kind} />
                <View style={styles.txMid}>
                  <Text style={styles.txTitle}>{KIND_LABEL[tx.kind] ?? tx.kind}</Text>
                  <Text style={styles.txDate}>{date}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={[styles.txAmount, { color: isCredit ? Colors.growth : Colors.charcoal }]}>
                    {isCredit ? '+' : '-'} {fmt(tx.amount)}
                  </Text>
                  <Text style={[styles.txBadge, { color: isCredit ? Colors.growth : Colors.danger }]}>
                    {isCredit ? 'CRÉDIT' : 'DÉBIT'}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
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
  },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white, flex: 1, textAlign: 'center' },

  filtersWrap: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  filterRow: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, gap: Spacing.two, flexDirection: 'row', alignItems: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.coolGray,
    backgroundColor: Colors.white,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipLabel: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.steelGray },
  chipLabelActive: { color: Colors.white },
  chipDivider: { width: 1, height: 20, backgroundColor: Colors.coolGray, marginHorizontal: Spacing.one },

  separator: { height: 1, backgroundColor: Colors.coolGray, marginLeft: Spacing.four + 46 + Spacing.three },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: Colors.white },
  txMid: { flex: 1 },
  txTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },
  txDate: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray, marginTop: 3 },
  txRight: { alignItems: 'flex-end', gap: 3 },
  txAmount: { fontFamily: Fonts.bold, fontSize: 14 },
  txBadge: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.5 },

  empty: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.steelGray, textAlign: 'center', marginTop: 60 },
});
