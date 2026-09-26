import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MemberTabBar } from '@/components/navigation/member-tab-bar';
import { Colors, Fonts, Spacing } from '@/constants';
import { getTransactions } from '@/services/member/account';
import type { Transaction } from '@/types';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;
const KIND_LABELS: Record<string, string> = {
  deposit: 'Dépôt', withdrawal: 'Retrait',
  loan_disbursement: 'Décaissement prêt', loan_payment: 'Remboursement prêt',
};

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
        <Text style={styles.title}>Historique</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.charcoal} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(t) => String(t.id)}
          contentContainerStyle={{ paddingHorizontal: Spacing.four, paddingBottom: 120 }}
          renderItem={({ item }) => <TxRow tx={item} />}
          ListEmptyComponent={<Text style={styles.empty}>Aucune transaction</Text>}
          showsVerticalScrollIndicator={false}
        />
      )}
      <MemberTabBar active="dashboard" />
    </View>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const isCredit = tx.kind === 'deposit' || tx.kind === 'loan_disbursement';
  const date = new Date(tx.created_at).toLocaleDateString('fr-CD', { day: '2-digit', month: 'short', year: 'numeric' });
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: isCredit ? Colors.growth : Colors.danger }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.kind}>{KIND_LABELS[tx.kind] ?? tx.kind}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text style={[styles.amount, { color: isCredit ? Colors.growth : Colors.danger }]}>
        {isCredit ? '+' : '-'}{fmt(tx.amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  title: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.charcoal },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.two,
    backgroundColor: Colors.white, borderRadius: 12, padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  kind: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal },
  date: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray, marginTop: 2 },
  amount: { fontFamily: Fonts.bold, fontSize: 14 },
  empty: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', marginTop: 40 },
});
