import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MemberTabBar } from '@/components/navigation/member-tab-bar';
import { StatusBadge } from '@/components/ui/status-badge';
import { Colors, Fonts, Spacing } from '@/constants';
import { getWithdrawals } from '@/services/member/withdrawals';
import type { Withdrawal } from '@/types';

const fmt = (n: number) => n.toLocaleString('fr-CD') + ' CDF';

export default function WithdrawalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [items, setItems] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWithdrawals().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
        <Text style={styles.title}>Retraits</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/(member)/withdrawals/new' as any)}>
          <Text style={styles.newLabel}>+ Nouveau</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color={Colors.charcoal} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={items}
          keyExtractor={(w) => String(w.id)}
          contentContainerStyle={{ paddingHorizontal: Spacing.four, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.amount}>{fmt(item.amount)}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('fr-CD', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucune demande de retrait</Text>}
          showsVerticalScrollIndicator={false}
        />
      )}
      <MemberTabBar active="dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.charcoal },
  newBtn: { backgroundColor: Colors.charcoal, borderRadius: 20, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one + 2 },
  newLabel: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.three, marginBottom: Spacing.two },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.one },
  amount: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.charcoal },
  date: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.steelGray },
  empty: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.steelGray, textAlign: 'center', marginTop: 40 },
});
