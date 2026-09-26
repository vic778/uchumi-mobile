import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MemberTabBar } from '@/components/navigation/member-tab-bar';
import { StatusBadge } from '@/components/ui/status-badge';
import { Colors, Fonts, Routes, Spacing } from '@/constants';
import { getLoans } from '@/services/member/loans';
import type { Loan } from '@/types';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;

export default function LoansScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLoans().then(setLoans).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
        <Text style={styles.title}>Mes prêts</Text>
        <TouchableOpacity style={styles.applyBtn} onPress={() => router.push('/(member)/loans/apply' as any)}>
          <Text style={styles.applyLabel}>+ Demander</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.charcoal} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(l) => String(l.id)}
          contentContainerStyle={{ paddingHorizontal: Spacing.four, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/(member)/loans/${item.id}` as any)} activeOpacity={0.8}>
              <View style={styles.cardTop}>
                <Text style={styles.ref}>{item.reference}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.amount}>{fmt(item.amount)}</Text>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Remboursé</Text>
                <Text style={styles.progressValue}>{fmt(item.amount_paid)} / {fmt(item.amount)}</Text>
              </View>
              {item.remaining > 0 && (
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.round((item.amount_paid / item.amount) * 100)}%` as any }]} />
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>Aucun prêt</Text>
              <Text style={styles.emptyText}>Appuyez sur « Demander » pour faire votre première demande.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
      <MemberTabBar active="loans" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.charcoal },
  applyBtn: { backgroundColor: Colors.charcoal, borderRadius: 20, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one + 2 },
  applyLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.white },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.three, marginBottom: Spacing.two },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.one },
  ref: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.steelGray },
  amount: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.charcoal, marginBottom: Spacing.two },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.one },
  progressLabel: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  progressValue: { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.charcoal },
  progressBar: { height: 6, backgroundColor: Colors.coolGray, borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: Colors.green, borderRadius: 3 },
  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: Spacing.two },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.charcoal },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', paddingHorizontal: Spacing.five },
});
