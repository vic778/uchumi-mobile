import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/back-button';
import { Colors, Fonts, Spacing } from '@/constants';
import { getWithdrawals, approveWithdrawal, rejectWithdrawal, type AdminWithdrawal } from '@/services/admin';


const CURRENCY   = 'CDF';
const fmt  = (n: number) => n.toLocaleString('fr-CD');
const fmtD = (s: string) => new Date(s).toLocaleDateString('fr-CD', { day: '2-digit', month: 'short' });

export default function AdminWithdrawalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData]         = useState<{ pending: AdminWithdrawal[]; recent: AdminWithdrawal[] }>({ pending: [], recent: [] });
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting, setActing]     = useState<number | null>(null);

  const load = useCallback(async () => {
    try { setData(await getWithdrawals()); } catch {}
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleApprove = (txn: AdminWithdrawal) => {
    Alert.alert(
      'Approuver le retrait',
      `Approuver le retrait de ${fmt(txn.amount)} ${CURRENCY} pour ${txn.member.full_name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver', onPress: async () => {
            setActing(txn.id);
            try { await approveWithdrawal(txn.id); await load(); }
            catch (e: any) { Alert.alert('Erreur', e.message); }
            finally { setActing(null); }
          },
        },
      ],
    );
  };

  const handleReject = (txn: AdminWithdrawal) => {
    Alert.alert(
      'Refuser le retrait',
      `Refuser le retrait de ${fmt(txn.amount)} ${CURRENCY} pour ${txn.member.full_name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser', style: 'destructive', onPress: async () => {
            setActing(txn.id);
            try { await rejectWithdrawal(txn.id); await load(); }
            catch (e: any) { Alert.alert('Erreur', e.message); }
            finally { setActing(null); }
          },
        },
      ],
    );
  };

  if (loading) return (
    <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator color={Colors.primary} />
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Retraits</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.six }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

        {/* Pending */}
        <Text style={styles.sectionTitle}>EN ATTENTE D'APPROBATION</Text>
        {data.pending.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Aucun retrait en attente.</Text>
          </View>
        )}
        {data.pending.map((txn) => (
          <View key={txn.id} style={styles.txCard}>
            <View style={styles.txTop}>
              <View style={styles.initials}>
                <Text style={styles.initialsText}>{txn.member.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{txn.member.full_name}</Text>
                <Text style={styles.ref}>{txn.reference} · {fmtD(txn.created_at)}</Text>
              </View>
              <Text style={styles.amount}>{fmt(txn.amount)} {CURRENCY}</Text>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnReject]}
                onPress={() => handleReject(txn)}
                disabled={acting === txn.id}
                activeOpacity={0.85}>
                <Text style={[styles.btnText, { color: Colors.danger }]}>Refuser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnApprove]}
                onPress={() => handleApprove(txn)}
                disabled={acting === txn.id}
                activeOpacity={0.85}>
                <Text style={[styles.btnText, { color: Colors.white }]}>Approuver</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Recent */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.three }]}>TRAITÉS RÉCEMMENT</Text>
        {data.recent.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Aucun retrait traité.</Text>
          </View>
        )}
        {data.recent.map((txn) => {
          const isApproved = txn.status === 'approved';
          const isRejected = txn.status === 'rejected';
          return (
            <View key={txn.id} style={[styles.txCard, styles.txCardMuted]}>
              <View style={styles.txTop}>
                <View style={styles.initials}>
                  <Text style={styles.initialsText}>{txn.member.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{txn.member.full_name}</Text>
                  <Text style={styles.ref}>{txn.reference} · {fmtD(txn.created_at)}</Text>
                  {txn.collector && <Text style={styles.meta}>Collecteur : {txn.collector.full_name}</Text>}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.amount}>{fmt(txn.amount)} {CURRENCY}</Text>
                  <View style={[styles.statusBadge, {
                    backgroundColor: isApproved ? Colors.growth + '22' : isRejected ? Colors.danger + '22' : Colors.warning + '22'
                  }]}>
                    <Text style={[styles.statusText, {
                      color: isApproved ? Colors.growth : isRejected ? Colors.danger : Colors.warning
                    }]}>
                      {isApproved ? 'Approuvé' : isRejected ? 'Refusé' : txn.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, flex: 1, textAlign: 'center' },
  scroll: { padding: Spacing.four, gap: Spacing.two },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 11, color: Colors.steelGray, letterSpacing: 0.8, marginBottom: Spacing.one },
  emptyCard: { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.four, borderWidth: 1, borderColor: Colors.coolGray, alignItems: 'center' },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray },

  txCard: { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.three, borderWidth: 1, borderColor: Colors.coolGray, gap: Spacing.two },
  txCardMuted: { opacity: 0.9 },
  txTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  initials: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.primary },
  memberName: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },
  ref:  { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  meta: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray },
  amount: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.charcoal },
  statusBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
  statusText: { fontFamily: Fonts.bold, fontSize: 11 },

  actionsRow: { flexDirection: 'row', gap: Spacing.two },
  btn:       { flex: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1.5 },
  btnReject:  { borderColor: Colors.danger + '50', backgroundColor: Colors.danger + '10' },
  btnApprove: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  btnText:   { fontFamily: Fonts.bold, fontSize: 14 },
});
