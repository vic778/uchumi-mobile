import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBadge } from '@/components/ui/status-badge';
import { BackButton } from '@/components/ui/back-button';
import { AuthPrimaryButton } from '@/components/auth/shell';
import { Colors, Fonts, Spacing } from '@/constants';
import { getLoan, agreeLoan } from '@/services/member/loans';
import type { Loan } from '@/types';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreeing, setAgreeing] = useState(false);

  const load = () => getLoan(Number(id)).then(setLoan).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const handleAgree = async () => {
    if (!loan) return;
    setAgreeing(true);
    try {
      const updated = await agreeLoan(loan.id);
      setLoan(updated);
      Alert.alert('Accepté', 'Vous avez accepté les conditions du prêt.');
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setAgreeing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.title}>Détail du prêt</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.charcoal} style={{ marginTop: 40 }} />
      ) : !loan ? (
        <Text style={styles.error}>Prêt introuvable</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Montant du prêt</Text>
            <Text style={styles.amount}>{fmt(loan.amount)}</Text>
            <StatusBadge status={loan.status} />
          </View>

          <View style={styles.card}>
            <Row label="Référence" value={loan.reference} />
            <Row label="Durée" value={`${loan.months} mois`} />
            <Row label="Remboursé" value={fmt(loan.amount_paid)} />
            <Row label="Restant" value={fmt(loan.remaining)} />
            <Row label="Demandé le" value={new Date(loan.created_at).toLocaleDateString('fr-CD')} />
          </View>

          {loan.remaining > 0 && loan.amount_paid >= 0 && (
            <View style={styles.progressWrap}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.round((loan.amount_paid / loan.amount) * 100)}%` as any }]} />
              </View>
              <Text style={styles.progressPct}>{Math.round((loan.amount_paid / loan.amount) * 100)}% remboursé</Text>
            </View>
          )}

          {loan.status === 'approved' && !loan.agreed_at && (
            <AuthPrimaryButton label="Accepter les conditions" onPress={handleAgree} loading={agreeing} variant="green" />
          )}
        </ScrollView>
      )}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  title: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, flex: 1, textAlign: 'center' },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  amountCard: { backgroundColor: Colors.charcoal, borderRadius: 20, padding: Spacing.four, gap: Spacing.two },
  amountLabel: { fontFamily: Fonts.regular, fontSize: 15, color: 'rgba(255,255,255,0.6)' },
  amount: { fontFamily: Fonts.bold, fontSize: 32, color: Colors.white },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.three },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.two, borderBottomWidth: 1, borderBottomColor: Colors.muted },
  rowLabel: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.steelGray },
  rowValue: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.charcoal },
  progressWrap: { gap: Spacing.one },
  progressBar: { height: 8, backgroundColor: Colors.coolGray, borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: Colors.green, borderRadius: 4 },
  progressPct: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'right' },
  error: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.danger, textAlign: 'center', marginTop: 40 },
});
