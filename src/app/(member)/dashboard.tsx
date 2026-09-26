import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MemberTabBar } from '@/components/navigation/member-tab-bar';
import { Colors, Fonts, Routes, Spacing } from '@/constants';
import { getAccount, getTransactions } from '@/services/member/account';
import type { Account, Transaction } from '@/types';
import { UchumiLogo } from '@/components/ui/uchumi-logo';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;

export default function MemberDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAccount(), getTransactions()])
      .then(([acc, txs]) => { setAccount(acc); setTransactions(txs.slice(0, 5)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.three }]}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <UchumiLogo style={{ width: 80, height: 26 }} />
          <TouchableOpacity onPress={() => router.push(Routes.memberNotifications as any)} style={styles.bellBtn}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.charcoal} style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Balance card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Solde épargne</Text>
              <Text style={styles.balance}>{fmt(account?.balance ?? 0)}</Text>
              {account?.savings_plan && (
                <View style={styles.planRow}>
                  <Text style={styles.planText}>{account.savings_plan.name}</Text>
                  <Text style={styles.planFreq}>{account.savings_plan.frequency === 'daily' ? 'Quotidien' : account.savings_plan.frequency === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}</Text>
                </View>
              )}
            </View>

            {/* Quick actions */}
            <View style={styles.actionsRow}>
              <QuickAction icon="💳" label="Prêt" onPress={() => router.push(Routes.memberLoans as any)} />
              <QuickAction icon="💸" label="Retrait" onPress={() => router.push(Routes.memberWithdrawals as any)} />
              <QuickAction icon="📄" label="Documents" onPress={() => router.push(Routes.memberDocuments as any)} />
              <QuickAction icon="📊" label="Historique" onPress={() => router.push(Routes.memberTransactions as any)} />
            </View>

            {/* Recent transactions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Transactions récentes</Text>
                <TouchableOpacity onPress={() => router.push(Routes.memberTransactions as any)}>
                  <Text style={styles.seeAll}>Tout voir</Text>
                </TouchableOpacity>
              </View>
              {transactions.length === 0 ? (
                <Text style={styles.emptyText}>Aucune transaction pour le moment</Text>
              ) : (
                transactions.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
              )}
            </View>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <MemberTabBar active="dashboard" />
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.actionIcon}><Text style={styles.actionEmoji}>{icon}</Text></View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isCredit = tx.kind === 'deposit' || tx.kind === 'loan_disbursement';
  const kindLabel: Record<string, string> = {
    deposit: 'Dépôt', withdrawal: 'Retrait',
    loan_disbursement: 'Décaissement prêt', loan_payment: 'Remboursement',
  };
  const date = new Date(tx.created_at).toLocaleDateString('fr-CD', { day: '2-digit', month: 'short' });

  return (
    <View style={styles.txRow}>
      <View style={[styles.txDot, { backgroundColor: isCredit ? Colors.growth : Colors.danger }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.txLabel}>{kindLabel[tx.kind] ?? tx.kind}</Text>
        <Text style={styles.txDate}>{date}</Text>
      </View>
      <Text style={[styles.txAmount, { color: isCredit ? Colors.growth : Colors.danger }]}>
        {isCredit ? '+' : '-'}{fmt(tx.amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.four },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.four },
  bellBtn: { padding: Spacing.two },
  bellIcon: { fontSize: 22 },
  card: {
    backgroundColor: Colors.charcoal, borderRadius: 20, padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  cardLabel: { fontFamily: Fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: Spacing.one },
  balance: { fontFamily: Fonts.bold, fontSize: 32, color: Colors.white, marginBottom: Spacing.two },
  planRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  planText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.green },
  planFreq: { fontFamily: Fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  actionsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  actionItem: { alignItems: 'center', gap: Spacing.one, flex: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.coolGray, alignItems: 'center', justifyContent: 'center' },
  actionEmoji: { fontSize: 20 },
  actionLabel: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.charcoal, textAlign: 'center' },
  section: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.three },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.three },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.charcoal },
  seeAll: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.charcoal, textDecorationLine: 'underline' },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.three },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two, borderBottomWidth: 1, borderBottomColor: Colors.muted },
  txDot: { width: 8, height: 8, borderRadius: 4 },
  txLabel: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal },
  txDate: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  txAmount: { fontFamily: Fonts.bold, fontSize: 14 },
});
