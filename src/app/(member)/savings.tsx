import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MemberTabBar } from '@/components/navigation/member-tab-bar';
import { Colors, Fonts, Spacing } from '@/constants';
import { getAccount } from '@/services/member/account';
import type { Account } from '@/types';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;
const FREQ: Record<string, string> = { daily: 'Quotidien', weekly: 'Hebdomadaire', monthly: 'Mensuel' };

export default function SavingsScreen() {
  const insets = useSafeAreaInsets();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccount().then(setAccount).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
        <Text style={styles.title}>Mon épargne</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.charcoal} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balance}>{fmt(account?.balance ?? 0)}</Text>
            <Text style={styles.since}>Membre depuis {account?.member_since ? new Date(account.member_since).toLocaleDateString('fr-CD', { month: 'long', year: 'numeric' }) : '—'}</Text>
          </View>

          {account?.savings_plan ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Plan actif</Text>
              <InfoRow label="Nom" value={account.savings_plan.name} />
              <InfoRow label="Fréquence" value={FREQ[account.savings_plan.frequency] ?? account.savings_plan.frequency} />
              <InfoRow label="Montant" value={fmt(account.savings_plan.amount)} />
              <InfoRow label="Statut" value={account.savings_plan.status} />
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.emptyText}>Aucun plan d'épargne actif. Contactez un collecteur pour en ouvrir un.</Text>
            </View>
          )}
        </ScrollView>
      )}
      <MemberTabBar active="savings" />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  title: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.charcoal },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: 120 },
  balanceCard: { backgroundColor: Colors.charcoal, borderRadius: 20, padding: Spacing.four, marginBottom: Spacing.three },
  balanceLabel: { fontFamily: Fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  balance: { fontFamily: Fonts.bold, fontSize: 36, color: Colors.white, marginBottom: 4 },
  since: { fontFamily: Fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  cardTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.charcoal, marginBottom: Spacing.one },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.one, borderBottomWidth: 1, borderBottomColor: Colors.muted },
  infoLabel: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray },
  infoValue: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.two },
});
