import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '@/constants';
import { getLoans, repayLoan, type CollectorLoan } from '@/services/collector';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;

export default function CollectorLoansScreen() {
  const insets = useSafeAreaInsets();
  const [toDisburse, setToDisburse] = useState<CollectorLoan[]>([]);
  const [active, setActive]         = useState<CollectorLoan[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [repayId, setRepayId]       = useState<string | null>(null);
  const [repayAmount, setRepayAmount] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await getLoans();
      setToDisburse(res.to_disburse);
      setActive(res.active);
    } catch {}
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleRepay = (loan: CollectorLoan) => {
    setRepayId(loan.reference);
    setRepayAmount('');
  };

  const submitRepay = async (ref: string) => {
    const amount = parseInt(repayAmount.replace(/\D/g, ''), 10);
    if (!amount || amount <= 0) { Alert.alert('Erreur', 'Montant invalide'); return; }
    try {
      await repayLoan(ref, amount);
      setRepayId(null);
      await load();
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.headerTitle}>Prêts</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

          <Text style={styles.sectionTitle}>À DÉBLOQUER ({toDisburse.length})</Text>
          <View style={styles.card}>
            {toDisburse.length === 0 ? (
              <Text style={styles.emptyText}>Aucun prêt en attente de décaissement.</Text>
            ) : (
              toDisburse.map((loan, i) => (
                <LoanRow key={loan.id} loan={loan} last={i === toDisburse.length - 1} />
              ))
            )}
          </View>

          <Text style={styles.sectionTitle}>PRÊTS ACTIFS — MES DÉBOURSEMENTS ({active.length})</Text>
          <View style={styles.card}>
            {active.length === 0 ? (
              <Text style={styles.emptyText}>Aucun prêt actif déboursé par vous.</Text>
            ) : (
              active.map((loan, i) => (
                <View key={loan.id}>
                  <LoanRow
                    loan={loan}
                    last={i === active.length - 1 && repayId !== loan.reference}
                    action={{ label: 'Rembourser', onPress: () => handleRepay(loan) }}
                  />
                  {repayId === loan.reference && (
                    <View style={styles.repayForm}>
                      <TextInput
                        style={styles.repayInput}
                        placeholder="Montant à rembourser"
                        placeholderTextColor={Colors.iconMuted}
                        keyboardType="numeric"
                        value={repayAmount}
                        onChangeText={setRepayAmount}
                        autoFocus
                      />
                      <View style={styles.repayActions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setRepayId(null)}>
                          <Text style={styles.cancelLabel}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmBtn} onPress={() => submitRepay(loan.reference)}>
                          <Text style={styles.confirmLabel}>Confirmer</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function LoanRow({ loan, last, action }: {
  loan: CollectorLoan;
  last: boolean;
  action?: { label: string; onPress: () => void };
}) {
  const pct = loan.amount > 0 ? Math.round((1 - loan.outstanding_amount / loan.amount) * 100) : 100;
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{loan.member}</Text>
        <Text style={styles.rowRef}>{loan.reference}</Text>
        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.rowSub}>
          Restant : {fmt(loan.outstanding_amount)} / {fmt(loan.amount)}
        </Text>
      </View>
      {action && (
        <TouchableOpacity style={styles.actionBtn} onPress={action.onPress} activeOpacity={0.8}>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.white },

  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.six },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.steelGray, letterSpacing: 0.8, marginBottom: Spacing.two },
  card: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.coolGray, marginBottom: Spacing.four },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.three },

  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  rowName: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal },
  rowRef: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  rowSub: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray, marginTop: 2 },
  progressWrap: { height: 4, backgroundColor: Colors.coolGray, borderRadius: 2, marginTop: 4, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: Colors.green, borderRadius: 2 },
  actionBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: Spacing.two, paddingVertical: 6, alignSelf: 'center' },
  actionLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.white },

  repayForm: { backgroundColor: '#f0f9ff', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, gap: Spacing.two },
  repayInput: { backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.primary, paddingHorizontal: Spacing.two, paddingVertical: 10, fontFamily: Fonts.regular, fontSize: 15, color: Colors.charcoal },
  repayActions: { flexDirection: 'row', gap: Spacing.two },
  cancelBtn: { flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.muted, paddingVertical: 10, alignItems: 'center' },
  cancelLabel: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.steelGray },
  confirmBtn: { flex: 1, borderRadius: 10, backgroundColor: Colors.primary, paddingVertical: 10, alignItems: 'center' },
  confirmLabel: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.white },
});
