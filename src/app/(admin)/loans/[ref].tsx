import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/back-button';
import { LoanTimeline } from '@/components/admin/loan-timeline';
import { LoanActionsCard } from '@/components/admin/loan-actions';
import { Colors, Fonts, Spacing } from '@/constants';
import { getLoan, approveLoan, fundLoan, rejectLoan, repayLoan, type AdminLoanDetail } from '@/services/admin';

const ADMIN_DARK  = '#0f172a';
const fmt  = (n: number) => n.toLocaleString('fr-CD');
const fmtD = (s: string) => new Date(s).toLocaleDateString('fr-CD', { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_COLORS: Record<string, string> = {
  pending:       '#f59e0b',
  offer_sent:    '#a78bfa',
  member_agreed: '#60a5fa',
  approved:      Colors.primary,
  active:        Colors.green,
  repaid:        Colors.growth,
  rejected:      Colors.danger,
};

const STATUS_LABELS: Record<string, string> = {
  pending:       'En attente',
  offer_sent:    'Offre envoyée',
  member_agreed: 'Accord membre',
  approved:      'Approuvé',
  active:        'Actif',
  repaid:        'Remboursé',
  rejected:      'Rejeté',
};

export default function AdminLoanDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ref } = useLocalSearchParams<{ ref: string }>();
  const [loan, setLoan]       = useState<AdminLoanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [repayAmount, setRepayAmount] = useState('');

  const load = useCallback(async () => {
    try { setLoan(await getLoan(ref)); } catch {}
  }, [ref]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const doAction = async (fn: () => Promise<void>) => {
    setActing(true);
    try { await fn(); await load(); }
    catch (e: any) { Alert.alert('Erreur', e.message); }
    finally { setActing(false); }
  };

  if (loading) return (
    <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator color={Colors.primary} />
    </View>
  );

  const l      = loan!;
  const color  = STATUS_COLORS[l.status] ?? Colors.steelGray;
  const pctPaid = l.outstanding_amount > 0 && l.amount > 0
    ? Math.round(((l.amount - l.outstanding_amount) / l.amount) * 100)
    : l.status === 'repaid' ? 100 : 0;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Prêt</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.six }]} showsVerticalScrollIndicator={false}>
        {/* Info card */}
        <View style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.initials}>
              <Text style={styles.initialsText}>{l.member.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{l.member.full_name}</Text>
              <Text style={styles.memberPhone}>{l.member.phone_number}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
              <Text style={[styles.statusText, { color }]}>{STATUS_LABELS[l.status] ?? l.status}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.amountRow}>
            <View>
              <Text style={styles.amountLabel}>Montant demandé</Text>
              <Text style={styles.amountValue}>{fmt(l.amount)} CDF</Text>
            </View>
            {l.outstanding_amount > 0 && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amountLabel}>Restant dû</Text>
                <Text style={[styles.amountValue, { color: Colors.danger }]}>{fmt(l.outstanding_amount)} CDF</Text>
              </View>
            )}
          </View>
          <Text style={styles.ref}>{l.reference} · {fmtD(l.created_at)}</Text>
          {l.notes && <Text style={styles.notes}>📝 {l.notes}</Text>}
          {l.status === 'active' && (
            <View style={styles.progressWrap}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${pctPaid}%` }]} />
              </View>
              <Text style={styles.progressLabel}>{pctPaid}% remboursé</Text>
            </View>
          )}
        </View>

        {/* Installment schedule */}
        {l.installments.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>ÉCHÉANCIER</Text>
            {l.installments.map((inst, i) => (
              <View key={inst.id} style={styles.installRow}>
                <View style={[styles.installDot, { backgroundColor: inst.paid ? Colors.growth : Colors.coolGray }]} />
                <Text style={styles.installNum}>#{i + 1}</Text>
                <Text style={styles.installDate}>{inst.due_date ? fmtD(inst.due_date) : '—'}</Text>
                <View style={{ flex: 1 }} />
                <Text style={[styles.installAmt, inst.paid && { color: Colors.growth }]}>{fmt(inst.amount)} CDF</Text>
                {inst.paid && <Text style={styles.installPaid}>✓</Text>}
              </View>
            ))}
          </View>
        )}

        <LoanTimeline logs={l.logs} disbursedAmount={l.disbursed_amount} />

        <LoanActionsCard
          status={l.status}
          acting={acting}
          rejectNotes={rejectNotes}
          repayAmount={repayAmount}
          onRejectNotesChange={setRejectNotes}
          onRepayAmountChange={setRepayAmount}
          onApprove={() => Alert.alert('Approuver', 'Approuver ce prêt ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Approuver', onPress: () => doAction(() => approveLoan(ref)) },
          ])}
          onFund={() => Alert.alert('Décaisser', 'Décaisser les fonds pour ce prêt ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Décaisser', onPress: () => doAction(() => fundLoan(ref)) },
          ])}
          onReject={() => Alert.alert('Refuser', 'Refuser ce prêt ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Refuser', style: 'destructive', onPress: () => doAction(() => rejectLoan(ref, rejectNotes || undefined)) },
          ])}
          onRepay={() => Alert.alert('Remboursement', `Enregistrer ${repayAmount} CDF ?`, [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Confirmer', onPress: () => doAction(() => repayLoan(ref, Number(repayAmount))) },
          ])}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: Colors.background },
  header:       { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  headerTitle:  { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, flex: 1, textAlign: 'center' },
  scroll:       { padding: Spacing.four, gap: Spacing.three },
  card:         { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.three, borderWidth: 1, borderColor: Colors.coolGray, gap: Spacing.two },
  topRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  initials:     { width: 48, height: 48, borderRadius: 24, backgroundColor: ADMIN_DARK + '12', alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontFamily: Fonts.bold, fontSize: 18, color: ADMIN_DARK },
  memberName:   { fontFamily: Fonts.bold, fontSize: 16, color: Colors.charcoal },
  memberPhone:  { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray },
  statusBadge:  { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:   { fontFamily: Fonts.bold, fontSize: 11, textTransform: 'uppercase' },
  divider:      { height: 1, backgroundColor: Colors.coolGray },
  amountRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  amountLabel:  { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  amountValue:  { fontFamily: Fonts.bold, fontSize: 20, color: Colors.charcoal },
  ref:          { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray },
  notes:        { fontFamily: Fonts.regular, fontSize: 13, color: Colors.charcoal, backgroundColor: Colors.coolGray, borderRadius: 8, padding: Spacing.two },
  progressWrap: { gap: 4 },
  progressBg:   { height: 6, backgroundColor: Colors.coolGray, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: Colors.green, borderRadius: 3 },
  progressLabel:{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  sectionLabel: { fontFamily: Fonts.bold, fontSize: 11, color: Colors.steelGray, letterSpacing: 0.8 },
  installRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  installDot:   { width: 8, height: 8, borderRadius: 4 },
  installNum:   { fontFamily: Fonts.bold, fontSize: 12, color: Colors.steelGray, width: 22 },
  installDate:  { fontFamily: Fonts.regular, fontSize: 13, color: Colors.charcoal },
  installAmt:   { fontFamily: Fonts.bold, fontSize: 13, color: Colors.charcoal },
  installPaid:  { fontFamily: Fonts.bold, fontSize: 13, color: Colors.growth },
});
