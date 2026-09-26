import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '@/constants';
import { getWithdrawals, disburseWithdrawal, type CollectorWithdrawal } from '@/services/collector';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;

export default function CollectorWithdrawalsScreen() {
  const insets = useSafeAreaInsets();
  const [pending, setPending]   = useState<CollectorWithdrawal[]>([]);
  const [approved, setApproved] = useState<CollectorWithdrawal[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disbursing, setDisbursing] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await getWithdrawals();
      setPending(res.pending);
      setApproved(res.approved);
    } catch {}
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleDisburse = (txn: CollectorWithdrawal) => {
    Alert.alert(
      'Décaisser le retrait',
      `Décaisser ${fmt(txn.amount)} pour ${txn.member} ?\n\nRéf. ${txn.reference}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer', onPress: async () => {
            setDisbursing(txn.id);
            try {
              await disburseWithdrawal(txn.id);
              await load();
            } catch (e: any) {
              Alert.alert('Erreur', e.message);
            } finally {
              setDisbursing(null);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.headerTitle}>Retraits</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

          {/* Approved — ready to disburse */}
          <Text style={styles.sectionTitle}>À DÉCAISSER ({approved.length})</Text>
          <View style={styles.card}>
            {approved.length === 0 ? (
              <Text style={styles.emptyText}>Aucun retrait approuvé en attente.</Text>
            ) : (
              approved.map((txn, i) => (
                <WithdrawalRow
                  key={txn.id}
                  txn={txn}
                  last={i === approved.length - 1}
                  action={{ label: 'Décaisser', color: Colors.primary, onPress: () => handleDisburse(txn), loading: disbursing === txn.id }}
                />
              ))
            )}
          </View>

          {/* My pending */}
          <Text style={styles.sectionTitle}>MES DEMANDES EN ATTENTE ({pending.length})</Text>
          <View style={styles.card}>
            {pending.length === 0 ? (
              <Text style={styles.emptyText}>Aucune demande en attente.</Text>
            ) : (
              pending.map((txn, i) => (
                <WithdrawalRow key={txn.id} txn={txn} last={i === pending.length - 1} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function WithdrawalRow({ txn, last, action }: {
  txn: CollectorWithdrawal;
  last: boolean;
  action?: { label: string; color: string; onPress: () => void; loading: boolean };
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{txn.member}</Text>
        <Text style={styles.rowPhone}>{txn.phone}</Text>
        <Text style={styles.rowRef}>{txn.reference}</Text>
        {txn.notes ? <Text style={styles.rowNotes}>{txn.notes}</Text> : null}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <Text style={styles.rowAmount}>{fmt(txn.amount)}</Text>
        {action && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: action.color }]}
            onPress={action.onPress}
            disabled={action.loading}
            activeOpacity={0.8}>
            <Text style={styles.actionLabel}>{action.loading ? '...' : action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
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
  rowPhone: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  rowRef: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  rowNotes: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray, fontStyle: 'italic' },
  rowAmount: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.charcoal },
  actionBtn: { borderRadius: 8, paddingHorizontal: Spacing.two, paddingVertical: 6 },
  actionLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.white },
});
