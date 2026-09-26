import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.headerTitle}>Mon épargne</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.four }]}
          showsVerticalScrollIndicator={false}>

          <View style={styles.accountCard}>
            <View>
              <Text style={styles.accountTitle}>Solde disponible</Text>
              {account?.member_since && (
                <Text style={styles.accountSub}>
                  Membre depuis {new Date(account.member_since).toLocaleDateString('fr-CD', { month: 'long', year: 'numeric' })}
                </Text>
              )}
            </View>
            <Text style={styles.balanceAmount}>{fmt(account?.balance ?? 0)}</Text>
          </View>

          {account?.savings_plan ? (
            <>
              <Text style={styles.sectionLabel}>MON PLAN D'ÉPARGNE</Text>
              <View style={styles.card}>
                <InfoRow label="Nom du plan" value={account.savings_plan.name} />
                <InfoRow label="Fréquence" value={FREQ[account.savings_plan.frequency] ?? account.savings_plan.frequency} />
                <InfoRow label="Montant cible" value={fmt(account.savings_plan.amount)} />
                <InfoRow label="Statut" value={account.savings_plan.active ? 'Actif' : 'Inactif'} last />
              </View>
            </>
          ) : (
            <View style={styles.card}>
              <Text style={styles.emptyText}>Aucun plan d'épargne actif. Contactez un collecteur pour en créer un.</Text>
            </View>
          )}
        </ScrollView>
      )}

    </View>
  );
}

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  accountCard: { backgroundColor: Colors.cardBlue, borderRadius: 16, padding: Spacing.four, marginBottom: Spacing.four, gap: Spacing.three, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
  accountTitle: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.white },
  accountSub: { fontFamily: Fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  balanceAmount: { fontFamily: Fonts.bold, fontSize: 32, color: Colors.white, letterSpacing: 0.5 },
  sectionLabel: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.primary, letterSpacing: 0.8, marginBottom: Spacing.two, paddingHorizontal: 2 },
  card: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.coolGray },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  infoLabel: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.steelGray },
  infoValue: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.charcoal },
  emptyText: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.steelGray, textAlign: 'center', padding: Spacing.four },
});
